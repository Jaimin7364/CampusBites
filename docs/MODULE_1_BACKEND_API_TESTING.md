# Module 1 Backend API Testing

The Module 1 frontend has intentionally not been implemented yet. Use this guide to verify the backend first.

## 1. Prerequisites

1. Start MySQL and ensure the `DATABASE_URL` in the root `.env` points to an existing database.
2. Add unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to `.env`. Each must contain at least 32 characters.
3. Apply the committed migration:

   ```bash
   npm run prisma:deploy -w @campusbites/api
   ```

4. Start the backend:

   ```bash
   npm run dev:api
   ```

5. The API base URL is `http://localhost:4000/api` unless `API_PORT` was changed.

For Postman, keep its cookie jar enabled. For curl, the commands below save the HTTP-only refresh cookie in `/tmp/campusbites-cookies.txt`.

## 2. Health Check

```bash
curl -i http://localhost:4000/api/health
curl -i http://localhost:4000/api/health/database
```

Expected: both return HTTP `200` and `success: true` after MySQL is ready.

## 3. Register a User

```bash
curl -i -c /tmp/campusbites-cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Aarav Shah",
    "email": "aarav@example.com",
    "phone": "9876543210",
    "password": "Campus123",
    "confirmPassword": "Campus123"
  }' \
  http://localhost:4000/api/auth/register/user
```

Expected: HTTP `201`, public user data, an access token in the JSON response, and a `campusbites_refresh` HTTP-only cookie. The password, password hash, and refresh token must not appear in JSON.

Repeat the request to confirm duplicate email/phone returns HTTP `409` with code `ACCOUNT_ALREADY_EXISTS`.

## 4. Register a Seller

Use a different email and phone:

```bash
curl -i -c /tmp/campusbites-seller-cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{
    "sellerName": "Campus Cafe",
    "businessOwnerName": "Meera Patel",
    "email": "seller@example.com",
    "phone": "+919876543211",
    "password": "Campus123",
    "confirmPassword": "Campus123"
  }' \
  http://localhost:4000/api/auth/register/seller
```

Expected: HTTP `201` and role `seller`.

## 5. Login

```bash
curl -i -c /tmp/campusbites-cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "aarav@example.com",
    "password": "Campus123",
    "rememberMe": true
  }' \
  http://localhost:4000/api/auth/login
```

Expected: HTTP `200`, access token in JSON, and rotated refresh cookie. Copy the access token for protected requests.

Wrong passwords must return HTTP `401` with `INVALID_CREDENTIALS`.

## 6. Current Profile

Replace `<ACCESS_TOKEN>`:

```bash
curl -i \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  http://localhost:4000/api/auth/me
```

Expected: HTTP `200`. Omitting the header must return HTTP `401`.

## 7. Update Profile

```bash
curl -i -X PATCH \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Aarav S. Shah",
    "phone": "9876543212",
    "profilePhotoUrl": "https://example.com/profile.jpg"
  }' \
  http://localhost:4000/api/auth/me
```

Expected: HTTP `200` with updated normalized data. A normal user attempting to submit `sellerName` must receive HTTP `422` with `INVALID_PROFILE_FIELDS`.

## 8. Refresh Session

```bash
curl -i -b /tmp/campusbites-cookies.txt -c /tmp/campusbites-cookies.txt \
  -X POST http://localhost:4000/api/auth/refresh
```

Expected: HTTP `200`, a new access token, and a new refresh cookie. The old refresh token is revoked as part of rotation.

## 9. Role Authorization

Use the access token for the corresponding account:

```bash
curl -i -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  http://localhost:4000/api/role-check/user

curl -i -H 'Authorization: Bearer <USER_ACCESS_TOKEN>' \
  http://localhost:4000/api/role-check/seller
```

Expected: the first request returns HTTP `200`; the second returns HTTP `403`. Seller and admin equivalents are:

```text
GET /api/role-check/seller
GET /api/role-check/admin
```

## 10. Forgot and Reset Password

Request a reset:

```bash
curl -i \
  -H 'Content-Type: application/json' \
  -d '{"email":"aarav@example.com"}' \
  http://localhost:4000/api/auth/forgot-password
```

Expected: HTTP `200` with the same generic message for known and unknown emails. In development, the API terminal prints a reset URL. Copy the `token` value from that URL, then run:

```bash
curl -i \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "<RESET_TOKEN>",
    "password": "NewCampus123",
    "confirmPassword": "NewCampus123"
  }' \
  http://localhost:4000/api/auth/reset-password
```

Expected: HTTP `200`. Reusing the reset token must return HTTP `400` with `INVALID_RESET_TOKEN`. All previous refresh sessions are revoked, and login should work only with the new password.

## 11. Change Password

Login again to obtain a current access token, then:

```bash
curl -i -X PATCH \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "currentPassword": "NewCampus123",
    "password": "FinalCampus123",
    "confirmPassword": "FinalCampus123"
  }' \
  http://localhost:4000/api/auth/change-password
```

Expected: HTTP `200`; all refresh sessions are revoked, so log in again.

## 12. Logout

```bash
curl -i -b /tmp/campusbites-cookies.txt -c /tmp/campusbites-cookies.txt \
  -X POST http://localhost:4000/api/auth/logout
```

Expected: HTTP `200`, refresh-token revocation, and cookie removal. Logout is idempotent.

## 13. Create or Update the Admin Account

Set `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME` in `.env`, then run:

```bash
npm run seed:admin -w @campusbites/api
```

There is intentionally no public admin-registration endpoint. Log in through `POST /api/auth/login`, then verify the resulting token using `GET /api/role-check/admin`.

## API Summary

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/api/auth/register/user` | Public |
| POST | `/api/auth/register/seller` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Refresh cookie |
| POST | `/api/auth/logout` | Optional refresh cookie |
| POST | `/api/auth/forgot-password` | Public, rate limited |
| POST | `/api/auth/reset-password` | Reset token |
| GET | `/api/auth/me` | Bearer access token |
| PATCH | `/api/auth/me` | Bearer access token |
| PATCH | `/api/auth/change-password` | Bearer access token |
| GET | `/api/role-check/user` | User access token |
| GET | `/api/role-check/seller` | Seller access token |
| GET | `/api/role-check/admin` | Admin access token |

Do not start frontend implementation until these backend APIs are approved.
