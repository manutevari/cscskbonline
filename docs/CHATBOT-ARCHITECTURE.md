# CSCSKB AI Chatbot — architecture and preview checklist

## Scope and isolation
- Public-facing citizen and CSC VLE help only: government schemes, recruitment/exam guidance, form/document guidance, and safe CSC service navigation.
- Hindi, Hinglish and English are supported by the existing voice/chat UI.
- Booking intent continues to open the existing appointment assistant; the chatbot never claims a booking is complete.
- The chatbot is a separate runtime route from the AI Marketing Agent. It does not import marketing code, credentials, campaign data, lead records, approval queues, Facebook publishing, or WhatsApp campaign workflows.
- OpenRouter credentials may be shared at the infrastructure level, but model selection is chatbot-specific through CSCSKB_CHATBOT_MODEL_* variables. Marketing model variables are never read by this route.
- The existing Smart AI Editor and its Crop, Edit and Resize flows are untouched.

## Request path
- Existing UI: `CSCLiveVoiceAssistant.tsx`
- Dedicated server endpoint: `POST /api/voice/chat`
- Specialist selection: recruitment, forms/documents, government schemes, or general citizen/CSC support.
- Official recruitment homepage scan is included only for recruitment-related questions. Candidate links are not treated as proof of an active vacancy.
- Existing safety policy remains: no requests for Aadhaar numbers, OTPs, PINs, passwords or bank credentials; no unverified fees/prices; no false claims of booking/submission.

## Environment
Set these server-side in the Vercel Preview environment (never use NEXT_PUBLIC_):
- `OPENROUTER_API_KEY`
- `CSCSKB_CHATBOT_MODEL_PRIMARY` (default: `z-ai/glm-5.3-flash`)
- `CSCSKB_CHATBOT_MODEL_FALLBACK` (default: `deepseek/deepseek-v4.1-flash`)
- `CSCSKB_CHATBOT_MODEL_SECONDARY` (default: `google/gemini-2.5-flash`)

The route uses the OpenRouter model fallback list and returns a controlled error when no model is available. Never commit provider keys or tokens.

## Preview validation before production
1. Confirm the preview deployment uses the feature branch and preview-only environment variables.
2. Verify Hindi, Hinglish and English responses.
3. Verify scheme, recruitment and form/document specialist selection.
4. Verify recruitment answers distinguish candidate links from verified vacancies.
5. Verify price/fee questions receive the fixed refusal.
6. Verify booking intent opens the existing appointment booking UI and does not fabricate a booking.
7. Verify out-of-scope requests are declined.
8. Verify invalid origins are rejected.
9. Confirm the Marketing Agent admin/API still works independently and Facebook publishing remains behind its existing human approval workflow.
10. Regression-test Smart AI Editor Crop, Edit and Resize without modifications.

## Deployment guardrail
This change is on `feat/cscskb-independent-chatbot-openrouter`. Do not merge to `main` or deploy to Production until preview QA and explicit production approval. The Claude artifact URL was supplied, but its source code was not available to this repository inspection; this implementation is a native CSCSKB chatbot integration and does not claim to reproduce that artifact.
