import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const output = resolve("qa/fixtures/encrypted-whitespace.pdf");
const temp = resolve("/tmp/cscskb-password-fixture.pdf");
const stream = "BT /F1 18 Tf 72 720 Td (CSCSKB PDF password QA fixture) Tj ET";
const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
];
let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
await mkdir(dirname(output), { recursive: true });
await writeFile(temp, pdf);
execFileSync("qpdf", ["--encrypt", "  pass  ", "owner-pass", "256", "--", temp, output]);
console.log("Created encrypted whitespace-password fixture:", output);
