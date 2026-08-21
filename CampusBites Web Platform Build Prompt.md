Build a complete production-ready web platform called **CampusBites**.

CampusBites is a campus-focused food ordering and pre-ordering platform that connects students/users with campus food vendors, cafeterias, canteens, restaurants, tea stalls, and other MSME food businesses.

The platform must contain three role-based modules:

1. User/Customer Portal
2. Seller/Vendor Portal
3. Super Admin Portal

## Technology Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- Responsive design for mobile, tablet, and desktop
- Modern clean UI
- Server-side and client-side rendering where appropriate

Backend:
- Node.js
- Express.js
- TypeScript preferred
- REST API architecture

Database:
- MySQL
- Use Prisma ORM or Sequelize ORM
- Proper relational schema with foreign keys, indexes, timestamps, and constraints

Authentication:
- Do NOT use Firebase, Auth0, Clerk, Supabase Auth, or any third-party authentication provider.
- Build authentication manually using Node.js and Express.
- Passwords must be hashed securely using bcrypt.
- Use JWT access tokens and refresh tokens.
- Store refresh tokens securely.
- Implement role-based authorization middleware.
- Roles:
  - user
  - seller
  - admin
- Implement signup, login, logout, token refresh, forgot password, reset password, and protected routes.
- Add validation, rate limiting, secure cookies where appropriate, CORS, Helmet, and input sanitization.

---

# CORE PLATFORM FLOW

User:

Register/Login
→ Select University/Campus
→ View Approved Food Vendors
→ View Vendor Details
→ Browse Menu
→ Add Items to Cart
→ Checkout
→ Select Instant Order or Pre-Order
→ Select Eat/Pickup at Vendor or Delivery to Location
→ Enter Delivery Location if required
→ Select Cash on Delivery
→ Place Order
→ Track Order Status
→ View Order History

Seller:

Register/Login
→ Create Seller Profile
→ Add Hotel/Canteen/Food Outlet
→ Select University
→ Submit Outlet for Admin Approval
→ Wait for Approval
→ Manage Approved Outlet
→ Add/Edit/Delete Menu Items
→ Mark Items Available/Unavailable
→ Receive Orders
→ Accept/Reject Orders
→ Mark Preparing
→ Mark Ready
→ Mark Completed
→ View Order History
→ View Basic Analytics

Admin:

Login
→ Dashboard
→ Manage Universities
→ Review Seller/Vendor Applications
→ Review Hotels/Food Outlets
→ Approve/Reject Food Outlets
→ Mark Vendors Featured
→ Manage Users
→ Manage Sellers
→ View Orders
→ View Platform Statistics
→ Manage Featured Vendors

---

# 1. USER AUTHENTICATION

User signup form:

- Full Name
- Email
- Mobile Number
- Password
- Confirm Password

Validation:

- Valid email
- Unique email
- Valid Indian mobile number
- Password minimum 8 characters
- Password confirmation
- Secure bcrypt password hashing

User login:

- Email
- Password
- Remember me optional

User profile:

- Name
- Email
- Mobile Number
- Profile photo optional
- Password change
- Logout

User database role must be:

"user"

---

# 2. SELLER AUTHENTICATION

Seller registration:

- Seller Name
- Business Owner Name
- Email
- Phone
- Password
- Confirm Password

Seller role:

"seller"

Seller account must be separate logically from users but stored in the same users/authentication structure where practical.

Seller dashboard should be accessible only to authenticated sellers.

---

# 3. ADMIN AUTHENTICATION

Admin login only.

Role:

"admin"

No public admin registration.

Admin accounts should be created manually through database seed/admin setup.

Admin routes must be fully protected using authorization middleware.

---

# 4. UNIVERSITY/CAMPUS MANAGEMENT

Admin can:

- Add university
- Edit university
- Delete university
- Activate/deactivate university

University fields:

- id
- name
- city
- state optional
- active
- createdAt
- updatedAt

Do not require university images.

