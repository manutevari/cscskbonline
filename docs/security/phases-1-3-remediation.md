# CSCSKB Phases 1-3 remediation plan

## Scope and safety boundary

This branch is based on main commit `99012f8bff45ab27c7214906ce269812c84a581b`.
It is a review branch only. No production migration, merge, branch-protection update,
or production deployment is authorized by this work.

## Phase 1 — appointment reliability

Observed production schema:
- `appointments.verification_token_hash` is missing although the current booking
  and verification API code writes and reads it.
- The active-slot unique partial index `appointments_date_time_unique` already exists.
- No duplicate active (date,time) pairs were found in the read-only check.

Prepared migration:
- Adds the token hash column and a unique partial index.
- Keeps the active-slot index idempotently defined.
- Does not backfill tokens or change existing appointment rows.

Validation still required in staging:
- Run migration and verify PostgREST schema cache.
- Book two requests concurrently for the same slot; exactly one must succeed.
- Verify valid token and invalid token behavior.
- Verify booking receipt and notification integrations.

## Phase 2 — repository quality gates

The inspected latest-main status checks were successful for both connected Vercel
projects. The latest inspected PR quality workflow had successful dependency
consistency, npm ci, npm audit, production build, and server startup steps.
It failed in the Document Tools browser E2E round-trip at
`frontend/qa/document-tools.e2e.mjs:67`: exported PDF import did not increase
the thumbnail count. The failure is consistent with a stale-status race in the test: it waited for a status
message that could still belong to the earlier SVG import. The test now waits for the
thumbnail count to increase before checking the status. CI must confirm this correction.

The prepared contract test is intentionally deterministic and does not contact
production services. It validates that the source and proposed migration retain
the security invariants.

## Phase 3 — database security

Supabase advisor findings observed:
- 13 RLS-enabled public tables have no policies.
- Four sensitive tables (`appointments`, `audit_logs`, `documents`,
  `tata_water_enquiries`) have broad anon/authenticated table grants and are
  exposed through GraphQL SELECT visibility.
- Three application-owned functions have mutable search_path warnings.
- `match_documents` also has a mutable search_path warning and public execution
  must remain disabled unless a tenant-scoped client policy is designed.
- The vector extension is installed in public; moving it is deliberately excluded
  because it requires separate dependency and migration planning.

The prepared SQL revokes direct public/authenticated access only from the four
server-mediated sensitive tables, preserves existing service_role grants, revokes
public vector-search execution, and pins search_path on the five identified
application-owned functions. It does not invent permissive RLS policies.
The remaining RLS-without-policy tables already lack anon/authenticated table
grants in the inspected grant listing; their service-role-only design is retained.

## Rollback and approval

The SQL is transactional. Before staging execution, take a schema/data backup and
verify the application uses service_role for every route that accesses the four
restricted tables. Rollback must be a separately reviewed migration; do not
re-grant broad client privileges as an automatic rollback.

Production execution, merge, branch-protection changes, and deployment each
require separate explicit approval.
