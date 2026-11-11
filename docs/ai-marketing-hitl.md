# CSCSKB AI Marketing Agent — HITL deployment notes

## Roles
- `owner_admin`: policy and kill-switch authority; can approve eligible requests.
- `marketing_manager`: campaign authoring and medium-risk marketing approvals.
- `service_expert`: domain review for food-safety and insurance/banking claims; cannot approve own submissions.
- `operations_manager`: operational review for bulk WhatsApp and execution controls support.

## Risk-based policy defaults
- Medium: one Owner/Admin or Marketing Manager approval.
- High food safety / insurance-banking: two distinct approvals, with Owner/Admin and Service Expert eligible.
- High bulk WhatsApp: two distinct approvals, with Owner/Admin and Operations Manager eligible.
- Critical paid-media: two approvals from the Owner/Admin, Marketing Manager and Operations Manager pool.
- Low-risk internal-only work is not an external publishing authorization.

Policy rows are editable in `approval_policies`; the highest matching risk policy wins. Review policy matching before enabling a new channel.

## Safeguards
Approval snapshots the exact campaign text, SHA-256 hash and content version. Any edit increments the version, recalculates the hash and resets campaign approval state. The database decision function rejects expired, stale, duplicate, unauthorized and self-approval decisions. Audit events are append-only. The execution-claim RPC checks approval status, expiry, current version/hash, a global pause switch and a unique idempotency key.

The execution-claim RPC only creates a safe execution claim. It does **not** send WhatsApp messages, publish social posts, spend ad budget or otherwise perform an external action. An execution worker must call the RPC immediately before an external action and record the result in `agent_execution_logs`.

## Environment
Set the four distinct role token variables in Vercel server-side Environment Variables. Use long random secrets, never prefix them with `NEXT_PUBLIC_`. Set distinct actor IDs per human login/token; do not share one role token among multiple people if you need meaningful separation-of-duties audit trails. Keep `CSCSKB_MARKETING_ADMIN_TOKEN` only during migration.

## Apply
Run `supabase/ai_marketing_hitl.sql` in the Supabase SQL editor before deploying the API routes. Then configure environment variables and redeploy the preview. The migration does not create or assign Supabase Auth users; role identity is token-backed until an authenticated user-provider integration is connected.