User homepage should display active universities.

Users select a university before viewing food vendors.

---

# 5. HOTEL / FOOD VENDOR MANAGEMENT

A seller can initially own one food outlet.

Outlet fields:

- id
- ownerId / sellerId
- universityId
- hotelName
- address
- phone
- WhatsApp number
- description
- hotelImage
- menuImage optional
- openTime
- closeTime
- featured
- status
- rejectReason
- approvedBy
- approvedAt
- createdAt
- updatedAt

Possible status values:

- pending
- approved
- rejected

Seller workflow:

Seller creates outlet
→ status becomes pending
→ Admin reviews
→ Admin approves or rejects
→ If rejected, seller sees rejection reason
→ Seller edits and resubmits
→ status becomes pending again

Only approved vendors must be visible in the user portal.

Admin can:

- Approve
- Reject
- Provide rejection reason
- Feature/unfeature
- Edit
- Delete

---

# 6. USER HOTEL/VENDOR DISCOVERY

After selecting a university, user should see approved vendors belonging to that university.

Vendor card should show:

- Vendor image
- Hotel/Canteen name
- Address
- Open/Closed status
- Featured badge
- Opening/closing time

Filters:

- Featured
- Open now
- Search by vendor name

Clicking a vendor opens Vendor Detail page.

---

# 7. VENDOR DETAIL PAGE

Display:

- Hotel image
- Hotel name
- Description
- Address
- Opening hours
- Open/Closed status
- Phone
- WhatsApp
- Featured badge
- View Menu button

Optional actions:

- Call
- WhatsApp

---

# 8. MENU MANAGEMENT

Seller must be able to manage actual menu items.

Do not depend on menu images for ordering.

Menu item fields:

- id
- hotelId
- name
- description
- price
- category
- veg
- bestseller
- preparationTime
- available
- displayOrder optional
- createdAt
- updatedAt

No food image is required.

Seller can:

- Add item
- Edit item
- Delete item
- Toggle available/unavailable
- Mark Veg/Non-Veg
- Mark Bestseller
- Set price
- Set preparation time
- Set category

Suggested categories:

- Breakfast
- Snacks
- Lunch
- Dinner
- Beverages
- Fast Food
- Chinese
- South Indian
- Desserts
- Others

User menu page should support:

- Search menu items
- Category filter
- Veg/Non-Veg indicator
- Bestseller badge
- Price
- Preparation time
- Available/Unavailable status
- Add to Cart
- Quantity +/-

---

# 9. CART

Cart must support only one vendor at a time.

If user attempts to add food from another vendor while the cart contains items, show:

"You can order from only one food outlet at a time."

Cart item fields:

- menuItemId
- hotelId
- itemName
- price
- quantity
- veg
- bestseller

Cart functions:

- Add
- Increase quantity
- Decrease quantity
- Remove item
- Clear cart
- Item subtotal
- Total quantity
- Total amount

Cart screen should display:

- Menu items
- Quantity controls
- Individual subtotal
- Items Total
- Delivery Charge
- Platform Fee
- Grand Total
- Proceed to Checkout

For initial version:

- Delivery Charge = ₹0
- Platform Fee = ₹0

Keep charges configurable for future use.

---

# 10. CHECKOUT

Checkout must support two order modes:

## Order Type

1. Instant Order
2. Pre-Order

If Pre-Order is selected:

Ask user to select:

- Date
- Time

Validate that selected date/time is in the future.

## Food Receiving Type

User can select:

1. Eat/Pickup at Hotel
2. Deliver to Location

If Deliver to Location:

Ask for:

- Delivery Location / Address using a simple text box

Do not require GPS initially.

Example:

"Block B Hostel, Room 204, Near Main Gate"

## Payment

Initial payment option:

- Cash on Delivery / Cash on Collection

Keep architecture ready for future online payment support.

---

# 11. ORDERS

When user places an order, create an order automatically in MySQL.

Order fields:

