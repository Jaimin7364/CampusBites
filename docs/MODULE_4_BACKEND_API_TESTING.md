# Module 4 Backend API Testing

Module 4 provides approved-seller menu management and a public, filterable outlet menu. The Module 4 frontend is intentionally not included yet.

## 1. Prerequisites

```bash
brew services start mysql
npm run prisma:deploy -w @campusbites/api
npm run dev:api
```

The seller must already have an active `APPROVED` outlet from Module 3.

```bash
export SELLER_TOKEN='PASTE_SELLER_ACCESS_TOKEN'
export HOTEL_ID='PASTE_APPROVED_HOTEL_ID'
```

All money is sent and stored as integer paise. For example, ₹85.00 is `8500`.

## 2. Create a menu item

```bash
curl -X POST http://localhost:4000/api/seller/menu \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Masala Dosa",
    "description": "Crispy dosa served with sambhar and chutney",
    "pricePaise": 8500,
    "category": "South Indian",
    "veg": true,
    "bestseller": true,
    "preparationTimeMinutes": 15,
    "available": true
  }'
```

Expected: `201 Created`. Copy `data.menuItem.id`:

```bash
export MENU_ITEM_ID='PASTE_MENU_ITEM_ID'
```

Supported categories:

```text
Breakfast, Snacks, Lunch, Dinner, Beverages, Fast Food,
Chinese, South Indian, Desserts, Others
```

If `displayOrder` is omitted, the API places the item after the current menu items.

## 3. List the seller menu

```bash
curl 'http://localhost:4000/api/seller/menu?page=1&limit=100' \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Optional filters: `search`, `category`, `veg=true|false`, and `available=true|false`.

The response includes the seller's outlet, menu items, and pagination information. Sellers can view their existing menu while an outlet is awaiting reapproval, but mutations require an active approved outlet.

## 4. Update a menu item

The update accepts one or more menu fields:

```bash
curl -X PUT "http://localhost:4000/api/seller/menu/$MENU_ITEM_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Butter Masala Dosa",
    "pricePaise": 9500,
    "preparationTimeMinutes": 18
  }'
```

Expected: `200 OK`.

## 5. Toggle availability

```bash
curl -X PATCH "http://localhost:4000/api/seller/menu/$MENU_ITEM_ID/availability" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"available":false}'
```

Expected: `200 OK`. Unavailable items remain visible in the public menu with `available: false`.

## 6. Toggle bestseller

```bash
curl -X PATCH "http://localhost:4000/api/seller/menu/$MENU_ITEM_ID/bestseller" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"bestseller":true}'
```

Expected: `200 OK`.

## 7. Reorder menu items

Create at least two items, then send every changed item with its desired integer order:

```bash
curl -X PATCH http://localhost:4000/api/seller/menu/reorder \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {"id":"FIRST_MENU_ITEM_ID","displayOrder":0},
      {"id":"SECOND_MENU_ITEM_ID","displayOrder":1}
    ]
  }'
```

Expected: `200 OK`. Every submitted item must belong to the authenticated seller's outlet.

## 8. Public outlet menu

No authentication is required:

```bash
curl "http://localhost:4000/api/hotels/$HOTEL_ID/menu?page=1&limit=50"
```

Example filters:

```bash
curl "http://localhost:4000/api/hotels/$HOTEL_ID/menu?search=dosa&category=South%20Indian&veg=true"
curl "http://localhost:4000/api/hotels/$HOTEL_ID/menu?available=false"
curl "http://localhost:4000/api/hotels/$HOTEL_ID/menu?bestseller=true&sort=priceAsc"
```

Supported `sort` values: `displayOrder`, `name`, `priceAsc`, and `priceDesc`.

Only active approved outlets at active universities are publicly accessible. Pending, rejected, inactive, or missing outlets return `404 HOTEL_NOT_FOUND`. The public outlet response excludes seller-private and admin-approver data.

## 9. Delete a menu item

Run last:

```bash
curl -i -X DELETE "http://localhost:4000/api/seller/menu/$MENU_ITEM_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

Expected: `204 No Content`. When future order history references an item, the API returns `409 MENU_ITEM_IN_USE` instead of deleting historical data.

## 10. Important negative tests

- Seller has no outlet: `409 SELLER_HOTEL_REQUIRED`.
- Seller outlet is pending, rejected, or inactive: `409 APPROVED_HOTEL_REQUIRED` for mutations.
- Seller attempts to mutate another outlet's item: `403 MENU_ITEM_OWNERSHIP_REQUIRED`.
- Duplicate item name in the same outlet: `409 MENU_ITEM_ALREADY_EXISTS`.
- Floating-point `pricePaise`, price below ₹1, invalid category, or invalid preparation time: `422 VALIDATION_ERROR`.
- Duplicate IDs or more than 200 entries in a reorder request: `422 VALIDATION_ERROR`.
- Public menu requested for a non-approved outlet: `404 HOTEL_NOT_FOUND`.

## 11. Automated checks

```bash
npm run lint -w @campusbites/api
npm run typecheck -w @campusbites/api
npm test -w @campusbites/api
npm run build -w @campusbites/api
npm audit --audit-level=high
```

