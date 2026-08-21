# Module 10 Backend API Testing

Module 10 backend adds read-only, admin-only platform oversight. No database migration is required.

## 1. Start the services

From the repository root:

```bash
brew services start mysql
npm run dev
```

API base URL: `http://localhost:4000/api`

## 2. Get an admin access token

Log in with the seeded admin account:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "YOUR_ADMIN_EMAIL",
  "password": "YOUR_ADMIN_PASSWORD",
  "rememberMe": false
}
```

Copy `data.accessToken`. Add this header to every request below:

```http
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

Student and seller tokens must receive `403 FORBIDDEN` for every Module 10 endpoint.

## 3. Dashboard

```http
GET /api/admin/dashboard
```

Returns counts for universities, users, sellers, hotels, pending/approved/featured hotels, all/pending/completed orders, and `totalOrderValuePaise`.

`totalOrderValuePaise` is strictly the sum of `totalAmountPaise` for orders where `status=COMPLETED` and `paymentStatus=PAID`. Cancelled, rejected, pending, unpaid, and incomplete orders do not contribute.

## 4. Users

```http
GET /api/admin/users?page=1&limit=20&search=student&active=true
GET /api/admin/users/USER_ID
```

`page` defaults to 1 and `limit` defaults to 20. The maximum limit is 100. Search covers name, email, and phone. Detail includes the user's order count.

## 5. Sellers

```http
GET /api/admin/sellers?page=1&limit=20&search=cafe&active=true
GET /api/admin/sellers/SELLER_ID
```

Seller detail includes safe account fields, total seller-order count, and the owned outlet with its university. Password and session data are never returned.

## 6. Orders

All filters are optional:

```http
GET /api/admin/orders?page=1&limit=20&search=CB&status=COMPLETED&paymentStatus=PAID&universityId=UNIVERSITY_ID&hotelId=HOTEL_ID&dateFrom=2026-08-01T00:00:00.000Z&dateTo=2026-08-31T23:59:59.999Z
GET /api/admin/orders/ORDER_ID
```

Dates are ISO-8601 timestamps and apply inclusively to order `createdAt`. Order detail includes immutable order/item snapshots, status history, and linked safe user, seller, outlet, and university information.

Expected validation checks:

- `limit=101` returns `422 VALIDATION_ERROR`.
- A reversed date range returns `422 VALIDATION_ERROR`.
- An invalid enum or resource ID returns `422 VALIDATION_ERROR`.
- A missing valid resource ID returns the relevant `404` error.
- No Module 10 endpoint changes account or order state.

## 7. Automated backend verification

```bash
npm run lint --workspace=@campusbites/api
npm run typecheck --workspace=@campusbites/api
npm test --workspace=@campusbites/api
npm run build --workspace=@campusbites/api
```
