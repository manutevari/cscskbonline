# CSCSKB Online Privacy and Data Deletion Implementation

## Included
- The live voice assistant has a "चैट मिटाएँ" control. It clears the messages held in the current component session and stops voice playback/listening. Chat messages are not persisted by this component in localStorage.
- The assistant links to `/privacy/data-deletion`, where users can request deletion of personal data or ask about/correct personal data.
- `/api/privacy/data-deletion` validates the request, requires explicit acknowledgement, collects only a contact method plus optional limited details, and stores a request in Supabase. It does not automatically delete appointment or other records.
- The GPT system prompt contains DPDP-aligned data-minimisation and truthfulness guardrails.

## Required setup before production
1. Run `supabase/data_deletion_requests.sql` in Supabase SQL Editor.
2. Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist in the server environment. Never expose the service-role key in client-side variables.
3. Test submission and confirm the request row is visible only to authorised operators.
4. Establish a documented identity-verification, response, retention, and deletion procedure before manually fulfilling requests.
5. Review privacy notice, consent language, access controls, logs/backups, and legal requirements with a qualified privacy professional.

## Important limitations
- Chat clearing is local to the currently open assistant session; it does not erase server logs or a separate conversation stored elsewhere.
- Personal-data requests are queued for human review; this implementation intentionally does not delete appointments automatically.
- Prompt instructions alone do not establish DPDP Act compliance. This implementation is DPDP-aligned operational guidance, not a legal compliance certification.
