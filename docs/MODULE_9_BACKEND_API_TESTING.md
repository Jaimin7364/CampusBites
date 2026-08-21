# Module 9 Backend API and Socket Testing

Module 9 adds private student order history, pending-only cancellation, and authenticated real-time events. REST remains the source of truth after reconnects or missed events.

## 1. Start and log in as a student

```bash
npm run dev
```

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identity":"YOUR_STUDENT_EMAIL_OR_PHONE","password":"YOUR_PASSWORD","rememberMe":false}'
```

Copy `data.accessToken` as `USER_ACCESS_TOKEN`.

## 2. List private order history

```bash
curl "http://localhost:4000/api/orders/my?page=1&limit=20" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

Filter into the three frontend sections:

```bash
curl "http://localhost:4000/api/orders/my?group=active" -H "Authorization: Bearer USER_ACCESS_TOKEN"
curl "http://localhost:4000/api/orders/my?group=completed" -H "Authorization: Bearer USER_ACCESS_TOKEN"
curl "http://localhost:4000/api/orders/my?group=cancelled" -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

Groups are defined as:

```text
active:    PENDING, ACCEPTED, PREPARING, READY
completed: COMPLETED
cancelled: CANCELLED, REJECTED
```

Optional `search` matches the public order number or outlet snapshot. Pagination is bounded to 100 records per request.

## 3. Get private detail and status history

```bash
curl "http://localhost:4000/api/orders/ORDER_ID" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

Expected: snapshot items, totals, receiving/payment data, operational timestamps, and chronological `statusHistory`. Another student's order returns `404 ORDER_NOT_FOUND`.

## 4. Cancel a pending order

Create a new order and cancel it before the seller accepts:

```bash
curl -X PATCH "http://localhost:4000/api/orders/ORDER_ID/cancel" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

Expected: `200 OK`, `status: CANCELLED`, `cancelledAt`, and a new history entry. Only `PENDING → CANCELLED` is allowed.

Important failures:

- Another student's order: `404 ORDER_NOT_FOUND`.
- Accepted/preparing/ready/completed/rejected/cancelled order: `409 ORDER_NOT_CANCELLABLE`.
- Seller accepts at the same moment as cancellation: one atomic action wins; the stale action receives `409 ORDER_STATUS_CHANGED` or its state-specific conflict.
- Seller/admin token on student routes: `403 FORBIDDEN`.

## 5. Socket.IO authentication

The Socket.IO server uses the API origin, normally `http://localhost:4000`. Send the current access token in the handshake:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: 'USER_ACCESS_TOKEN' },
});
```

Missing, expired, refresh, malformed, inactive-user, or role-mismatched tokens receive `connect_error` with:

```json
{"code":"INVALID_TOKEN"}
```

## 6. Private rooms and events

Authenticated users automatically join only their own identity room. Subscribe to a particular owned order:

```ts
socket.emit('order:subscribe', 'ORDER_ID', (result) => console.log(result));
```

Expected owner result: `{ success: true }`. A different user or seller receives `{ success: false, code: "ORDER_NOT_FOUND" }`.

Listen for:

```ts
socket.on('order:created', ({ order }) => refetchOrders());
socket.on('order:status-changed', ({ order }) => refetchOrder(order.id));
socket.on('order:payment-changed', ({ order }) => refetchOrder(order.id));
socket.on('order:cancelled', ({ order }) => refetchOrder(order.id));
```

Events are delivered only to the owning user, owning seller, and authorized order room. Treat the event as an invalidation signal and refetch REST data. On every `connect` or reconnect, resubscribe to the open order and refetch current REST state.

## 7. Two-session manual test

1. Open one browser as a student and another as the outlet seller.
2. Connect both Socket.IO sessions with their own access tokens.
3. Student creates an order; only that student and seller receive `order:created`.
4. Seller advances `ACCEPTED → PREPARING → READY`; both authorized sessions receive status events.
5. Seller marks cash paid and completes; both receive payment/status events.
6. Connect a second unrelated student and confirm it receives none of these events and cannot subscribe to the order.

