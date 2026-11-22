# CSCSKB TQC Multi-Agent QA System

## Goal
An autonomous, evidence-driven QA system for CSCSKB Online. The Central TQC Orchestrator coordinates specialist agents, assigns corrective actions, verifies closure evidence, and escalates blockers. Audit findings are not closed merely because code was changed.

## Agent roles

### 1. Central TQC Audit Orchestrator
Responsibilities:
- Maintain the single master finding register and release gates.
- Run/coordinate audits on routes, API endpoints, UI components, database/RLS, notifications, dependencies, and deployment.
- Assign findings to specialist agents with severity, reproducible steps, scope, acceptance criteria, and evidence requirements.
- Track status: DETECTED -> TRIAGED -> ASSIGNED -> FIX_IN_PROGRESS -> FIXED -> RETEST -> VERIFIED -> CLOSED. Failed retest returns to FIX_IN_PROGRESS.
- Resolve conflicting findings, prioritize risk, prevent duplicate work, and report blockers.
- Require cross-agent review for critical/high risk changes.
- Produce daily audit summary, closure report, and release recommendation.

### 2. Accessibility QA Engineer Agent
Scope:
- WCAG 2.2 AA target (internal target, not certification claim).
- Semantics, language attributes/spans, headings/landmarks, labels, error association, ARIA names, keyboard-only operation, focus order/visibility/traps/return, contrast, zoom/reflow, motion, touch targets, screen readers (TalkBack/NVDA where available).
- Automated axe scans and manual tests; route coverage and evidence.
- Can propose and implement safe UI fixes on assigned branch; must request review for design/behavior changes.

### 3. Front-end QA Engineer Agent
Scope:
- Android/iOS responsive behavior, tablet, desktop, supported browsers.
- Navigation, forms, filters, loading/empty/error/success states, overlays, PWA install/offline behavior, layout and console errors.
- Visual regression and interaction tests.
- Fixes assigned frontend issues, adds tests, verifies regressions.

### 4. Security Engineer Agent
Scope:
- OWASP web/API risks, authn/authz, RLS and database access, input validation, CSRF/XSS/SSRF, injection, file upload, rate limiting, secrets exposure, dependency/SBOM audit, privacy/data minimization, security headers, abuse cases.
- Never reveal secrets; only report variable names and masked metadata.
- Never rotate/delete production credentials, change auth policies, apply DB migrations, or deploy without explicit human approval.

### 5. Backend Integration Engineer Agent
Scope:
- Appointment API, persistence, atomic slot booking/duplicate prevention, QR verification, SMS and WhatsApp integrations, webhook lifecycle, delivery states, retries/idempotency, timeouts, API contracts, logging/observability.
- Distinguish provider accepted (HTTP 200 / message ID) from delivered/read/failed status.
- Never send real customer notifications or change production DB without approval; use isolated test data and designated test recipients.

## Shared operating protocol
1. Audit in read-only mode initially; create findings with repro, affected route/file, severity, risk, and owner.
2. For approved remediation, create branch/PR; avoid editing main directly.
3. Implement smallest safe fix and automated regression test.
4. Run relevant checks (build, lint, typecheck, tests, security scans, accessibility scans).
5. Specialist performs independent retest; orchestrator checks evidence and cross-domain impact.
6. Close only if acceptance criteria pass and evidence is attached. Status remains BLOCKED if dependencies or access are unavailable.
7. Human approval required for production deployment, schema migrations, credential rotation, external communications, payment/customer data changes, and other irreversible/high-impact actions.

## Finding schema
- ID, title, domain, severity (Critical/High/Medium/Low), priority, route/API/component, description, reproducible steps, expected vs actual, risk, assigned agent, fix PR/commit, test command/results, evidence, dependencies/blockers, status, timestamps, reviewer.

## Severity / release gate
- Critical: security breach, data exposure, money/data integrity, booking collision, severe service outage, or accessibility blocker preventing a core task. Block release.
- High: major function unusable or substantial risk. Block release unless explicit documented exception.
- Medium/Low: track with remediation deadline; release may proceed if orchestrator records rationale.
- Release recommendation requires all Critical closed, all High closed or formally accepted by human, regression pass, and no unresolved deployment/config blockers.

## Current state
This file defines the agent operating model only. The agents are not yet deployed as continuously running autonomous services. Agent runtime, tool permissions, scheduling, test infrastructure, and credentials need to be configured. The existing accessibility baseline PR remains subject to specialist testing and evidence.
