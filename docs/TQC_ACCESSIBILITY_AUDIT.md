# CSCSKB TQC Accessibility Audit & Corrective Action Register

Date: 2026-11-22
Branch: repair/phase-1-security-appointment
Target: WCAG 2.2 AA (internal quality target; not a certification claim)

## Status
REVIEW / REMEDIATION IN PROGRESS. No finding is closed until implementation is retested with evidence.

## Critical corrective actions
- A11Y-01: Document language accuracy. Root language was English despite substantial Hindi UI. Corrected root to hi-IN; mixed-language content still requires language-span audit. Status: PARTIALLY FIXED / OPEN.
- A11Y-02: Keyboard skip navigation. Added visible-on-focus skip link to main-content wrapper. Status: FIXED IN CODE / RETEST REQUIRED.
- A11Y-03: Focus visibility. Added consistent focus-visible outline baseline. Status: FIXED IN CODE / RETEST REQUIRED.
- A11Y-04: Motion sensitivity. Added reduced-motion CSS override. Status: FIXED IN CODE / RETEST REQUIRED.
- A11Y-05: Contrast across all controls, text, badges, buttons, disabled states: OPEN / NEEDS MEASUREMENT.
- A11Y-06: Appointment modal focus management, escape handling, focus return, accessible name, live errors, field labels: OPEN / COMPONENT REVIEW & TEST.
- A11Y-07: Voice assistant dialog, status announcements, speech controls and keyboard operation: OPEN.
- A11Y-08: Document editor keyboard alternatives for drag/crop/resize, accessible file inputs and preview descriptions: OPEN.
- A11Y-09: Jobs dashboard filters, result updates, loading/error announcements, tables/cards and keyboard controls: OPEN.
- A11Y-10: Automated axe/WCAG checks and CI gate: OPEN.
- A11Y-11: Mobile reflow, 200% zoom, Android TalkBack, desktop screen reader test: OPEN.
- A11Y-12: Heading hierarchy, landmarks, link names, icon-only controls, form label/error association and alt text across every route: OPEN.

## Verification required before closure
1. Build/lint/typecheck succeeds.
2. Keyboard-only pass: Tab/Shift+Tab, Enter/Space, Escape, no traps, visible focus, skip link works.
3. Automated axe scan of homepage, jobs/exams, document tools, Tata Water, appointment modal and verification page.
4. Contrast checks: WCAG AA 4.5:1 normal text, 3:1 large text and UI components.
5. Responsive/reflow checks at 320 CSS px and 200% zoom.
6. Android TalkBack; Windows screen reader (NVDA) pass.
7. Screenshots/logs or test report attached; regression pass.

## Closure states
OPEN -> FIXED -> VERIFIED -> CLOSED. Do not mark CLOSED without a retest result and evidence.
