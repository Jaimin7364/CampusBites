# CampusBites Module-Wise Build Plan

This document is the execution plan for building the CampusBites MVP described in `CampusBites Web Platform Build Prompt.md`.

The project must be built as a sequence of complete vertical modules. For every module, finish the backend, connect its frontend, test the API, test the user interface, and pass the completion gate before beginning the next module.

## 1. Working Method

For every module, follow this exact cycle:

1. Confirm the module requirements and API contract.
2. Add or update the Prisma schema and migration when required.
3. Implement backend validation, service/repository logic, controllers, routes, authorization, and error handling.
4. Add backend unit and integration tests.
5. Verify the API independently using automated tests or an API client.
6. Implement the responsive frontend screens and states.
7. Connect the frontend to the real API. Do not leave mock data in completed modules.
8. Add frontend component tests and critical user-flow tests.
9. Run linting, type checking, tests, and a production build.
10. Update the progress tracker and only then continue to the next module.

Do not build all backend modules first and all frontend modules later. Each module must be usable end-to-end before the next one starts.

## 2. Fixed Technical Decisions

Use these decisions consistently unless the main project specification is deliberately amended:

- Monorepo containing `apps/web` and `apps/api`, with shared packages where useful.
- Frontend: Next.js App Router, TypeScript, Tailwind CSS.
- Backend: Node.js, Express.js, TypeScript, REST APIs.
- Database: MySQL with Prisma ORM.
- Validation: Zod schemas shared or mirrored across API boundaries.
- Authentication: bcrypt password hashes, short-lived JWT access tokens, rotating refresh tokens stored as hashes in MySQL, and secure HTTP-only refresh cookies.
- Authorization roles: `user`, `seller`, and `admin`.
- API response shape: consistent success data and structured errors.
- Testing: backend unit/integration tests, frontend component tests, and Playwright end-to-end tests for critical flows.
- Real-time order updates: Socket.IO, introduced only after the base order flow works over REST.
- Currency: INR stored as integer paise in the database and converted for display. Never use floating-point values for money.
- Dates: store timestamps in UTC and display them in the relevant local timezone.
- Initial payment method: cash on delivery or cash on collection only.
- Initial delivery charge and platform fee: zero, defined through configuration rather than hardcoded throughout the application.

## 3. Repository Target Structure

```text
CampusBites/
  apps/
    api/
      prisma/
      src/
        config/
        controllers/
        middleware/
        repositories/
        routes/
        services/
        socket/
        types/
        utils/
        validators/
      tests/
    web/
      src/
        app/
          (user)/
          (seller)/
          (admin)/
        components/
        features/
        hooks/
        lib/
        services/
        types/
        utils/
      tests/
  packages/
    shared/
  .env.example
  README.md
```

The exact package manager can be selected during setup, but one lockfile must be committed and used consistently.

## 4. Global Engineering Rules

- Keep controllers thin. Business logic belongs in services; database access belongs in repositories or focused data-access functions.
- Validate every external input, including route parameters, query parameters, request bodies, cookies, and uploaded file metadata.
- Enforce ownership and role checks on the server, even if the frontend hides an action.
- Use database transactions for operations that write multiple related records, especially order creation and refresh-token rotation.
- Return appropriate HTTP status codes and stable machine-readable error codes.
- Never expose password hashes, refresh-token hashes, reset-token hashes, internal secrets, or unnecessary personal data.
- Add pagination to administrative and order lists that can grow.
- Include loading, empty, success, validation-error, server-error, and unauthorized states in every completed frontend feature.
- Build mobile-first user screens. Seller and admin dashboards must prioritize desktop usability while remaining responsive.
- Use accessible labels, keyboard navigation, visible focus, sufficient contrast, and semantic controls.
- Do not mark a module complete while it contains placeholder behavior, disconnected forms, or mock API responses.

## 5. Common Quality Gate

Every module must pass all applicable checks:

- [ ] Database migration applies cleanly to a new database.
- [ ] Seed process works where the module needs seed data.
- [ ] API validation rejects malformed and missing input.
- [ ] Authentication, role authorization, and resource ownership are tested.
- [ ] API success and important failure paths are tested.
- [ ] Frontend uses the real API and has no module-specific mock data.
- [ ] Responsive behavior is checked at mobile, tablet, and desktop widths.
- [ ] Loading, empty, error, and success states are present.
- [ ] No secrets or credentials are committed.
- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Automated tests pass.
- [ ] Production builds pass for both applications.
- [ ] Module documentation and progress status are updated.

---

# Module 0 — Foundation and Development Environment

## Goal

Create a reliable project skeleton that both applications can build, run, test, and communicate through.

## Backend

- Create the Express TypeScript application.
- Add environment validation for database URL, JWT secrets, cookie settings, frontend origin, API port, and runtime mode.
- Configure Prisma and MySQL connectivity.
- Add Helmet, CORS, JSON size limits, request logging, rate limiting foundation, and centralized error handling.
- Add `/api/health` and `/api/health/database` endpoints.
- Establish the standard API response and error format.
- Configure test environment and isolated test database strategy.

## Frontend

