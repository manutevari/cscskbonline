# CSCSKB Online WordPress Integration Plan

## Target WordPress Site

- Production domain: `https://cscskb.online`
- Integration goal: merge the CSCSKB Online AI-powered knowledge and service platform blueprint with the existing WordPress website so WordPress can remain the public CMS while the Next.js/FastAPI platform powers application-grade CSC services, AI search, dashboards, authentication, reviews, and location features.

## Recommended Architecture

```mermaid
flowchart TD
    Visitors[Citizens / VLEs / Admins] --> WP[WordPress CMS at cscskb.online]
    WP --> Marketing[Public pages, posts, SEO content]
    WP --> Reviews[Original reviews and testimonials]
    WP --> Map[Google Maps location embed]
    WP --> Next[Next.js CSCSKB App]
    Next --> API[FastAPI Backend]
    API --> Auth[JWT / OAuth Auth]
    API --> AI[AI Layer: RAG + LangGraph + Voice + OCR]
    API --> Storage[Object Storage]
    API --> DB[(PostgreSQL + pgvector)]
    AI --> DB
    DevOps[Docker + GitHub Actions + Nginx] --> WP
    DevOps --> Next
    DevOps --> API
    DevOps --> Monitoring[Prometheus + Grafana]
```

## WordPress Merge Strategy

### Option A: WordPress as the Front Door

Use WordPress for public content and route application features into subpaths or subdomains:

- `https://cscskb.online/` — WordPress home, pages, blog, SEO landing pages.
- `https://cscskb.online/services/` — WordPress service directory pages with call-to-action links into the app.
- `https://cscskb.online/app/` — reverse-proxied Next.js web application.
- `https://cscskb.online/api/` — reverse-proxied FastAPI backend.
- `https://cscskb.online/admin/` — WordPress admin remains protected and separate from the CSCSKB platform admin dashboard.

### Option B: Headless WordPress

Use WordPress only as a content backend and render all public pages in Next.js:

- WordPress REST API provides posts, pages, reviews, FAQs, schemes, notices, and media.
- Next.js renders the complete public site and app with one design system.
- FastAPI powers authentication, AI, service workflows, analytics, and admin APIs.

For the current project, Option A is the safest migration path because it preserves the existing WordPress site while allowing the new platform to launch incrementally.

## WordPress Content to Add

### Homepage Sections

1. Hero section: `CSCSKB Online – AI Powered CSC Knowledge & Service Platform`.
2. CSC services directory with eligibility, documents, fees, and processing time.
3. AI assistant call-to-action for citizens and VLEs.
4. Reviews and testimonials block.
5. Google Map location block.
6. Contact block for Ankit Tiwari CSC Center.

### Suggested WordPress Pages

- `/about/`
- `/services/`
- `/schemes/`
- `/knowledge-base/`
- `/ai-assistant/`
- `/reviews/`
- `/contact/`
- `/privacy-policy/`
- `/terms-and-conditions/`

### Original Review Content

The following original reviews can be added to WordPress as testimonials or review cards:

> "Very helpful CSC center for online government services. The guidance was clear, the process was transparent, and my work was completed on time."

> "Ankit Tiwari CSC Center provides quick support for digital services, forms, certificates, and online applications. Staff behavior is professional and friendly."

> "A reliable place for CSC-related work. I liked the step-by-step explanation, document checklist support, and fast service updates."

> "Good experience with online service assistance. The center explains eligibility, required documents, fees, and expected processing time before starting the work."

## Map Location Integration

The confirmed Google Maps share URL is:

```text
https://maps.app.goo.gl/WNidZh1cEukiXna88
```

Add this URL to the WordPress contact page as the primary directions link. If a full Google Maps place embed URL is available from the business profile, replace the search-based iframe source below with that official embed URL.

### WordPress Map Embed Block

```html
<section class="cscskb-location">
  <h2>Visit Ankit Tiwari CSC Center</h2>
  <p>Use the map link below for directions to the CSC center.</p>
  <p><a href="https://maps.app.goo.gl/WNidZh1cEukiXna88" target="_blank" rel="noopener noreferrer">Open location in Google Maps</a></p>
  <!-- Replace src with the official Google Maps embed URL from the business profile. -->
  <iframe
    title="Ankit Tiwari CSC Center location map"
    src="https://www.google.com/maps?q=Ankit%20Tiwari%20CSC%20Center&output=embed"
    width="100%"
    height="420"
    style="border:0; border-radius:16px;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</section>
```


## WordPress.com Domain Merge and DNS Checklist

The WordPress.com domain management URL for this project is:

```text
https://wordpress.com/domains/manage/cscskb.online/edit/cscskb.wordpress.com
```

Use this page to complete the domain merge so `cscskb.online` becomes the primary public address for the existing `cscskb.wordpress.com` site.

### Recommended Merge Steps

1. Open the WordPress.com domain management URL above while logged in as the site owner.
2. Confirm that `cscskb.online` is attached to the `cscskb.wordpress.com` WordPress.com site.
3. Set `cscskb.online` as the primary domain after WordPress.com shows the domain as active and SSL is issued.
4. Keep `cscskb.wordpress.com` available as the fallback WordPress.com address during propagation.
5. After the domain is active, test both `https://cscskb.online` and `https://www.cscskb.online` on desktop and mobile.

### DNS Required?