- id
- orderNumber
- userId
- userName
- userPhone
- sellerId
- sellerName
- hotelId
- hotelName
- hotelPhone
- universityId
- subtotal
- totalAmount
- orderType
- deliveryType
- deliveryAddress
- preorderDate
- preorderTime
- paymentMethod
- paymentStatus
- status
- createdAt
- updatedAt

Order items should be stored in a separate relational order_items table.

Order item fields:

- id
- orderId
- menuItemId
- itemName
- price
- quantity
- veg
- bestseller
- itemTotal

Order Number example:

CB-2026-000001

or

CB + timestamp-based unique ID

---

# 12. ORDER STATUS FLOW

Use consistent statuses:

- Pending
- Accepted
- Preparing
- Ready
- Completed
- Rejected
- Cancelled

Flow:

Pending
→ Accepted
→ Preparing
→ Ready
→ Completed

Seller can reject a Pending order.

User can cancel only while allowed by business rules, for example before Accepted.

---

# 13. SELLER ORDER MANAGEMENT

Seller dashboard must show only orders where:

sellerId = logged-in seller id

Order card should show:

- Order Number
- Customer Name
- Customer Phone
- Order Items
- Quantity
- Total
- Instant / Pre-Order
- Pickup / Delivery
- Delivery Address if applicable
- Scheduled date/time if Pre-Order
- Payment Method
- Payment Status
- Order Status

Seller actions:

Pending:
- Accept
- Reject

Accepted:
- Mark Preparing

Preparing:
- Mark Ready

Ready:
- Mark Completed

For Cash orders, seller should be able to mark:

paymentStatus = Paid

upon successful completion/payment.

---

# 14. USER ORDER TRACKING

User should have:

My Orders page

Sections:

- Active Orders
- Completed Orders
- Cancelled Orders

Order details page should show:

- Order Number
- Hotel Name
- Items
- Amount
- Order Type
- Delivery Type
- Delivery Location
- Pre-Order Time
- Payment
- Status

Show visual order timeline:

Placed
→ Accepted
→ Preparing
→ Ready
→ Completed

Use polling or real-time technologies such as WebSockets / Socket.IO for live order updates.

Prefer Socket.IO in Node.js + Express.

---

# 15. ADMIN ORDER MANAGEMENT

Admin can:

- View all orders
- Search orders
- Filter by university
- Filter by vendor
- Filter by status
- Filter by date
- View complete order details
- View user details
- View seller details

Admin should not routinely change completed transactions, but appropriate administrative status controls may be provided.

---

# 16. ADMIN DASHBOARD

Display:

- Total Universities
- Total Users
- Total Sellers
- Total Hotels
- Pending Hotel Approvals
- Approved Hotels
- Featured Hotels
- Total Orders
- Pending Orders
- Completed Orders
- Total Order Value

Add charts later for:

- Orders by date
- Revenue trends
- University-wise orders
- Seller performance

---

# 17. SELLER DASHBOARD

Display:

- Hotel approval status
- Total menu items
- Today's Orders
- Pending Orders
- Preparing Orders
- Ready Orders
- Completed Orders
- Today's Sales
- Total Sales

Quick actions:

- My Hotel
- Manage Menu
- Orders
- Profile
- Logout

If seller has not created a hotel:

Show only:

"Add Your Food Outlet"

If hotel status is pending:

Show:

"Waiting for Admin Approval"

If rejected:

Show rejection reason.

---

# 18. USER HOMEPAGE

After login:

Show:

- Welcome message
- University selection
- Featured vendors
- Search vendors

Recommended navigation:

Home
Orders
Profile

After selecting university:

Show approved vendors belonging to that campus.

---

# 19. DATABASE TABLES

Create proper relational MySQL schema for:

users

refresh_tokens

password_reset_tokens

universities

hotels

menu_items

orders

order_items

Optional/future:

reviews

favorites

notifications

coupons

seller_subscriptions

payments

advertisements

---

