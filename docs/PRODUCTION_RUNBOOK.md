# CampusBites Production Runbook

## Deployment order

1. Provision MySQL 8 with a dedicated application user and encrypted connections where supported.
2. Back up the current database before every release.
3. Install the exact lockfile dependencies with `npm ci`.
4. Set production environment variables. Use unique 32+ character JWT secrets and `COOKIE_SECURE=true`.
5. Generate Prisma Client and deploy committed migrations:

   ```bash
   npm run prisma:generate --workspace=@campusbites/api
   npm run prisma:deploy --workspace=@campusbites/api
   ```

6. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
7. Seed the first admin only when no admin exists: `npm run seed:admin --workspace=@campusbites/api`.
8. Start the compiled API with `npm start --workspace=@campusbites/api` and the compiled web app with `npm start --workspace=@campusbites/web`.
9. Verify `GET /api/health` (liveness) and `GET /api/health/ready` (database-backed readiness) before routing traffic.

Never run `prisma migrate dev` in production. Migrations are forward-only during deployment.

## Required production configuration

- `NODE_ENV=production`
- `DATABASE_URL`: least-privilege production MySQL URL
- `WEB_ORIGIN`: exact HTTPS web origin
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: distinct random secrets
- `COOKIE_SECURE=true`
- `TRUST_PROXY_HOPS`: number of trusted reverse proxies, normally `1`
- `API_BODY_LIMIT=100kb`
- `TOKEN_CLEANUP_INTERVAL_MINUTES=60`
- `TOKEN_RETENTION_DAYS=30`
- `SHUTDOWN_TIMEOUT_SECONDS=10`

Outlet images currently use local disk. Mount persistent storage for `apps/api/uploads` or replace the storage adapter with object storage before horizontally scaling the API.

## Backup

Resolve the exact database name and destination before running this command. Do not put passwords directly in shell history; use a MySQL option file or secure credential mechanism.

```bash
mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF --host=DB_HOST --user=BACKUP_USER campusbites > campusbites-YYYYMMDD-HHMMSS.sql
```

Encrypt the dump, store it outside the application host, and test restoration regularly. Retention should match business and legal requirements.

## Restore

Restore into an empty validation database first:

```bash
mysql --host=DB_HOST --user=RESTORE_USER -e "CREATE DATABASE campusbites_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql --host=DB_HOST --user=RESTORE_USER campusbites_restore < campusbites-YYYYMMDD-HHMMSS.sql
```

Point a temporary API instance at the restored database, run readiness and smoke tests, and compare critical counts before a production cutover.

## Rollback

Application rollback means redeploying the previous application artifact only when its schema is compatible with all already-applied migrations. Do not manually delete migration rows or reverse a migration in place. For an incompatible or destructive schema event, stop writes, restore the pre-release backup to a new database, validate it, and switch the application connection deliberately.

## Authentication cleanup

The API cleans expired refresh/reset records at startup and on the configured interval. It can also be run as a maintenance job:

```bash
npm run cleanup:auth --workspace=@campusbites/api
```

## Graceful restart

Send `SIGTERM`. The API stops cleanup scheduling, disconnects Socket.IO clients, stops accepting HTTP connections, closes Socket.IO and Prisma, and exits. It force-exits after `SHUTDOWN_TIMEOUT_SECONDS` so an orchestrator can replace an unhealthy process.
