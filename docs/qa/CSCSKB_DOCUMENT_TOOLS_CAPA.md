# CSCSKB Document Tools — QA and CAPA Register

**Scope:** `frontend/src/app/document-tools/page.tsx` and `frontend/src/components/SmartPrintEditor.tsx`  
**Baseline:** `main` at `95583c21c4e95b7b4cb8b2be6a5d05241c742883`  
**Working branch:** `qa/cscskb-document-tools-capa-20261124`  
**Production changes:** prohibited until explicit approval.

## QA method

The regression suite runs against a locally built Next.js production server in CI. It exercises the user-facing route, image upload, canvas placement, rotate, crop, undo, PDF/PNG/JPG downloads, ZIP exports, size-limit path, page creation, photo-sheet generation, print dispatch (intercepted; no physical print), mobile overflow and browser runtime errors.

The suite uses a deterministic local SVG fixture. It does not upload user documents or call production APIs.

## CAPA register

| ID | Finding / risk | Root cause | Corrective action | Preventive action | Closure evidence |
|---|---|---|---|---|---|
| CAPA-DT-001 | Downloaded raster/PDF output omitted sharpness while preview and print showed it | `renderPageCanvas` applied brightness/contrast but did not apply the sharpness level | Apply bounded 3×3 sharpening convolution to each rendered item region before encoding | Browser regression coverage and code review gate | E2E run must pass; compare exported pixel output against baseline fixture |
| CAPA-DT-002 | No dedicated Document Tools automated test command or browser regression suite | Frontend package exposed only dev/build/start scripts | Add Playwright-driven browser regression script invoked by CI | Run suite on every PR to main | CI job green with test summary |
| CAPA-DT-003 | Existing quality workflow granted repository write access and automatically repaired/pushed dependency changes | CI combined validation and mutation in one PR-triggered workflow | Restrict workflow permissions to read and use deterministic `npm ci`; remove auto-fix/push steps | Dependency updates via separate reviewed PR | Workflow diff and least-privilege permissions review |
| CAPA-DT-005 | Initial browser CI attempt failed before E2E execution | GitHub `ubuntu-latest` runner had moved to Ubuntu 26.04, which Playwright 1.55 did not support; the temporary old runner also surfaced a high-severity advisory | Pin CI runner to supported Ubuntu 24.04 and install the current Playwright package for the runner | Keep runner OS and browser toolchain compatibility explicit; monitor Playwright security advisories | Rerun must install Chromium and complete E2E suite |
| CAPA-DT-006 | PDF export was downloaded but PDF re-import/round-trip was not covered | Existing browser test asserted only file extension and non-zero bytes; it did not parse/reopen the PDF | Added browser test to feed the downloaded PDF back through the PDF.js import flow and assert a page thumbnail and canvas render | Require PDF export→re-import regression on every PR | Corrected CI run must pass with PDF round-trip assertion |
| CAPA-DT-007 | PDF passwords consisting only of whitespace were rejected by client-side empty-input validation | Submit handler used `trim()` to validate a password, which changes the validity test for passwords consisting only of whitespace | Validate only zero-length input and pass the original password string unchanged to PDF.js; add encrypted fixture testing wrong-password retry and correct all-whitespace password | Keep encrypted-PDF regression fixture in CI; never normalize user-supplied PDF passwords | E2E must prove incorrect-password feedback followed by successful decrypt/render using the exact all-whitespace password |
| CAPA-DT-004 | Real-device, physical print, high-resolution stress and protected-PDF validation cannot be certified by headless browser alone | Environment requires actual Android devices, printer hardware, large controlled fixtures and known PDF passwords | Keep these as explicit manual acceptance gates; do not report them as passed | Maintain device/printer matrix and approved synthetic test fixtures | Signed manual QA evidence required |

## Test classification

- **Automated:** local route/build, fixture upload, rotate, crop, undo, export file presence/type/non-empty size, ZIP download, page creation, photo sheet, intercepted print dispatch, mobile viewport overflow and uncaught browser errors.
- **Static review:** source wiring, local-only file handling, file-size guard, export compression path, PDF permission/password handling and keyboard interaction logic.
- **Manual acceptance required:** physical print scaling/margins, real Android touch gestures across supported devices, high-DPI memory pressure, very large multi-page PDFs, password-protected PDF success/failure/cancel paths, screen-reader testing and actual exported pixel fidelity.

## Release/closure criteria

1. Build, security audit and browser regression all pass on the QA branch.
2. Every critical/high defect has a verified fix and regression test.
3. Manual acceptance gates are signed off with device/printer and sample-file evidence.
4. No production deployment or merge occurs without owner approval.