# 20. SECURITY

Implement:

- bcrypt password hashing
- JWT authentication
- Access token
- Refresh token
- Refresh token rotation if practical
- Role-based authorization
- Express validation middleware
- Input sanitization
- Helmet
- Rate limiting
- Secure HTTP-only cookies
- CORS configuration
- SQL injection protection using ORM/parameterized queries
- Centralized error handling
- Environment variables
- No passwords or secrets in code
- Protected admin routes
- Protected seller routes
- User ownership validation

A seller must never be able to edit another seller's hotel, menu, or orders.

A user must never access another user's private order data.

---

# 21. API STRUCTURE

Use clean REST endpoints.

Examples:

Auth:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password

Universities:

GET /api/universities
POST /api/admin/universities
PUT /api/admin/universities/:id
DELETE /api/admin/universities/:id

Hotels:

GET /api/hotels?universityId=
GET /api/hotels/:id

Seller:

POST /api/seller/hotel
GET /api/seller/hotel
PUT /api/seller/hotel/:id

Admin Hotel Review:

GET /api/admin/hotels
PATCH /api/admin/hotels/:id/approve
PATCH /api/admin/hotels/:id/reject
PATCH /api/admin/hotels/:id/featured

Menu:

GET /api/hotels/:hotelId/menu

Seller:

POST /api/seller/menu
PUT /api/seller/menu/:id
DELETE /api/seller/menu/:id
PATCH /api/seller/menu/:id/availability

Orders:

POST /api/orders
GET /api/orders/my
GET /api/orders/:id

Seller:

GET /api/seller/orders
PATCH /api/seller/orders/:id/status

Admin:

GET /api/admin/orders

---

# 22. PROJECT STRUCTURE

Frontend Next.js:

src/
app/
components/
features/
services/
hooks/
types/
lib/
middleware/
utils/

Separate route groups for:

(user)
(seller)
(admin)

Backend:

src/
controllers/
services/
routes/
middleware/
models/
repositories/
validators/
utils/
config/
socket/
types/

Use layered architecture.

---

# 23. RESPONSIVE DESIGN

The website must work properly on:

- Mobile
- Tablet
- Laptop
- Desktop

The user portal should be mobile-first because students will mainly access CampusBites using phones.

Seller and Admin dashboards should work especially well on laptops/desktops while remaining responsive.

---

# 24. DESIGN DIRECTION

Use a modern food-tech SaaS style.

Suggested visual direction:

- Primary: Orange
- Secondary: Green
- White background
- Light gray cards
- Rounded corners
- Modern typography
- Minimal clutter

Do not copy Swiggy/Zomato UI exactly.

Create an original CampusBites visual identity.

---

# 25. MVP PRIORITY

Build in this order:

Phase 1:
Authentication and roles

Phase 2:
University management

Phase 3:
Seller hotel registration and admin approval

Phase 4:
Menu management

Phase 5:
User vendor discovery and menu browsing

Phase 6:
Cart

Phase 7:
Checkout

Phase 8:
Instant Order + Pre-Order

Phase 9:
Seller Order Management

Phase 10:
User Order Tracking

Phase 11:
Admin Analytics

---

# FINAL MVP USER JOURNEY

User:

Register
→ Login
→ Select Campus
→ Select Food Outlet
→ Browse Menu
→ Add Items
→ Cart
→ Instant / Pre-Order
→ Pickup / Delivery
→ COD
→ Place Order
→ Track Status

Seller:

Register
→ Login
→ Add Food Outlet
→ Admin Approval
→ Add Menu
→ Receive Order
→ Accept
→ Preparing
→ Ready
→ Completed

Admin:

Login
→ Add Universities
→ Review Vendors
→ Approve/Reject
→ Feature Vendors
→ Monitor Orders
→ View Platform Statistics

Build the project with clean, modular, reusable, type-safe code. Ensure that the database schema, API contracts, frontend types, authentication system, and role permissions remain consistent across the complete application.