- Create the Next.js TypeScript application with Tailwind CSS.
- Establish the CampusBites theme: orange primary, green secondary, neutral backgrounds, typography, spacing, buttons, fields, cards, badges, dialogs, toasts, and skeletons.
- Create route groups for user, seller, and admin areas.
- Add a typed API client with base URL, credentials support, request errors, and access-token handling hooks.
- Add basic responsive shells for public, user, seller, and admin pages.

## Tests

- API health endpoint returns success.
- Database health endpoint detects available and unavailable database states.
- Backend and frontend lint, type-check, test, and build commands work.
- Frontend can call the API health endpoint from the configured origin.
- Smoke-test all application shells at mobile and desktop sizes.

## Completion Gate

- [ ] A fresh developer setup works from documented commands.
- [ ] Both apps start without TypeScript or runtime errors.
- [ ] Frontend-to-backend communication works without unsafe CORS settings.
- [ ] `.env.example` and root README setup instructions are complete.

---

# Module 1 — Authentication, Sessions, Roles, and Profiles

## Goal

Deliver complete authentication for users and sellers, protected admin login, session refresh, password recovery, and role-based navigation.

## Database

Create and migrate:

- `users`
- `refresh_tokens`
- `password_reset_tokens`

Use a role enum with `user`, `seller`, and `admin`. Store normalized unique emails and mobile numbers as appropriate. Hash refresh and password-reset tokens at rest.

## Backend

- Implement user registration and seller registration with their required fields.
- Implement login, logout, access-token refresh with token rotation, forgot password, reset password, current-user profile, profile update, and password change.
- Hash passwords using bcrypt with an environment-appropriate work factor.
- Implement authentication middleware and role middleware.
- Prevent public admin registration; add a safe admin seed/setup command.
- Add stricter rate limits to login, registration, refresh, forgot-password, and reset-password endpoints.
- In development, expose reset links safely through logs or a local mail adapter; define a production mail-service interface without committing credentials.

Core endpoints:

```text
POST /api/auth/register/user
POST /api/auth/register/seller
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PATCH /api/auth/me
PATCH /api/auth/change-password
```

## Frontend

- Build user signup, seller signup, shared login, forgot-password, reset-password, profile, and change-password screens.
- Redirect authenticated people to the correct portal for their role.
- Add protected-route behavior for user, seller, and admin layouts.
- Restore a valid session after page reload through the refresh flow.
- Show specific form validation messages without revealing whether sensitive accounts exist during password recovery.
- Add logout to all authenticated shells.

## Tests

- Register each public role and reject duplicate email/mobile values.
- Validate Indian mobile numbers, password length, confirmation, and required fields.
- Login succeeds with correct credentials and fails safely otherwise.
- Refresh rotation invalidates the old refresh token.
- Logout revokes the refresh session.
- Expired, malformed, revoked, and wrong-role tokens are rejected.
- Password reset tokens are single-use and expire.
- A user cannot access seller/admin routes; a seller cannot access user-private/admin routes.
- End-to-end: register → login → reload session → edit profile → logout.

## Completion Gate

- [ ] All three roles reach only their authorized portal.
- [ ] No admin registration route exists publicly.
- [ ] Authentication survives a normal page reload securely.
- [ ] Critical auth abuse and authorization cases have automated tests.

---

# Module 2 — University Management and Campus Selection

## Goal

Allow admins to manage campuses and users to select an active campus.

## Database

Create `universities` with name, city, optional state, active status, timestamps, sensible uniqueness rules, and lookup indexes.

## Backend

- Implement public/authenticated listing of active universities.
- Implement paginated admin listing including inactive universities.
- Implement admin create, update, activate/deactivate, and delete behavior.
- Prefer safe deletion rules: block deletion when referenced and offer deactivation.

Core endpoints:

```text
GET    /api/universities
GET    /api/admin/universities
POST   /api/admin/universities
PUT    /api/admin/universities/:id
PATCH  /api/admin/universities/:id/status
DELETE /api/admin/universities/:id
```

## Frontend

- Build admin university list, create/edit form, status control, delete confirmation, search, pagination, and empty state.
- Build user campus selector on the homepage.
- Persist the selected university locally and validate it against the active university list on return.
- Provide a clear change-campus action.

## Tests

- Only admins can mutate universities.
- Public/user listing never returns inactive universities.
- Invalid and duplicate university data is rejected.
- Referenced universities cannot be unsafely deleted.
- End-to-end: admin creates campus → user sees and selects it → admin deactivates it → user can no longer select it.

## Completion Gate

- [x] University CRUD and status management work end-to-end.
- [x] Campus selection persists and handles deactivation correctly.
- [x] Referential-integrity behavior is tested.

---

# Module 3 — Seller Outlet Application and Admin Approval

## Goal

Let each seller create one food outlet, submit it for approval, respond to rejection, and let admins review and feature approved outlets.

## Database

Create `hotels` with all fields in the main specification, an approval-status enum, foreign keys to seller/university/admin, timestamps, and indexes for university, seller, status, and featured queries. Enforce one outlet per seller for the MVP.

Define an image storage abstraction. Use validated local development storage initially and a production-compatible object-storage adapter/configuration.

## Backend

- Implement seller create, view, update, and resubmit flows.
- New and resubmitted outlets become `pending`.
- Approved outlet edits that affect public business information must follow an explicit policy; for MVP, return them to `pending`.
- Implement admin list/detail, approve, reject with required reason, feature/unfeature, edit, and safe delete/deactivate behavior.
- Validate phone, WhatsApp, opening/closing times, image type, and image size.
- Enforce seller ownership on every seller route.

