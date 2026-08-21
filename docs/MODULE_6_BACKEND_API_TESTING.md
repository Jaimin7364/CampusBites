# Module 6 Backend API Testing

Module 6 adds an authenticated, server-authoritative cart preview. No cart table or database migration is required because the cart will be stored in the browser.

## 1. Start the project

```bash
npm run dev
```

## 2. Log in as a student

```bash
curl -X POST "http://localhost:4000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identity":"YOUR_STUDENT_EMAIL_OR_PHONE","password":"YOUR_PASSWORD","rememberMe":false}'
```

Copy `data.accessToken` from the response and use it as `USER_ACCESS_TOKEN`.

Seller and admin tokens are intentionally rejected by this endpoint.

## 3. Find menu-item IDs

```bash
curl "http://localhost:4000/api/hotels/HOTEL_ID/menu?available=true"
```

Copy one or more item IDs from the same hotel.

## 4. Preview the cart

```bash
curl -X POST "http://localhost:4000/api/orders/preview" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"menuItemId":"MENU_ITEM_ID","quantity":2}
    ]
  }'
```

Expected: `200 OK`. The response contains:

- Authoritative hotel ID and name
- Current menu-item name, price, dietary and bestseller data
- Quantity and integer-paise subtotal
- `orderable` and availability issues
- Total quantity, items total, delivery charge, platform fee, and grand total

The initial charges default to zero and can be configured with:

```env
CART_MAX_ITEM_QUANTITY=20
DELIVERY_CHARGE_PAISE=0
PLATFORM_FEE_PAISE=0
```

## 5. Unavailable-item reconciliation

Mark an item unavailable as its seller, then preview the existing student cart again.

Expected: `200 OK`, `orderable: false`, and an `ITEMS_UNAVAILABLE` issue containing the affected item ID. Current authoritative data remains in the response so the browser can reconcile its saved cart.

## 6. Security and validation tests

Empty cart — expected `422`:

```bash
curl -i -X POST "http://localhost:4000/api/orders/preview" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[]}'
```

Zero or excessive quantity — expected `422`:

```bash
curl -i -X POST "http://localhost:4000/api/orders/preview" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"MENU_ITEM_ID","quantity":0}]}'
```

Items from different hotels — expected `422 MULTIPLE_HOTELS_NOT_ALLOWED`:

```bash
curl -i -X POST "http://localhost:4000/api/orders/preview" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":"FIRST_HOTEL_ITEM_ID","quantity":1},{"menuItemId":"SECOND_HOTEL_ITEM_ID","quantity":1}]}'
```

Deleted/nonexistent item — expected `404 CART_ITEM_NOT_FOUND`.

Unapproved, inactive, or inactive-university outlet — expected `409 HOTEL_NOT_ORDERABLE`.

Tampered browser fields such as `pricePaise`, `itemName`, `hotelId`, and totals are stripped during validation. Only `menuItemId` and `quantity` are accepted as inputs; prices and totals are always rebuilt from MySQL.
