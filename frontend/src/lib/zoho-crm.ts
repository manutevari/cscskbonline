type ZohoLeadInput = {
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  vertical: string;
  service_interest: string | null;
  message: string | null;
  source: string;
  consent_to_contact: boolean;
};

type ZohoApiResult = {
  data?: Array<{ status?: string; code?: string; details?: { id?: string }; message?: string }>;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function optionalField(name: string, value: string | boolean | null): Record<string, string | boolean> {
  const apiName = process.env[name]?.trim();
  return apiName && value !== null && value !== "" ? { [apiName]: value } : {};
}

/**
 * Upserts one consented CSCSKB enquiry into Zoho CRM Leads.
 * OAuth credentials and API domains are server-only environment variables.
 */
export async function syncZohoLead(input: ZohoLeadInput): Promise<{ id: string | null }> {
  if (!input.consent_to_contact) throw new Error("Contact consent is required before Zoho sync.");

  const accountsDomain = (process.env.ZOHO_ACCOUNTS_DOMAIN || "https://accounts.zoho.in").replace(/\/$/, "");
  const configuredApiDomain = (process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.in").replace(/\/$/, "");
  const tokenResponse = await fetch(`${accountsDomain}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: requiredEnv("ZOHO_REFRESH_TOKEN"),
      client_id: requiredEnv("ZOHO_CLIENT_ID"),
      client_secret: requiredEnv("ZOHO_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof tokenBody.access_token !== "string") {
    throw new Error("Zoho OAuth refresh failed. Verify the Zoho data-center domain and server credentials.");
  }

  const nameParts = input.full_name.trim().split(/\s+/);
  const lastName = nameParts.pop() || input.full_name;
  const firstName = nameParts.join(" ");
  const description = [
    `CSCSKB vertical: ${input.vertical}`,
    `Service interest: ${input.service_interest || "Not specified"}`,
    `Enquiry: ${input.message || "Not specified"}`,
    `Source: ${input.source}`,
    "Contact consent: Yes (captured on CSCSKB website)",
  ].join("\n");

  const lead: Record<string, string | boolean> = {
    Last_Name: lastName,
    Company: "CSCSKB Website Enquiry",
    Phone: input.phone,
    Lead_Source: process.env.ZOHO_LEAD_SOURCE || "Website",
    Description: description,
    ...(firstName ? { First_Name: firstName } : {}),
    ...(input.city ? { City: input.city } : {}),
    ...optionalField("ZOHO_LEAD_SERVICE_INTEREST_FIELD", input.service_interest),
    ...optionalField("ZOHO_LEAD_VERTICAL_FIELD", input.vertical),
    ...optionalField("ZOHO_LEAD_CONSENT_FIELD", true),
  };
  if (input.email) lead.Email = input.email;

  const apiDomain = typeof tokenBody.api_domain === "string" ? tokenBody.api_domain.replace(/\/$/, "") : configuredApiDomain;
  const response = await fetch(`${apiDomain}/crm/v8/Leads/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${tokenBody.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [lead],
      ...(input.email ? { duplicate_check_fields: ["Email"] } : {}),
    }),
    cache: "no-store",
  });
  const result = (await response.json().catch(() => ({}))) as ZohoApiResult;
  const item = result.data?.[0];
  if (!response.ok || item?.status !== "success") {
    throw new Error(`Zoho CRM lead upsert failed: ${item?.code || response.statusText || "unknown error"}`);
  }
  return { id: item.details?.id || null };
}
