# CampusBites MVP Acceptance Checklist

Automated unit, integration, socket-isolation, and cross-browser smoke tests cover the security and UI foundations. Before the production launch decision, execute these stateful journeys against a staging database with email and persistent image storage configured.

## Student journey

- Register and log in; reload restores the session.
- Select and change an active campus.
- Discover/search/filter approved outlets and open outlet/menu details.
- Add available dishes; verify same-outlet enforcement and authoritative price reconciliation.
- Complete instant pickup, instant delivery, and scheduled pre-order checkout with cash.
- Confirm duplicate submission creates only one order.
- Track seller changes live, cancel only while pending, and view grouped history/detail after reload.

## Seller journey

- Register/login and create an outlet with a valid image.
- Verify pending, rejection feedback, editing/resubmission, and admin approval states.
- Create/edit/delete/reorder dishes and toggle availability/bestseller.
- Receive a new order, reject one pending order, and advance another through accepted, preparing, ready, paid, and completed.
- Verify dashboard counts and completed paid sales.

## Administrator journey

- Log in using a seeded admin; create/edit/deactivate a university.
- Review, reject, approve, activate, and feature an outlet.
- Inspect bounded user and seller directories.
- Search/filter all orders and open linked order details.
- Reconcile dashboard counts and completed-paid order value with controlled staging data.

## Security and operations

- Attempt horizontal access for student orders and seller outlet/menu/order resources.
- Attempt every protected route with each wrong role.
- Test refresh reuse, revoked sessions, stale access tokens after password change, malformed/tampered JWTs, and expired sessions.
- Tamper with item prices, totals, identities, outlet IDs, quantities, schedules, and status transitions.
- Exercise upload MIME/signature/size/count failures, JSON body limits, CORS rejection, and rate limits.
- Validate Chromium and Firefox at mobile, tablet, laptop, and desktop sizes.
- Perform clean install, migration deployment, admin seed, build/start, liveness/readiness, backup/restore validation, SIGTERM restart, and rollback rehearsal.

Record staging date, release commit, tester, browser versions, evidence links, and every deviation before sign-off. Do not use production customer data for acceptance testing.
