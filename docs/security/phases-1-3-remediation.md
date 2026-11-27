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

The latest completed PR quality workflow passed dependency consistency,
security contract checks, `npm ci`, `npm audit`, production build, Python syntax,
Playwright setup, encrypted-PDF fixture generation, and server startup. The
Document Tools browser E2E still failed at the PDF round-trip: the exported PDF
produced no new thumbnail, the status read `0 image/PDF page(s) layout में जोड़ दिए गए`,
and no browser console/page errors were captured.

The diagnostic repair exposed the first test defect: Playwright's download
temporary path was uploaded as a bare path, so the browser supplied no reliable
`.pdf` filename/MIME type. The E2E test now uploads the exact downloaded bytes
with the original PDF filename and explicit `application/pdf` MIME type. The
next run successfully imported the PDF and created a second thumbnail; it then
failed on a separate incorrect canvas assertion that expected one image even
though the original SVG image intentionally remained alongside the imported PDF
page. The assertion now checks for both images. The editor also retains skipped-
file reasons rather than overwriting them. CI must confirm the full suite,
including encrypted-PDF, exports, print dispatch, and mobile overflow.

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
