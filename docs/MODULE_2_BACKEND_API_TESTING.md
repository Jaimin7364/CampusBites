# Module 2 Backend API Testing

Module 2 provides public university discovery and admin-only university management. The frontend is intentionally not included yet.

## 1. Start the services

From the project root:

```bash
brew services start mysql
npm run prisma:deploy -w @campusbites/api
npm run dev:api
```

The API base URL is `http://localhost:4000/api`.

## 2. Get an admin access token

Log in using the admin account created by the Module 1 seed:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "YOUR_ADMIN_EMAIL",
    "password": "YOUR_ADMIN_PASSWORD"
  }'
```

Copy `data.accessToken` from the response and set it in your terminal:

```bash
export ADMIN_TOKEN='PASTE_ACCESS_TOKEN_HERE'
```

All `/api/admin/universities` requests require this header:

```text
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
```

## 3. API checklist

### List active universities publicly

No login is required. Inactive universities are never returned.

```bash
curl 'http://localhost:4000/api/universities?page=1&limit=20'
curl 'http://localhost:4000/api/universities?search=Gujarat&city=Ahmedabad'
```

Supported query parameters: `page`, `limit` (maximum 100), `search`, and `city`.

Expected status: `200 OK`.

### Create a university as admin

```bash
curl -X POST http://localhost:4000/api/admin/universities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Gujarat Technological University",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "active": true
  }'
```

Expected status: `201 Created`. Copy `data.university.id` for the remaining requests:

```bash
export UNIVERSITY_ID='PASTE_UNIVERSITY_ID_HERE'
```

Creating the same name and city again should return `409` with error code `UNIVERSITY_ALREADY_EXISTS`.

### List all universities as admin

```bash
curl 'http://localhost:4000/api/admin/universities?page=1&limit=20' \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl 'http://localhost:4000/api/admin/universities?active=false&search=Gujarat' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

The admin list supports `page`, `limit`, `search`, `city`, and `active=true|false`.

Expected status: `200 OK`.

### Get one university as admin

```bash
curl "http://localhost:4000/api/admin/universities/$UNIVERSITY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected status: `200 OK`. A valid but missing ID returns `404` with `UNIVERSITY_NOT_FOUND`.

### Update a university as admin

```bash
curl -X PUT "http://localhost:4000/api/admin/universities/$UNIVERSITY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "GTU Main Campus",
    "city": "Ahmedabad",
    "state": "Gujarat"
  }'
```

Expected status: `200 OK`. At least one of `name`, `city`, or `state` is required.

### Deactivate and reactivate a university

Deactivate:

```bash
curl -X PATCH "http://localhost:4000/api/admin/universities/$UNIVERSITY_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"active":false}'
```

Now call the public list and confirm that the university is absent:

```bash
curl "http://localhost:4000/api/universities?search=GTU"
```

Reactivate:

```bash
curl -X PATCH "http://localhost:4000/api/admin/universities/$UNIVERSITY_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"active":true}'
```

Expected status for each status update: `200 OK`.

### Delete a university as admin

Run this last because it removes the test university:

```bash
curl -i -X DELETE "http://localhost:4000/api/admin/universities/$UNIVERSITY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected status: `204 No Content`. Once later modules reference a university, deletion returns `409 UNIVERSITY_IN_USE`; deactivate it instead.

## 4. Authorization and validation checks

- Omit the bearer token from an admin endpoint: expect `401 UNAUTHORIZED`.
- Use a user or seller access token: expect `403 FORBIDDEN`.
- Use `limit=101`: expect `422 VALIDATION_ERROR`.
- Use a malformed university ID: expect `422 VALIDATION_ERROR`.
- Submit an empty update body: expect `422 VALIDATION_ERROR`.
- Submit a duplicate university name and city: expect `409 UNIVERSITY_ALREADY_EXISTS`.

## 5. Automated verification

```bash
npm run lint -w @campusbites/api
npm run typecheck -w @campusbites/api
npm test -w @campusbites/api
npm run build -w @campusbites/api
```

