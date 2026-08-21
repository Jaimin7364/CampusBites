# CampusBites API Reference

Base path: `/api`. Successful responses use `{ "success": true, "data": ..., "requestId": "..." }`. Errors use `{ "success": false, "error": { "code": "...", "message": "..." }, "requestId": "..." }`.

Protected routes use `Authorization: Bearer ACCESS_TOKEN`. Refresh authentication uses the HTTP-only cookie.

## Health

- `GET /health` — process liveness
- `GET /health/ready` — API and database readiness; returns 503 when unavailable
- `GET /health/database` — database diagnostic health

## Authentication

- `POST /auth/register/user`, `POST /auth/register/seller`
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /auth/me`, `PATCH /auth/me`, `PATCH /auth/change-password`

## Marketplace and administration

- Universities: `GET /universities`; admin CRUD/status under `/admin/universities`
- Outlets: public `GET /hotels`, `GET /hotels/:id`; seller `/seller/hotel`; admin `/admin/hotels`
- Menu: public `GET /hotels/:hotelId/menu`; seller CRUD/toggles/reorder under `/seller/menu`
- Upload: `POST /uploads/outlet-image` using multipart field `image`

## Orders

- Student: `POST /orders/preview`, `POST /orders`, `GET /orders/my`, `GET /orders/:id`, `PATCH /orders/:id/cancel`
- Seller: list/detail/summary/status/payment under `/seller/orders`
- Admin: `GET /admin/orders`, `GET /admin/orders/:id`, `GET /admin/dashboard`
- Socket.IO events: `order:created`, `order:status-changed`, `order:payment-changed`, `order:cancelled`; owned detail rooms use `order:subscribe` and `order:unsubscribe`

Detailed request examples for each vertical module are stored in `docs/MODULE_*_BACKEND_API_TESTING.md`.
