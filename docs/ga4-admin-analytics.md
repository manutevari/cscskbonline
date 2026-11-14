# CSCSKB Admin GA4 Business Analytics

Route: `/admin/analytics`

The page is a private, read-only GA4 report. It does not write to GA4, the application database, or public website content.

## Vercel environment variables

Configure these on the CSCSKB frontend Vercel project, for the Preview environment first:

- `GA4_PROPERTY_ID`: numeric GA4 property ID (not the Measurement ID beginning with `G-`).
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: service-account email.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: service-account private key in PEM format. Vercel may store newlines as escaped `\\n`; the route normalizes them.

The route uses the existing `CSCSKB_MARKETING_OWNER_TOKEN` Owner/Admin authentication. The token is entered in the admin page and kept in the current browser tab's session storage. Do not use a `NEXT_PUBLIC_` prefix for any credential.

## Google Analytics setup

1. Enable the Google Analytics Data API in the Google Cloud project associated with the service account.
2. In GA4 Admin → Property access management, add the service-account email with Viewer (or Analyst) access.
3. Copy the numeric Property ID from GA4 Admin → Property details.
4. Add the three environment variables to the Vercel Preview environment.
5. Deploy this feature branch as a Preview deployment and test `/admin/analytics` using an Owner/Admin token.
6. Only after preview validation, decide separately whether to merge and promote to Production.

## Reports

The server-side API returns aggregated GA4 metrics: active users, new users, sessions, page views, event count, engagement duration, daily sessions, default channel group, page titles and event names. Date windows are 7, 28 or 90 days, ending yesterday.

API: `GET /api/admin/analytics?range=7|28|90`

The endpoint requires an authenticated `owner_admin` actor. It does not expose service-account credentials to the browser. API responses are marked no-store.

## Troubleshooting

- 503 / credentials not configured: verify all three GA4 variables exist in the Vercel Preview environment and redeploy the Preview.
- 502 / access denied: check that the Google Analytics Data API is enabled and the service account has access to the correct GA4 property.
- 401: verify the Owner/Admin token is configured as `CSCSKB_MARKETING_OWNER_TOKEN`.

No production environment variables, domains, aliases or deployments are changed by this feature branch.
