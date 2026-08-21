# Module 11 Backend Security and Operations Audit

## Authorization and ownership

| Surface | Access rule |
|---|---|
| Public universities, approved outlets, public menus | Public, validation applied, approved/active data projections only |
| Authentication/profile | Public authentication actions are rate-limited; profile actions require an active authenticated account |
| Student cart/orders | `USER` role; order detail, history, cancellation, and socket subscriptions enforce ownership |
| Seller outlet/menu/orders | `SELLER` role; service/repository queries bind mutations and reads to the authenticated seller |
| University/outlet/admin oversight | `ADMIN` role; bounded lists and explicit safe projections |
| Uploads | `SELLER` or `ADMIN`; one 5 MB JPEG/PNG/WebP, MIME and signature validation, generated storage name |

Development-only `/api/role-check/*` routes are not mounted when `NODE_ENV=production`.

## Authentication controls

- Access and refresh JWTs use separate secrets, issuer, audience, type, subject, and expiry validation.
- Refresh tokens rotate and are stored only as SHA-256 hashes. Reuse revokes the entire token family.
- Logout, password reset, and password change revoke refresh sessions.
- REST and Socket.IO reject access tokens issued before `passwordChangedAt`.
- Expired tokens and retained revoked/used records are cleaned at startup, periodically, or with `cleanup:auth`.
- Refresh cookies are HTTP-only, same-site, scoped to `/api/auth`, and production requires secure cookies.
- Login/registration/refresh have a 20-per-15-minute limiter; recovery has a 5-per-hour limiter; the general API limiter is 300 per 15 minutes.

## HTTP and input controls

- Helmet security headers, strict configured-origin CORS, credential allowlisting, request IDs, structured Pino logging, disabled Express fingerprinting, and configurable trusted proxy hops.
- JSON/form bodies default to 100 KB. Validation occurs with Zod at route boundaries.
- Unknown and database errors use the standard error envelope. Unexpected errors are logged with request ID but return only the generic public message.
- Money, account identity, order ownership, status transitions, and item snapshots are server-owned.

## Query/index review

Module 11 adds indexes for role-based account pagination, global token cleanup, and completed/paid order aggregation. Existing indexes cover campus/outlet discovery, seller/user order queues, menu filters, ownership, and status scheduling.

## Deferred deployment risks

- Local uploaded-image storage must be mounted persistently or replaced with object storage before multi-instance deployment.
- Managed email delivery, infrastructure TLS, database encryption/backups, secret management, WAF rules, monitoring/alerts, and log retention are deployment-provider responsibilities.
- No online payment data is accepted in the MVP.
