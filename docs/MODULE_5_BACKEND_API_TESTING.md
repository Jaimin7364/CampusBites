# Module 5 Backend API Testing

Module 5 vendor discovery endpoints are public. They return only active, approved outlets belonging to an active university and never expose seller or admin account data.

## 1. Start the project

```bash
npm run dev
```

API base URL:

```text
http://localhost:4000/api
```

## 2. Get an active university ID

```bash
curl "http://localhost:4000/api/universities?limit=100"
```

Copy an `id` from the response and replace `UNIVERSITY_ID` below. The ID must be a real CUID, not the literal placeholder.

## 3. List approved outlets for the university

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID"
```

Expected: `200 OK`. Every returned outlet has `status: "APPROVED"`, `active: true`, an active `university`, and a computed `isOpen` boolean.

## 4. Test discovery filters

Search by outlet name:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&search=Cafe"
```

Featured outlets only:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&featured=true"
```

Currently open outlets only:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&openNow=true"
```

Currently closed outlets only:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&openNow=false"
```

Combined filters and pagination:

```bash
curl "http://localhost:4000/api/hotels?universityId=UNIVERSITY_ID&search=Cafe&featured=true&openNow=true&page=1&limit=10"
```

Expected pagination fields: `page`, `limit`, `total`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.

## 5. Get a public outlet detail

Copy an approved outlet `id` from step 3:

```bash
curl "http://localhost:4000/api/hotels/HOTEL_ID"
```

Expected: `200 OK` with `{ "hotel": ... }`. The outlet includes its contact information, hours, university, and `isOpen`; it does not include seller identity or approval-admin information.

## 6. Browse the outlet menu

```bash
curl "http://localhost:4000/api/hotels/HOTEL_ID/menu"
```

The Module 4 menu endpoint remains the live menu source for vendor details.

## 7. Negative tests

Missing university scope:

```bash
curl -i "http://localhost:4000/api/hotels"
```

Expected: `422` validation error.

Invalid university ID:

```bash
curl -i "http://localhost:4000/api/hotels?universityId=wrong"
```

Expected: `422` validation error.

Pending, rejected, deactivated, or inactive-university outlet detail:

```bash
curl -i "http://localhost:4000/api/hotels/NON_PUBLIC_HOTEL_ID"
```

Expected: `404 HOTEL_NOT_FOUND`. The same outlets must not appear in discovery results.

## Business-hours rule

`BUSINESS_TIME_ZONE` defaults to `Asia/Kolkata` and can be configured in `.env`. Opening time is inclusive and closing time is exclusive. Overnight hours are supported; for example, `20:00`–`02:00` is open at 23:00 and 01:00.
