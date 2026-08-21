# Module 7 Backend API Testing

Module 7 creates server-authoritative cash orders for instant or scheduled pickup and delivery. Complete these tests before starting the frontend.

## 1. Start the project and log in

```bash
npm run dev
```

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identity":"YOUR_STUDENT_EMAIL_OR_PHONE","password":"YOUR_PASSWORD","rememberMe":false}'
```

Copy `data.accessToken` as `USER_ACCESS_TOKEN`. Find an approved, open outlet and an available item:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&openNow=true"
curl "http://localhost:4000/api/hotels/HOTEL_ID/menu?available=true"
```

## 2. Preview before checkout

```bash
curl -X POST "http://localhost:4000/api/orders/preview" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"MENU_ITEM_ID","quantity":2}]}'
```

Expected: `200 OK` with authoritative item prices, availability, fees, and totals in integer paise.

## 3. Create an instant pickup order

Use a new key of 16–100 letters, numbers, underscores, or hyphens for each checkout attempt.

```bash
curl -X POST "http://localhost:4000/api/orders" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Idempotency-Key: pickup-checkout-0001" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"menuItemId":"MENU_ITEM_ID","quantity":2}],
    "orderType":"INSTANT",
    "deliveryType":"PICKUP"
  }'
```

Expected: `201 Created`. Save `data.order.id`. The response has a public `orderNumber`, snapshot items, `CASH`, `PENDING` payment, `PENDING` order status, and server-calculated totals.

## 4. Verify duplicate protection

Repeat the exact request above with the same student and `Idempotency-Key`.

Expected: the same order ID and order number are returned. Check MySQL or request the order detail to confirm a second order was not created. Never reuse the key for a different intended checkout.

## 5. Create an instant delivery order

```bash
curl -X POST "http://localhost:4000/api/orders" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Idempotency-Key: delivery-checkout-0001" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"menuItemId":"MENU_ITEM_ID","quantity":1}],
    "orderType":"INSTANT",
    "deliveryType":"DELIVERY",
    "deliveryAddress":"Hostel A, Room 203, Main Campus"
  }'
```

Expected: `201 Created` with the trimmed delivery-address snapshot.

## 6. Create a pre-order

Replace the sample timestamp with a future UTC ISO timestamp during the outlet's opening hours in `BUSINESS_TIME_ZONE` (default `Asia/Kolkata`).

```bash
curl -X POST "http://localhost:4000/api/orders" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Idempotency-Key: preorder-checkout-0001" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"menuItemId":"MENU_ITEM_ID","quantity":1}],
    "orderType":"PREORDER",
    "scheduledAt":"2026-08-22T07:30:00.000Z",
    "deliveryType":"PICKUP"
  }'
```

Expected: `201 Created`, with `scheduledAt` stored as UTC. A past time returns `422 INVALID_SCHEDULED_TIME`; a time outside outlet hours returns `409 HOTEL_CLOSED`.

## 7. Get the order detail

```bash
curl "http://localhost:4000/api/orders/ORDER_ID" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN"
```

Expected: `200 OK` for the owner. Another student's token receives `404 ORDER_NOT_FOUND`, which does not reveal whether the order exists.

## 8. Important failure tests

- Missing/short/invalid `Idempotency-Key`: `422 INVALID_IDEMPOTENCY_KEY`.
- Empty items or invalid quantity: `422 VALIDATION_ERROR`.
- `DELIVERY` without `deliveryAddress`: `422 VALIDATION_ERROR`.
- `PICKUP` with a delivery address: `422 VALIDATION_ERROR`.
- `PREORDER` without `scheduledAt`, or `INSTANT` with one: `422 VALIDATION_ERROR`.
- Items from different outlets: `422 MULTIPLE_HOTELS_NOT_ALLOWED`.
- Deleted item: `404 CART_ITEM_NOT_FOUND`.
- Unavailable item: `409 ITEMS_UNAVAILABLE`.
- Pending/rejected/inactive outlet or inactive university: `409 HOTEL_NOT_ORDERABLE`.
- Closed outlet at the instant or scheduled service time: `409 HOTEL_CLOSED`.
- Seller/admin token: `403 FORBIDDEN`.

Do not send price, total, user, seller, hotel, payment, or status fields as trusted checkout data. The API loads all of them from MySQL and creates the order plus snapshot items inside one database transaction.