Core endpoints:

```text
POST  /api/seller/hotel
GET   /api/seller/hotel
PUT   /api/seller/hotel/:id
POST  /api/seller/hotel/:id/resubmit
GET   /api/admin/hotels
GET   /api/admin/hotels/:id
PATCH /api/admin/hotels/:id/approve
PATCH /api/admin/hotels/:id/reject
PATCH /api/admin/hotels/:id/featured
```

## Frontend

- Build the seller outlet form, image upload/preview, outlet details, and approval-status states.
- Seller dashboard states must show: add outlet, waiting for approval, rejection reason with edit/resubmit, or approved outlet management.
- Build admin review queue, outlet detail, approve dialog, rejection dialog with reason, and featured control.
- Show clear validation and upload progress/error feedback.

## Tests

- A seller cannot create a second outlet or access another seller's outlet.
- Invalid image and form inputs are rejected.
- Approval and rejection transitions follow the allowed state machine.
- Rejection requires a reason; resubmission returns to pending.
- Only an approved outlet can be featured.
- End-to-end: seller submits → admin rejects → seller edits/resubmits → admin approves/features.

## Completion Gate

- [x] The full submission and approval loop works without database intervention.
- [x] Ownership and one-outlet rules are enforced server-side.
- [x] Status-specific seller and admin UI states are complete.

---

# Module 4 — Menu Management

## Goal

Allow approved sellers to manage real orderable menu items and expose the approved outlet menu to users.

## Database

Create `menu_items` with the specified fields, integer-paise price, indexes for hotel/category/availability/display order, and foreign-key rules that protect historical order data later.

## Backend

- Implement seller create, update, delete, availability toggle, bestseller toggle, and reorder behavior.
- Require seller ownership and an approved outlet for menu mutation.
- Implement public/user menu listing for approved outlets only, with search, category, veg, availability, sorting, and pagination if needed.
- Define deletion behavior before orders exist; once referenced by orders, preserve history through snapshot order-item data and use safe deletion/archival rules.

Core endpoints:

```text
GET    /api/hotels/:hotelId/menu
GET    /api/seller/menu
POST   /api/seller/menu
PUT    /api/seller/menu/:id
DELETE /api/seller/menu/:id
PATCH  /api/seller/menu/:id/availability
PATCH  /api/seller/menu/:id/bestseller
```

## Frontend

- Build seller menu list with add/edit form, delete confirmation, availability switch, veg/non-veg marker, bestseller marker, category, preparation time, and price formatting.
- Build reusable user menu cards with search, category filter, dietary indicators, availability states, and responsive layout.
- Do not enable cart behavior yet beyond a disabled or clearly staged action; cart becomes functional in Module 6.

## Tests

- Sellers cannot mutate another outlet's menu.
- Sellers without an approved outlet cannot publish menu items.
- Price, preparation time, category, and text validation work.
- Unavailable items remain visible with disabled ordering state as required.
- End-to-end: seller creates/edits/toggles/deletes item → user menu reflects changes.

## Completion Gate

- [x] Approved seller menu management works end-to-end.
- [x] User menu data is live and accurately filtered.
- [x] Money is stored and displayed without floating-point errors.

---

# Module 5 — User Vendor Discovery and Vendor Details

## Goal

Let users discover only approved vendors for their selected university and browse accurate outlet details and menus.

## Backend

- Implement approved vendor listing filtered by active university.
- Add search by vendor name, featured filter, and open-now filter.
- Compute open/closed status consistently using stored business hours and configured timezone.
- Implement public/user vendor details that never expose pending or rejected outlets.

Core endpoints:

```text
GET /api/hotels?universityId=&search=&featured=&openNow=
GET /api/hotels/:id
GET /api/hotels/:hotelId/menu
```

## Frontend

- Build the post-campus-selection homepage with featured vendors, search, filters, and vendor grid/list.
- Build vendor cards with image, name, address, hours, open/closed state, and featured badge.
- Build vendor detail with phone and WhatsApp actions and the live menu.
- Handle missing images with a branded fallback.
- Prompt for campus selection if a vendor list is opened without a valid selected campus.

## Tests

- Pending, rejected, inactive-campus, and wrong-campus vendors are hidden.
- Search, featured, and open-now filters work alone and together.
- Business-hour boundary cases are tested.
- Phone and WhatsApp links are formed safely.
- End-to-end: select campus → search/filter vendor → open details → browse menu.

## Completion Gate

- [x] Vendor visibility strictly follows university and approval rules.
- [x] Discovery and details work responsively using real data.
- [x] Open/closed logic has deterministic tests.

---

# Module 6 — Single-Vendor Cart

## Goal

Provide a reliable client-side cart that permits items from only one outlet at a time and prepares validated data for checkout.

## Backend

- No cart database table is required for the MVP.
- Add an order-preview or quote-validation endpoint if useful to re-read current item prices and availability before checkout.
- Never trust names, prices, totals, seller IDs, or hotel IDs sent from the browser during eventual order creation.

Suggested endpoint:

```text
POST /api/orders/preview
```

## Frontend

