# Module 8 Backend API Testing

Module 8 gives each seller a private order queue, atomic status transitions, cash collection, status history, and daily dashboard metrics.

## 1. Start and log in as the seller

```bash
npm run dev
```

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identity":"YOUR_SELLER_EMAIL_OR_PHONE","password":"YOUR_PASSWORD","rememberMe":false}'
```

Copy `data.accessToken` as `SELLER_ACCESS_TOKEN`. The queue contains only orders for this seller's outlet.

## 2. List and filter orders

```bash
curl "http://localhost:4000/api/seller/orders?page=1&limit=20" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN"
```

Supported filters:

```text
status=PENDING|ACCEPTED|PREPARING|READY|COMPLETED|REJECTED|CANCELLED
orderType=INSTANT|PREORDER
deliveryType=PICKUP|DELIVERY
paymentStatus=PENDING|PAID
search=ORDER_NUMBER_OR_CUSTOMER
scheduledFrom=UTC_ISO_TIMESTAMP
scheduledTo=UTC_ISO_TIMESTAMP
```

Example:

```bash
curl "http://localhost:4000/api/seller/orders?status=PENDING&deliveryType=PICKUP" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN"
```

## 3. Get order detail and history

```bash
curl "http://localhost:4000/api/seller/orders/ORDER_ID" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN"
```

Expected: snapshot customer/contact, items, totals, schedule/address, payment, status timestamps, and chronological `statusHistory`. An order belonging to another seller returns `404 ORDER_NOT_FOUND`.

## 4. Process the complete seller flow

Each request must follow the current database state exactly:

```bash
curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"ACCEPTED"}'

curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"PREPARING"}'

curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"READY"}'

curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/payment-status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"paymentStatus":"PAID"}'

curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'
```

Expected flow:

```text
PENDING → ACCEPTED → PREPARING → READY → PAID → COMPLETED
```

Each status change records an audit-history row and its operational timestamp. Repeating `PAID` is safe and returns the already-paid order.

## 5. Reject a pending order

```bash
curl -X PATCH "http://localhost:4000/api/seller/orders/ORDER_ID/status" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"REJECTED"}'
```

Only `PENDING → REJECTED` is valid. Rejected and completed orders are terminal.

## 6. Dashboard metrics

```bash
curl "http://localhost:4000/api/seller/orders/summary" \
  -H "Authorization: Bearer SELLER_ACCESS_TOKEN"
```

Expected: zero-filled counts for every order status, today's order count, today's completed paid-order count, today's trusted sales in integer paise, and the configured business date (`Asia/Kolkata` by default).

## 7. Important failure tests

- Student/admin token: `403 FORBIDDEN`.
- Another seller's order: `404 ORDER_NOT_FOUND` for detail and mutation.
- Skip, reverse, or mutate a terminal status: `409 INVALID_ORDER_TRANSITION`.
- Complete before marking cash paid: `409 PAYMENT_REQUIRED`.
- Mark paid before `READY`: `409 PAYMENT_NOT_COLLECTABLE`.
- Concurrent stale status action: `409 ORDER_STATUS_CHANGED`.
- Send `CANCELLED` from a seller: `422 VALIDATION_ERROR`; user cancellation arrives in Module 9.
- Send `PENDING` to the payment endpoint: `422 VALIDATION_ERROR`; paid cash cannot be rolled back by this API.

