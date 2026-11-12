import { NextRequest, NextResponse } from "next/server";
import { authenticateMarketingActor } from "@/lib/marketing-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = authenticateMarketingActor(request);
  if (!actor || actor.role !== "owner_admin") {
    return NextResponse.json({ error: "Forbidden: this diagnostics section is restricted to Owner / Administrator." }, { status: actor ? 403 : 401 });
  }

  const has = (...names: string[]) => names.every(name => Boolean(process.env[name]?.trim()));
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    access: { role: actor.role },
    checks: {
      supabase: {
        configured: has("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
        detail: has("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
          ? "Required server-side Supabase variables are present. Connectivity and schema have not been tested."
          : "One or more required server-side Supabase variables are missing in this deployment target."
      },
      whatsapp: {
        configured: has("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_CUSTOMER_TEMPLATE", "WHATSAPP_OWNER_TEMPLATE"),
        detail: has("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_CUSTOMER_TEMPLATE", "WHATSAPP_OWNER_TEMPLATE")
          ? "Required WhatsApp variable names are present. Token validity, template approval and delivery are not verified."
          : "One or more required WhatsApp variables are missing in this deployment target."
      },
      sms: {
        configured: has("MSG91_AUTH_KEY", "MSG91_SMS_TEMPLATE_ID"),
        detail: has("MSG91_AUTH_KEY", "MSG91_SMS_TEMPLATE_ID")
          ? "MSG91 variable names are present. Provider credentials and delivery are not verified."
          : "MSG91 is not fully configured in this deployment target."
      },
      appointmentApi: {
        present: true,
        detail: "The appointment API route is part of this application. A live booking/database write has not been attempted."
      }
    },
    safety: [
      "This endpoint reads environment-variable presence only; it never returns secret values.",
      "No WhatsApp, SMS or customer notification is sent by opening this page.",
      "No database query, insert, update, migration or deletion is performed.",
      "This section is available only to the Owner / Administrator role.",
      "Production deployment and configuration remain unchanged."
    ]
  });
}