- Implement typed cart state with local persistence.
- Add item, increase, decrease, remove, and clear actions.
- Enforce the single-vendor rule and display: “You can order from only one food outlet at a time.”
- Offer an explicit replace-cart confirmation when switching vendors.
- Build cart screen with item subtotals, item total, configurable delivery charge, configurable platform fee, total quantity, grand total, and checkout action.
- Revalidate menu item price and availability before checkout; show changed/unavailable items clearly.

## Tests

- Quantity cannot become zero/negative except through removal and cannot exceed configured limits.
- Adding another vendor is blocked until the user confirms replacement.
- Cart restores safely after reload and clears invalid data.
- Price and availability changes from the server are reconciled.
- Totals use integer money arithmetic.
- End-to-end: add items → change quantities → reload → attempt another vendor → review total.

## Completion Gate

- [x] Single-vendor enforcement works in state and UI.
- [x] Cart totals are deterministic and server-revalidated.
- [x] No browser-supplied price is treated as authoritative.

---

# Module 7 — Checkout and Order Creation

## Goal

Create valid instant or scheduled cash orders for pickup/eating at the outlet or delivery to a text address.

## Database

Create `orders` and `order_items` using the specified snapshot fields. Add enums for order type, delivery type, payment method/status, and order status. Add indexes for order number, user, seller, hotel, university, status, scheduled time, and creation time.

Use a transaction to create the order and its items. Generate a collision-safe public order number such as `CB-2026-000001` without relying on an unsafe count query.

## Backend

- Implement order preview and authenticated order creation.
- Load authoritative user, seller, hotel, university, menu item, price, and availability data from the database.
- Ensure all items belong to the same approved, currently orderable outlet.
- Validate instant/pre-order rules and future scheduled date/time.
- Validate pickup/delivery rules and require a delivery address only for delivery.
- Set cash payment and initial payment status safely on the server.
- Return the newly created order with snapshot items.
- Make order submission idempotent to prevent duplicate orders from retries/double clicks.

Core endpoints:

```text
POST /api/orders/preview
POST /api/orders
GET  /api/orders/:id
```

## Frontend

- Build checkout sections for order type, pre-order date/time, receiving type, delivery address, payment, contact summary, and price summary.
- Conditionally show and validate scheduled time and delivery address.
- Reconcile the final server preview before the user confirms.
- Disable repeat submission and use an idempotency key.
- Show success with order number, clear the cart only after confirmed creation, and link to order detail.

## Tests

- Reject past pre-orders, missing addresses, mixed-vendor items, unavailable items, unapproved/closed vendors according to agreed business rules, tampered prices, and empty carts.
- Validate pre-order timezone and near-boundary times.
- Verify transaction rollback if any order item fails.
- Repeated requests with one idempotency key create only one order.
- Order and order-item snapshots remain correct after menu changes.
- End-to-end: instant pickup order, instant delivery order, and pre-order.

## Completion Gate

- [x] All supported checkout combinations behave correctly.
- [x] Order totals and snapshots are server-authoritative.
- [x] Duplicate submission is prevented and transaction safety is tested.

---

# Module 8 — Seller Order Management

## Goal

Allow sellers to view only their orders and advance each order through valid status transitions.

## Backend

- Implement seller order list/detail with pagination and filters.
- Enforce the status state machine:

```text
Pending -> Accepted -> Preparing -> Ready -> Completed
Pending -> Rejected
Pending -> Cancelled (user action in Module 9)
```

- Reject skipped, reversed, terminal-state, and cross-seller transitions.
- Let sellers mark cash payment `Paid` only under the allowed completion/payment policy.
- Record useful status timestamps or an order-status history table so tracking and auditing are reliable.

Core endpoints:

```text
GET   /api/seller/orders
GET   /api/seller/orders/:id
PATCH /api/seller/orders/:id/status
PATCH /api/seller/orders/:id/payment-status
```

## Frontend

- Build seller order queue with status filters, order cards/table, and responsive details.
- Show customer contact, items, quantities, totals, instant/pre-order, pickup/delivery, address, schedule, payment, and status.
- Render only actions allowed for the current status and confirm rejection/completion where appropriate.
- Refresh the order queue through polling initially; Socket.IO is added in Module 9.
- Add seller dashboard order counts and sales summaries needed for daily work.

## Tests

- A seller sees and changes only their own orders.
- Every allowed and forbidden status transition is covered.
- Concurrent status updates cannot corrupt the state.
- Payment status follows the defined business rules.
- Dashboard counts and sales totals are accurate.
- End-to-end: seller accepts → preparing → ready → paid/completed.

## Completion Gate

- [x] Seller ownership is enforced on list, detail, and mutation routes.
- [x] Status transitions are atomic and fully tested.
- [x] Seller can operate an order from pending through completion on mobile and desktop.

---

# Module 9 — User Orders, Cancellation, and Live Tracking

## Goal

Give users private order history, order details, permitted cancellation, and live status updates.

## Backend

- Implement user-owned order list grouped/filterable by active, completed, and cancelled/rejected states.
- Implement user-owned detail and cancellation while status is `Pending` only.
- Add Socket.IO authentication and rooms scoped to user, seller, and order identifiers.
- Emit order-created, status-changed, payment-changed, and cancelled events only to authorized rooms.
- Keep REST as the source of truth and provide reconnection/resynchronization behavior.

