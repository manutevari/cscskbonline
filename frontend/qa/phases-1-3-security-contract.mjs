import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile("../supabase/migrations/20261128_001_phases_1_3_security_repair.sql", "utf8");
const booking = await readFile("src/app/api/appointments/route.ts", "utf8");
const availability = await readFile("src/app/api/appointments/availability/route.ts", "utf8");
const verify = await readFile("src/app/api/appointments/[id]/verify/route.ts", "utf8");

assert.match(migration, /add column if not exists verification_token_hash text/i);
assert.match(migration, /create unique index if not exists appointments_verification_token_hash_unique/i);
assert.match(migration, /where status in \('BOOKED', 'CONFIRMED'\)/i);
for (const table of ["appointments", "audit_logs", "documents", "tata_water_enquiries"]) {
  assert.match(migration, new RegExp("public\\." + table + "\\b"));
}
assert.match(migration, /from public, anon, authenticated/i);
for (const fn of ["match_documents", "marketing_campaign_content_guard", "prevent_approval_event_mutation", "decide_marketing_approval", "claim_approved_marketing_execution"]) {
  assert.match(migration, new RegExp("alter function public\\." + fn + "\\b", "i"));
}
assert.match(booking, /verification_token_hash:\s*verificationTokenHash/);
assert.match(booking, /appointments_date_time_unique/);
assert.match(booking, /Cache-Control.*no-store/i);
assert.match(availability, /Cache-Control.*no-store/i);
assert.match(verify, /createHash\("sha256"\)/);
assert.match(verify, /select=id,service,date,time,status/);
assert.doesNotMatch(verify, /select=.*mobile|select=.*name/i);

console.log("PASS: Phase 1-3 appointment and database security contract checks");
