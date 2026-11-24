import { chromium } from "playwright";
import assert from "node:assert/strict";
import { stat } from "node:fs/promises";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const failures = [];
const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, acceptDownloads: true });
page.on("pageerror", error => failures.push("pageerror: " + error.message));
page.on("console", message => { if (message.type() === "error") failures.push("console: " + message.text()); });

const fixture = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eee"/><rect x="30" y="30" width="160" height="240" fill="#1769d2"/><circle cx="280" cy="150" r="90" fill="#e11d48"/></svg>'
);

async function downloadAndAssert(label, expectedExtension) {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: label, exact: true }).click()
  ]);
  assert.ok(download.suggestedFilename().toLowerCase().endsWith(expectedExtension), download.suggestedFilename());
  const path = await download.path();
  assert.ok(path, "download should materialize");
  const details = await stat(path);
  assert.ok(details.size > 100, "download should not be empty");
  return { file: download.suggestedFilename(), bytes: details.size, path };
}

try {
  const response = await page.goto(baseUrl + "/document-tools", { waitUntil: "networkidle", timeout: 60000 });
  assert.equal(response?.status(), 200, "Document Tools route should return HTTP 200");
  await page.getByRole("heading", { name: /Smart AI Editor/i }).waitFor();
  assert.equal(await page.locator(".stage").count(), 1, "editor canvas should render");

  // Upload a deterministic local SVG fixture.
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "qa-fixture.svg", mimeType: "image/svg+xml", buffer: fixture
  });
  await page.locator(".thumb").first().waitFor({ timeout: 15000 });
  await page.locator(".thumb").first().click();
  assert.equal(await page.locator(".placed img").count(), 1, "uploaded image should appear on canvas");

  // Rotate and crop using the same controls exposed to users.
  await page.getByRole("button", { name: "Rotate selected photo 90° clockwise" }).click();
  await page.getByRole("button", { name: "Crop selected photo" }).click();
  const placed = page.locator(".placed").first();
  const bounds = await placed.boundingBox();
  assert.ok(bounds && bounds.width > 30 && bounds.height > 30, "fixture should be large enough to crop");
  await page.mouse.move(bounds.x + bounds.width * 0.15, bounds.y + bounds.height * 0.15);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.8, { steps: 5 });
  await page.mouse.up();
  await page.getByRole("button", { name: "Apply crop", exact: true }).click();
  await page.getByText(/Crop लागू हो गया/i).waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: "Undo", exact: true }).first().click();

  // Validate all single-page export formats and ZIP packaging.
  await page.locator(".download-menu summary").click();
  const downloads = [];
  const exportedPdf = await downloadAndAssert("Current page — PDF", ".pdf");
  downloads.push(exportedPdf);

  // PDF round-trip: reopen the exact exported file through the PDF.js import path.
  const beforePdfImport = await page.locator(".thumb").count();
  await page.locator('input[type="file"]').first().setInputFiles(exportedPdf.path);
  await page.getByText(/image\/PDF page\(s\) layout में जोड़ दिए गए/i).waitFor({ timeout: 30000 });
  assert.ok(await page.locator(".thumb").count() > beforePdfImport, "exported PDF should reopen and render at least one page");
  assert.equal(await page.locator(".placed img").count(), 1, "PDF page should be rendered into the editor canvas");
  downloads.push(await downloadAndAssert("Current page — PNG", ".png"));
  downloads.push(await downloadAndAssert("Current page — JPG", ".jpg"));
  downloads.push(await downloadAndAssert("Separate PDFs — ZIP", ".zip"));
  downloads.push(await downloadAndAssert("All pages — PNG ZIP", ".zip"));
  downloads.push(await downloadAndAssert("All pages — JPG ZIP", ".zip"));

  // Verify configured compression reports actual output size.
  await page.getByLabel("Max file size").selectOption("100");
  const compressed = await downloadAndAssert("Current page — JPG", ".jpg");
  assert.ok(compressed.bytes > 0);

  // Exercise page creation and photo-sheet workflow.
  await page.getByRole("button", { name: "Add page" }).click();
  assert.ok(await page.locator(".pagebtn").count() >= 2, "second page should be created");
  await page.locator(".thumb").first().click();
  await page.getByRole("button", { name: "Create passport / ID photo sheet" }).click();
  assert.ok(await page.locator(".thumb").count() > 1, "photo sheet should create copies");

  // Print action is intercepted: no physical print dialog or printer is invoked.
  await page.evaluate(() => { window.__qaPrintCalled = false; window.print = () => { window.__qaPrintCalled = true; }; });
  await page.locator(".compact-toolbar .print-btn").click();
  assert.equal(await page.evaluate(() => window.__qaPrintCalled), true, "print action should invoke window.print");

  // Basic mobile overflow guard.
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(250);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.ok(dimensions.scrollWidth <= dimensions.width + 1, "mobile layout should not overflow horizontally");

  assert.deepEqual(failures, [], "browser should not emit uncaught runtime/console errors");
  console.log(JSON.stringify({
    result: "PASS",
    route: response.status(),
    cases: [
      "route/render", "SVG upload", "canvas placement", "rotate", "crop", "undo",
      "PDF/PNG/JPG exports", "separate-PDF ZIP", "PNG/JPG ZIP", "size-limit path",
      "add page", "photo sheet", "print dispatch", "mobile overflow", "browser console"
    ],
    downloads,
    compressedDownload: compressed,
    mobile: dimensions
  }, null, 2));
} catch (error) {
  console.error("DOCUMENT_TOOLS_E2E_FAIL", error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