Core endpoints/events:

```text
GET   /api/orders/my
GET   /api/orders/:id
PATCH /api/orders/:id/cancel
Socket events: order:created, order:status-changed, order:payment-changed
```

## Frontend

- Build My Orders with active, completed, and cancelled sections.
- Build order detail with snapshots, totals, schedule/address, payment, and visual timeline.
- Show cancel action only while permitted and confirm it.
- Connect user and seller order screens to Socket.IO with reconnect handling.
- Fall back to periodic refetch if the socket is unavailable.

## Tests

- A user never sees another user's order.
- Cancellation is allowed only while pending and handles races with seller acceptance.
- Socket connections reject invalid authentication.
- Events are not leaked across users, sellers, or orders.
- UI resynchronizes after disconnect/reconnect.
- End-to-end in two sessions: user places order → seller accepts/advances → user timeline updates → seller completes.

## Completion Gate

- [x] Order privacy is verified over REST and Socket.IO.
- [x] Cancellation race behavior is deterministic.
- [x] Live tracking works, with a functioning fallback.

---

# Module 10 — Admin Users, Sellers, Orders, and Dashboard

## Goal

Give admins secure platform oversight, search/filter tools, and trustworthy MVP statistics.

## Backend

- Implement paginated user and seller lists/details with search and safe status controls if included.
- Implement all-orders list/detail with university, vendor, status, date, and text filters.
- Implement dashboard aggregate endpoint for all metrics in the main specification.
- Define total order value consistently, for example completed non-cancelled orders, and document the definition.
- Avoid routine admin mutation of completed orders. Any exceptional control must be explicit, authorized, validated, and auditable.

Core endpoints:

```text
GET /api/admin/users
GET /api/admin/users/:id
GET /api/admin/sellers
GET /api/admin/sellers/:id
GET /api/admin/orders
GET /api/admin/orders/:id
GET /api/admin/dashboard
```

## Frontend

- Build admin dashboard metric cards.
- Build user, seller, and order tables with search, filters, pagination, loading, empty, and error states.
- Build order detail linking the relevant user, seller, hotel, and university information.
- Retain university and hotel approval/featured management from earlier modules in unified admin navigation.
- Defer optional charts until after all MVP gates pass.

## Tests

- All endpoints require the admin role.
- Search, filters, pagination, and date boundaries produce correct results.
- Aggregates match controlled seed data and exclude/include statuses according to documented rules.
- Large lists do not return unbounded results.
- End-to-end: admin reviews platform totals, filters orders, and opens linked details.

## Completion Gate

- [x] Admin can manage and inspect all MVP resources from one portal.
- [x] Dashboard statistics have tested definitions.
- [x] Lists are paginated and do not expose secrets or excessive personal data.

---

# Module 11 — Production Hardening and MVP Acceptance

## Goal

Validate the complete platform as one production-ready MVP and close cross-module security, reliability, accessibility, and deployment gaps.

## Backend

- Audit authorization and ownership across every route.
- Confirm refresh-token rotation, revocation, cleanup, reset-token cleanup, and rate limits.
- Review validation, sanitization, upload security, CORS, Helmet, cookie flags, proxy trust, body limits, and error redaction.
- Add database backup/restore and migration deployment instructions.
- Add structured logging, request IDs, health/readiness endpoints, and graceful shutdown.
- Verify database indexes against common queries.
- Document API routes and example requests/responses.

## Frontend

- Complete responsive and accessibility audits.
- Add global error boundaries, not-found pages, unauthorized screens, offline/network feedback, and session-expired behavior.
- Verify metadata, titles, icons, branded fallback assets, and consistent navigation.
- Remove development-only logs, mock data, dead code, and placeholder copy.
- Check perceived performance with skeletons, image optimization, caching, and sensible request deduplication.

## Full Acceptance Tests

- User: register → login → select campus → discover outlet → browse menu → cart → instant/pre-order → pickup/delivery → cash order → track → view history.
- Seller: register → login → create outlet → handle rejection/resubmission/approval → manage menu → receive and complete order → view dashboard totals.
- Admin: login → create university → review outlet → approve/reject → feature vendor → inspect users/sellers/orders → verify statistics.
- Security: horizontal-access attempts, wrong-role attempts, token abuse, input tampering, price tampering, invalid status transitions, upload abuse, and rate-limit checks.
- Browser/responsive: current Chromium plus one additional supported browser; mobile, tablet, laptop, and desktop viewports.
- Operational: clean installation, migrations, seed, tests, production builds, start commands, health checks, and graceful restart.

## Completion Gate

- [ ] All three final MVP journeys pass end-to-end.
- [ ] No critical or high-severity security issues remain.
- [ ] All lint, type, unit, integration, end-to-end, and production-build checks pass.
- [ ] Deployment, environment, migration, seed, backup, and rollback documentation is complete.
- [ ] Known non-MVP work is documented separately and does not block core journeys.

---

# 6. Progress Tracker

Update this table only after the relevant module completion gate passes.

