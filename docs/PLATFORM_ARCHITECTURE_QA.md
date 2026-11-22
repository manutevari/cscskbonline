# CSCSKB Platform Architecture & Quality Gates

## Objective
One maintainable application that works across mobile browsers, desktop browsers, installable PWA surfaces, and future native shells without duplicating business logic.

## Platform strategy
- Primary: Next.js responsive web + installable PWA.
- Android/iOS: PWA installation first; native shell (Capacitor or equivalent) only when native capabilities justify it.
- Desktop: responsive browser, installable PWA where supported.
- Future: shared service/API contracts, design tokens, feature modules; avoid platform-specific business logic.

## Layers
1. Presentation: responsive components, keyboard/touch accessible controls, reduced-motion and safe-area support.
2. Feature modules: appointments, recruitment, assistant, document tools, Tata Water, marketing.
3. Service/API layer: validated request/response contracts, clear status codes, timeouts, retry policy and idempotency for mutations.
4. Data layer: server-only credentials, Supabase access, explicit schema/migrations, RLS and constraints.
5. Integrations: WhatsApp, SMS, AI provider, analytics; isolated behind adapters with independent status and failure handling.
6. Observability: structured logs without sensitive payloads, correlation IDs, health checks and alertable errors.

## Platform baseline implemented in this branch
- Web manifest, install metadata, app icon, conservative service worker.
- Offline navigation fallback; APIs and private/user-specific data are not cached.
- Service-worker registration is production-only and non-blocking.
- Responsive/safe-area CSS, 44px touch targets, focus-visible, reduced-motion.
- Appointment failure UI styled; slots hidden when availability is unknown.
- Smoke test for public shell, manifest, offline fallback, icon, robots, sitemap and malformed availability date.
- CI uses reproducible npm ci, dependency audit, typecheck, build, smoke tests and Python compile.

## QA matrix
| Surface | Minimum checks |
| --- | --- |
| Android Chrome | 360/390/412 widths, portrait/landscape, install, standalone, back navigation, keyboard, safe areas |
| iOS Safari | 375/390/430 widths, add-to-home-screen, standalone status bar, scroll/keyboard, safe areas |
| Desktop Chrome/Edge | 1280/1440/1920 widths, keyboard navigation, forms, downloads, print |
| Firefox | navigation, form validation, layout, document tools |
| Safari macOS | responsive, downloads/print, assistant, media permissions |
| Tablet | 768/820/1024 widths, split layouts, orientation |
| Low bandwidth/offline | shell fallback, no false success, no background submission, retry after reconnect |
| Accessibility | focus order, labels, contrast, 44px touch target, reduced motion, screen-reader names |
| API | validation, auth, RLS, rate limits, idempotency, concurrency, timeout/failure behavior |
| Integrations | test each channel independently; do not send real customer messages in QA without explicit consent |

## Release gate (must pass before production)
- Build and TypeScript pass.
- High-severity dependency audit pass.
- Automated smoke tests pass.
- No critical console/runtime errors.
- All primary flows tested on at least Android Chrome and iOS Safari plus desktop Chromium.
- API/database migrations verified and rollback strategy documented.
- Appointment booking, verification and notification statuses verified end-to-end.
- Production secrets remain server-side; no secret copied into Preview without approval.
- Privacy, consent, data minimisation and retention behavior reviewed.
- No production deployment without owner approval.
