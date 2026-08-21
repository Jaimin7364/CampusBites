# Module 3 Backend API Testing

Module 3 provides the seller outlet application, rejection/resubmission workflow, admin approval, featuring, safe deactivation/deletion, and validated local image uploads. The Module 3 frontend is intentionally not included yet.

## 1. Start the API

```bash
brew services start mysql
npm run prisma:deploy -w @campusbites/api
npm run dev:api
```

Base URL: `http://localhost:4000/api`

You need:

- A seller access token from `POST /api/auth/login`
- An admin access token from `POST /api/auth/login`
- An active university ID from `GET /api/universities`

```bash
export SELLER_TOKEN='PASTE_SELLER_ACCESS_TOKEN'
export ADMIN_TOKEN='PASTE_ADMIN_ACCESS_TOKEN'
export UNIVERSITY_ID='PASTE_ACTIVE_UNIVERSITY_ID'
```

## 2. Upload an outlet image

Seller and admin tokens are accepted. The multipart field must be named `image`.

```bash
curl -X POST http://localhost:4000/api/uploads/outlet-image \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -F 'image=@/ABSOLUTE/PATH/TO/outlet.webp'
```

Allowed content: JPEG, PNG, or WebP, maximum 5 MB. Both MIME type and file signature are checked.

Expected: `201 Created`. Copy `data.url`:

```bash
export HOTEL_IMAGE_URL='/uploads/outlets/PASTE_FILE_NAME.webp'
```

The uploaded image is available from `http://localhost:4000${HOTEL_IMAGE_URL}`.

## 3. Seller APIs

### Create an outlet application

```bash
curl -X POST http://localhost:4000/api/seller/hotel \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"universityId\": \"$UNIVERSITY_ID\",
    \"hotelName\": \"Campus Cafe\",
    \"address\": \"Opposite the main university library\",
    \"phone\": \"9876543210\",
    \"whatsappNumber\": \"9876543210\",
    \"description\": \"Fresh breakfast, lunch, snacks and beverages for students.\",
    \"hotelImageUrl\": \"$HOTEL_IMAGE_URL\",
    \"menuImageUrl\": null,
    \"openTime\": \"08:00\",
    \"closeTime\": \"21:00\"
  }"
```

Expected: `201 Created`, `status: "PENDING"`, `featured: false`. Copy the outlet ID:

```bash
export HOTEL_ID='PASTE_HOTEL_ID'
```

Submitting another outlet with the same seller must return `409 SELLER_ALREADY_HAS_HOTEL`.

### View the seller's outlet

```bash
curl http://localhost:4000/api/seller/hotel \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Expected: `200 OK`. Before creation, `data.hotel` is `null`.

### Update the seller's outlet

```bash
curl -X PUT "http://localhost:4000/api/seller/hotel/$HOTEL_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"universityId\": \"$UNIVERSITY_ID\",
    \"hotelName\": \"Campus Cafe and Canteen\",
    \"address\": \"Opposite the main university library\",
    \"phone\": \"9876543210\",
    \"whatsappNumber\": \"9876543210\",
    \"description\": \"Fresh meals, snacks and beverages prepared for campus life.\",
    \"hotelImageUrl\": \"$HOTEL_IMAGE_URL\",
    \"menuImageUrl\": null,
    \"openTime\": \"08:00\",
    \"closeTime\": \"21:30\"
  }"
```

Expected: `200 OK`. If an approved outlet is edited by its seller, it automatically returns to `PENDING` and is unfeatured.

### Resubmit a rejected outlet

After the admin rejects it:

```bash
curl -X POST "http://localhost:4000/api/seller/hotel/$HOTEL_ID/resubmit" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Expected: `200 OK`, `status: "PENDING"`, and `rejectReason: null`. A non-rejected outlet returns `409 INVALID_HOTEL_TRANSITION`.

## 4. Admin APIs

### List outlets

```bash
curl 'http://localhost:4000/api/admin/hotels?page=1&limit=20&status=PENDING' \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Optional filters: `page`, `limit`, `search`, `universityId`, `status=PENDING|APPROVED|REJECTED`, `featured=true|false`, and `active=true|false`.

### View an outlet

```bash
curl "http://localhost:4000/api/admin/hotels/$HOTEL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

The response includes university, seller, and approver details.

### Reject a pending outlet

```bash
curl -X PATCH "http://localhost:4000/api/admin/hotels/$HOTEL_ID/reject" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"reason":"Please provide a clearer outlet address and storefront image."}'
```

Expected: `200 OK`, `status: "REJECTED"`. A reason of fewer than five characters returns `422 VALIDATION_ERROR`.

### Approve a pending outlet

```bash
curl -X PATCH "http://localhost:4000/api/admin/hotels/$HOTEL_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: `200 OK`, `status: "APPROVED"`, with `approvedBy` and `approvedAt`. Only pending outlets can be approved.

### Feature or unfeature an approved outlet

```bash
curl -X PATCH "http://localhost:4000/api/admin/hotels/$HOTEL_ID/featured" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"featured":true}'
```

Only active approved outlets can be featured; otherwise expect `409 HOTEL_NOT_FEATUREABLE`.

### Edit an outlet as admin

`PUT /api/admin/hotels/:id` accepts the same complete JSON body as seller update. Admin edits keep the existing approval status.

### Deactivate or reactivate

```bash
curl -X PATCH "http://localhost:4000/api/admin/hotels/$HOTEL_ID/active" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"active":false}'
```

Deactivation also removes the featured flag.

### Delete

Run last:

```bash
curl -i -X DELETE "http://localhost:4000/api/admin/hotels/$HOTEL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected: `204 No Content`. Once menus or orders reference an outlet, expect `409 HOTEL_IN_USE`; deactivate it instead.

## 5. Important negative tests

- Use a user token on seller/admin routes: `403 FORBIDDEN`.
- Use Seller A's token to update Seller B's ID: `403 HOTEL_OWNERSHIP_REQUIRED`.
- Create a second outlet for one seller: `409 SELLER_ALREADY_HAS_HOTEL`.
- Select an inactive university: `409 UNIVERSITY_INACTIVE`.
- Approve/reject a non-pending outlet: `409 INVALID_HOTEL_TRANSITION`.
- Resubmit a non-rejected outlet: `409 INVALID_HOTEL_TRANSITION`.
- Feature pending, rejected, or inactive outlet: `409 HOTEL_NOT_FEATUREABLE`.
- Upload a non-image, mismatched image content, file over 5 MB, or multiple files: `422`.
- Send malformed phone, equal opening/closing times, or incomplete fields: `422 VALIDATION_ERROR`.

## 6. Automated checks

```bash
npm run lint -w @campusbites/api
npm run typecheck -w @campusbites/api
npm test -w @campusbites/api
npm run build -w @campusbites/api
npm audit --audit-level=high
```