| Module | Status | Backend | Frontend | API Tests | UI/E2E Tests | Notes |
|---|---|---|---|---|---|---|
| 0. Foundation | Complete | ✅ | ✅ | ✅ | ✅ | API and web foundations verified; no domain migration required yet. |
| 1. Authentication | Complete | ✅ | ✅ | ✅ | ✅ | Secure auth, role portals, recovery, profiles, and session restoration verified. |
| 2. Universities | Complete | ✅ | ✅ | ✅ | ✅ | Admin management and persistent active-campus selection verified. |
| 3. Outlet approval | Complete | ✅ | ✅ | ✅ | ✅ | Seller submission/status UI and admin approval queue use the real APIs. |
| 4. Menu management | Complete | ✅ | ✅ | ✅ | ✅ | Seller CRUD/toggles/reordering and live filtered public menu verified. |
| 5. Vendor discovery | Complete | ✅ | ✅ | ✅ | ✅ | Campus-scoped discovery, filters, outlet details, contact actions, and live menu verified. |
| 6. Cart | Complete | ✅ | ✅ | ✅ | ✅ | Persistent single-vendor cart and authoritative preview reconciliation verified. |
| 7. Checkout/orders | Complete | ✅ | ✅ | ✅ | ✅ | Responsive checkout, final preview, idempotent creation, success flow, and owned order detail verified. |
| 8. Seller orders | Complete | ✅ | ✅ | ✅ | ✅ | Polling queue, responsive detail/actions, atomic state machine, cash collection, audit history, and daily metrics verified. |
| 9. User tracking | Complete | ✅ | ✅ | ✅ | ✅ | Private history/detail, pending-only cancellation, authenticated scoped Socket.IO updates, reconnect resync, and polling fallback verified. |
| 10. Admin oversight | Complete | ✅ | ✅ | ✅ | ✅ | Unified admin overview, resource navigation, bounded account/order directories, linked detail, filters, and tested completed-paid value definition verified. |
| 11. Production hardening | Not started | ⬜ | ⬜ | ⬜ | ⬜ | |

Allowed status values: `Not started`, `In progress`, `Blocked`, and `Complete`.

# 7. Module Handoff Record

At the end of every module, append a short record containing:

```text
Module:
Completion date:
Database migrations:
API endpoints completed:
Frontend routes completed:
Automated tests added:
Verification commands and results:
Important decisions:
Known limitations deferred to later modules:
```

# 8. Deferred Until After MVP

Do not let these delay the module plan unless the main specification is changed:

- Online payments
- GPS/maps-based delivery addresses
- Multiple outlets per seller
- Reviews and ratings
- Favorites
- Coupons
- Advertisements
- Seller subscriptions
- Advanced notification channels
- Advanced analytics charts
- Native mobile applications

# 9. First Action

Begin with Module 0 only. When its completion gate passes, update the progress tracker and proceed to Module 1. Continue in order; do not skip a module whose data or authorization rules are dependencies of later work.

---

# Module Handoff Records

## Module 0 — Foundation and Development Environment

```text
Module: 0 — Foundation and Development Environment
Completion date: 2026-08-20
Database migrations: None required; Prisma MySQL datasource and generated client verified.
API endpoints completed: GET /api/health, GET /api/health/database
Frontend routes completed: /, /user, /seller, /admin, /_not-found
Automated tests added: 5 API/service tests and 3 frontend component/client tests
Verification commands and results: npm audit (0 vulnerabilities), npm run lint (pass), npm run typecheck (pass), npm test (8 pass), npm run build (pass)
Important decisions: npm workspaces; apps/api and apps/web; Next.js App Router; Express 5; Prisma/MySQL; Zod environment validation; standard API envelopes; webpack production build for deterministic PostCSS compilation in the current macOS sandbox.
Known limitations deferred to later modules: Domain tables begin in Module 1; authentication, portal navigation, and live MySQL-backed business data are intentionally not part of Module 0.
```

## Module 1 — Authentication, Sessions, Roles, and Profiles

```text
Module: 1 — Authentication, Sessions, Roles, and Profiles
Completion date: 2026-08-20
Database migrations: 20260820160000_module_1_authentication
API endpoints completed: user/seller registration, login, refresh, logout, forgot/reset password, current/update profile, change password, and role verification
Frontend routes completed: /login, /register, /seller/register, /forgot-password, /reset-password, /user, /seller, /admin, and role-specific profile routes
Automated tests added: 15 Module 1 backend tests and 5 Module 1 frontend tests; 28 total project tests pass
Verification commands and results: npm run lint (pass), npm run typecheck (pass), npm test (28 pass), npm run build (pass), npm audit (0 vulnerabilities)
Important decisions: access tokens remain in memory; refresh JWTs use rotating HTTP-only cookies and are stored as hashes; reload restoration uses the refresh endpoint; client guards redirect by role; public admin registration is disabled.
Known limitations deferred to later modules: production email provider and managed profile-image uploads require deployment/storage integration; portal business features begin in Module 2.
```

## Module 2 — University Management and Campus Selection