DNS changes are required only if WordPress.com shows the domain as disconnected, verifying, or not using WordPress.com name servers. The recommended WordPress.com setup is to point the domain name servers to WordPress.com:

```text
ns1.wordpress.com
ns2.wordpress.com
ns3.wordpress.com
```

Remove old name servers when switching to WordPress.com name servers. If email already exists on `cscskb.online`, copy the current MX, TXT, SPF, DKIM, and DMARC records into WordPress.com DNS before changing name servers so mail service is not interrupted.

### DNS Records to Apply

If you are managing DNS outside WordPress.com instead of using WordPress.com's name servers, apply the following records in the active DNS provider. Keep only one authoritative name-server path active: either WordPress.com name servers or these externally hosted DNS records.

| Type | Name/Host | Value/Target | Priority | Purpose |
| --- | --- | --- | --- | --- |
| `A` | `@` | `203.0.113.10` | - | Root domain IPv4 target for `cscskb.online`. |
| `AAAA` | `@` | `2001:db8::10` | - | Root domain IPv6 target for `cscskb.online`. |
| `CNAME` | `www` | `cscskb.online` | - | Sends `www.cscskb.online` to the root domain. |
| `MX` | `@` | `mail.cscskb.online` | `10` | Routes domain email. |
| `TXT` | `@` | `v=spf1 include:... ~all` | - | SPF sender policy. Replace `include:...` with the actual mail provider include. |
| `TXT` | `selector1._domainkey` | `selector1._domainkey ...` | - | DKIM selector record. Replace the placeholder with the full DKIM value from the mail provider. |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:...` | - | DMARC policy. Replace `mailto:...` with the reporting mailbox. |
| `NS` | `@` | `ns1.example.com` | - | External authoritative name server 1, if using non-WordPress.com DNS. |
| `NS` | `@` | `ns2.example.com` | - | External authoritative name server 2, if using non-WordPress.com DNS. |

Important: `203.0.113.10`, `2001:db8::10`, `include:...`, `selector1._domainkey ...`, `mailto:...`, `ns1.example.com`, and `ns2.example.com` are placeholder/example values unless they are exactly what the hosting and email providers issued for `cscskb.online`. Do not publish placeholders on a live domain; replace them with the real provider values first.

### Alternative WordPress.com DNS Method

If the registrar cannot change name servers, use WordPress.com's alternative A/CNAME record method from the WordPress.com domain connection screen. In that case:

- Add the exact A records WordPress.com displays for the root/apex domain.
- Add the exact CNAME record WordPress.com displays for `www`.
- Do not invent IP addresses; use only the values shown in WordPress.com for this domain.
- Wait for DNS propagation before changing unrelated records.

### Propagation and Verification

DNS propagation can take up to 72 hours. During that period, some visitors may still see the old destination. Verify the merge by checking:

- WordPress.com domain status is `Active`.
- SSL/HTTPS is issued for `cscskb.online`.
- `cscskb.online` is selected as the primary domain.
- `www.cscskb.online` redirects or resolves correctly.
- Existing email records still resolve if email is used on the domain.

## Nginx Reverse Proxy Example

```nginx
server {
    server_name cscskb.online www.cscskb.online;

    location / {
        proxy_pass http://wordpress:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /app/ {
        proxy_pass http://nextjs:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://fastapi:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## OpenRouter API Key Configuration

Use OpenRouter as the AI provider for the CSCSKB assistant and future FastAPI/Next.js AI features. Do not commit a real key to this repository. Store it only in the deployment secret manager or WordPress/plugin settings that are protected from public access.

```env
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/auto
```

OpenRouter is OpenAI-compatible, so integrations that already use an OpenAI SDK should point the SDK base URL to `https://openrouter.ai/api/v1` and send the `OPENROUTER_API_KEY` value as the bearer/API key. Keep separate environment variables for OpenRouter instead of reusing an `OPENAI_API_KEY`, which avoids accidentally sending OpenRouter credentials to the wrong provider endpoint.

### OpenRouter Deployment Checklist

- Create the API key in OpenRouter and copy it once into the hosting secret store.
- Set `OPENROUTER_BASE_URL` to `https://openrouter.ai/api/v1`.
- Set `OPENROUTER_MODEL` to the chosen model slug; use `openrouter/auto` only when automatic routing is acceptable.
- Restart the app/API process after adding the secret.
- Test the assistant with a low-risk prompt before enabling it on public WordPress pages.

## Implementation Checklist

- [ ] Back up the current WordPress database and uploads directory.
- [ ] Add the review/testimonial block to WordPress.
- [ ] Add the map section to the WordPress contact page.
- [ ] Configure `/app/` to proxy to the Next.js frontend.
- [ ] Configure `/api/` to proxy to the FastAPI backend.
- [ ] Confirm WordPress permalinks do not conflict with app/API paths.
- [ ] Add canonical URLs and metadata for SEO pages.
- [ ] Test mobile responsiveness, Core Web Vitals, and form submissions.
- [ ] Verify Google Maps link opens correctly on desktop and mobile.

## Auto-Updating CSC News Marquee

Install the bundled WordPress plugin at `wordpress-plugin/cscskb-csc-news-marquee/cscskb-csc-news-marquee.php` and add this shortcode to the WordPress homepage or header:

```text
[cscskb_csc_news_marquee]
```

The marquee checks official CSC-owned sources first, caches headlines for 30 minutes, links users to the source page, and falls back to local CSCSKB announcements if official sources are temporarily unavailable.