```text
Module: 2 — University Management and Campus Selection
Completion date: 2026-08-21
Database migrations: 20260821100000_module_2_universities
API endpoints completed: public active university listing; admin list/detail/create/update/status/delete university endpoints
Frontend routes completed: / (public campus selector), /user (authenticated campus selector), /admin (university management)
Automated tests added: 15 Module 2 backend tests and 5 Module 2 frontend tests; 50 total project tests pass
Verification commands and results: Prisma migration and schema validation (pass), API and web lint/type-check (pass), 37 API tests and 13 web tests (pass), API and web production builds (pass), npm audit (0 vulnerabilities)
Important decisions: selected campus ID is stored locally and revalidated against the live active list on load; inactive selections are removed automatically; admin lists are paginated and searchable; referenced universities return a safe conflict and must be deactivated.
Known limitations deferred to later modules: campus selection scopes outlet discovery when outlet and menu data are introduced in Modules 3–5; browser-level Playwright journeys will be expanded with those business flows.
```

## Module 3 — Seller Outlet Application and Admin Approval

```text
Module: 3 — Seller Outlet Application and Admin Approval
Completion date: 2026-08-21
Database migrations: 20260821120000_module_3_hotels
API endpoints completed: validated outlet image upload; seller create/view/update/resubmit; admin list/detail/edit/approve/reject/feature/active/delete
Frontend routes completed: /seller (outlet onboarding and status workflow), /admin/outlets (review and management queue)
Automated tests added: 22 Module 3 backend tests and 7 Module 3 frontend tests; 79 total project tests pass
Verification commands and results: migration and Prisma validation (pass), npm run lint (pass), npm run typecheck (pass), npm test (59 API and 20 web tests pass), npm run build (pass), npm audit (0 vulnerabilities)
Important decisions: one outlet per seller; local development image storage behind an abstraction; JPEG/PNG/WebP signature and 5 MB validation; atomic approval transitions; rejected outlets require explicit resubmission; seller edits to approved outlets return them to pending; only active approved outlets can be featured.
Known limitations deferred to later modules: production object storage replaces the local adapter at deployment; public approved-outlet discovery and menus are introduced in Modules 4–5; full Playwright multi-role journeys expand with the orderable marketplace.
```

## Module 4 — Menu Management

```text
Module: 4 — Menu Management
Completion date: 2026-08-21
Database migrations: 20260821150000_module_4_menu_items
API endpoints completed: public approved-outlet menu listing; seller menu list/create/update/delete; availability and bestseller toggles; atomic display-order updates
Frontend routes completed: /seller/menu (seller menu management), /hotels/[hotelId]/menu (public live menu)
Automated tests added: 20 Module 4 backend tests and 7 Module 4 frontend tests; 106 total project tests pass
Verification commands and results: migration applied and Prisma schema validated; npm run lint (pass), npm run typecheck (pass), npm test (79 API and 27 web tests pass), npm run build (pass)
Important decisions: prices use integer paise from database through API and exact string conversion at the form boundary; menu mutation requires the seller's active approved outlet; public results expose approved active outlets only; unavailable dishes remain visible with ordering disabled; filtered views disable manual reordering to avoid ambiguous order changes.
Known limitations deferred to later modules: cart actions remain explicitly disabled until Module 6; Module 5 will add vendor discovery and link its outlet cards/details to the public menu route; browser-level multi-role E2E coverage expands with the full marketplace journey.
```

## Module 5 — User Vendor Discovery and Vendor Details

```text
Module: 5 — User Vendor Discovery and Vendor Details
Completion date: 2026-08-21
Database migrations: None required; Module 5 uses university, hotel, and menu data introduced earlier.
API endpoints completed: GET /api/hotels with required university scope, search, featured, open-now and pagination filters; GET /api/hotels/:id privacy-safe public detail; existing GET /api/hotels/:hotelId/menu integrated into details
Frontend routes completed: / (campus-scoped responsive vendor discovery), /hotels/[hotelId] (outlet details, contact actions, and embedded live menu), /hotels/[hotelId]/menu (focused menu view)
Automated tests added: 9 Module 5 backend tests and 5 Module 5 frontend tests; 120 total project tests pass
Verification commands and results: npm run lint (pass), npm run typecheck (pass), npm test (88 API and 32 web tests pass), npm run build (pass)
Important decisions: discovery requires a validated active campus ID; public database projections exclude seller/admin identity; only approved active outlets at active universities are visible; server-computed business hours use configurable Asia/Kolkata timezone by default and support overnight schedules; call and WhatsApp URLs are allowlist-normalized; missing outlet images use a branded fallback.
Known limitations deferred to later modules: cart controls remain disabled until Module 6; map/distance discovery is post-MVP; full browser-level ordering journeys depend on cart and orders in Modules 6–9.
```

## Module 6 — Single-Vendor Cart

```text
Module: 6 — Single-Vendor Cart
Completion date: 2026-08-21
Database migrations: None required; cart state is browser-local and server preview reads current menu data.
API endpoints completed: POST /api/orders/preview for authenticated students with authoritative menu data, single-outlet enforcement, availability reconciliation, and integer-paise totals
Frontend routes completed: /user/cart; add and quantity controls integrated into /hotels/[hotelId] and /hotels/[hotelId]/menu; cart count integrated into student navigation
Automated tests added: 14 Module 6 backend tests and 6 Module 6 frontend tests; 141 total project tests pass
Verification commands and results: npm run lint (pass), npm run typecheck (pass), npm test (103 API and 38 web tests pass), npm run build (pass)
Important decisions: persisted cart snapshots are schema-validated and cleared if malformed or mixed-vendor; quantities are limited to 20; switching outlets requires explicit confirmation; only item IDs and quantities reach the preview API; current names, prices, availability, fees, and totals always come from the server; all money remains integer paise.
Known limitations deferred to later modules: the checkout action is intentionally staged for Module 7; cart persistence is device/browser-local; order creation will perform the same authoritative validation again and must not trust preview results.
```

## Module 7 — Checkout and Order Creation

```text
Module: 7 — Checkout and Order Creation
Completion date: 2026-08-21
Database migrations: 20260821170000_module_7_orders
API endpoints completed: POST /api/orders/preview, POST /api/orders with idempotency protection, GET /api/orders/:id with user ownership enforcement
Frontend routes completed: /user/checkout and /user/orders/[orderId]; working checkout navigation from /user/cart
Automated tests added: 12 Module 7 backend tests and 5 Module 7 frontend tests; 158 total project tests pass
Verification commands and results: Prisma migration applied; API and web lint/type-check pass; 115 API tests and 43 web tests pass; API and web production builds pass
Important decisions: checkout performs a final server preview immediately before creation; one stable cryptographic idempotency key is used per mounted checkout attempt; the cart clears only after confirmed creation; local date/time input is converted to UTC ISO; prices, totals, identities, outlet data, payment state, and item snapshots remain server-owned; order detail is privacy-safe.
Known limitations deferred to later modules: seller order queues and status transitions arrive in Module 8; user order lists, cancellation, live tracking, and Socket.IO arrive in Module 9; cash is the only MVP payment method.
```

## Module 8 — Seller Order Management

```text
Module: 8 — Seller Order Management
Completion date: 2026-08-21
Database migrations: 20260821190000_module_8_seller_orders
API endpoints completed: seller-owned paginated/filterable order list and detail; atomic status updates; ready-only cash collection; daily status-count and paid-sales summary
Frontend routes completed: /seller/orders; Orders navigation and live summary integrated into /seller
Automated tests added: 24 Module 8 backend tests and 4 Module 8 frontend tests; 187 total project tests pass
Verification commands and results: migration applied; API and web lint/type-check pass; 140 API tests and 47 web tests pass; API and web production builds pass
Important decisions: transitions use atomic compare-and-update transactions; every status change records actor/history and an operational timestamp; seller cancellation is forbidden; cash can be marked paid only at READY and must be paid before completion; repeated paid requests are idempotent; daily sales count only completed paid orders in the configured business timezone; the queue polls every 15 seconds until Module 9 sockets.
Known limitations deferred to later modules: user cancellation, private order history, Socket.IO status events, reconnection, and polling fallback arrive in Module 9; advanced analytics remain post-MVP.
```

## Module 9 — User Orders, Cancellation, and Live Tracking

```text
Module: 9 — User Orders, Cancellation, and Live Tracking
Completion date: 2026-08-21
Database migrations: None required; Module 9 uses the order status history and operational timestamps introduced in Module 8.
API endpoints completed: private grouped/filterable GET /api/orders/my; owned GET /api/orders/:id with status history; atomic pending-only PATCH /api/orders/:id/cancel; authenticated and ownership-scoped Socket.IO order events
Frontend routes completed: /user/orders and enhanced /user/orders/[orderId]; My Orders student navigation; live updates integrated into user history/detail and seller order workspace
Automated tests added: 11 Module 9 backend tests and 4 Module 9 frontend tests; 202 total project tests pass
Verification commands and results: API and web lint/type-check pass; 151 API tests and 51 web tests pass; API and web production builds pass
Important decisions: REST remains the source of truth; socket events invalidate and refetch authoritative data; reconnect always resynchronizes; user screens retain a 20-second polling fallback and the seller queue retains its 15-second fallback; identity/order rooms enforce ownership; user cancellation is allowed only from PENDING and races resolve through atomic compare-and-update.
Known limitations deferred to later modules: administrative order oversight and platform aggregates arrive in Module 10; browser-level two-session automation and production deployment/socket infrastructure are finalized during Module 11 hardening.
```

## Module 10 — Admin Users, Sellers, Orders, and Dashboard

```text
Module: 10 — Admin Users, Sellers, Orders, and Dashboard
Completion date: 2026-08-21
Database migrations: None required; Module 10 aggregates and inspects existing account, campus, outlet, menu, and order data.
API endpoints completed: admin-only dashboard; paginated/searchable user and seller lists/details; paginated all-order list with university, outlet, status, payment, date, and text filters; complete linked order detail
Frontend routes completed: /admin overview; /admin/universities; /admin/outlets; /admin/users; /admin/sellers; /admin/orders; /admin/orders/[orderId]; unified responsive admin navigation
Automated tests added: 16 Module 10 backend tests and 6 Module 10 frontend tests; 224 total project tests pass
Verification commands and results: Prisma schema validation passes; API and web lint/type-check pass; 167 API tests and 57 web tests pass; API and web production builds pass
Important decisions: Module 10 oversight is read-only for accounts and orders; existing dedicated campus and outlet management remains available; all lists are database-paginated with a 100-record maximum; explicit projections exclude password/session/reset data; total order value is the integer-paise sum of COMPLETED and PAID orders only; charts remain deferred.
Known limitations deferred to later modules: final multi-role browser journeys, accessibility/security audits, deployment operations, backup/restore, and production hardening are handled in Module 11; advanced charts remain post-MVP.
```
