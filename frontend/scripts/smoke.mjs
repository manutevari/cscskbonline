#!/usr/bin/env node
const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const checks = [
  { path: "/", expected: 200, name: "Homepage" },
  { path: "/manifest.webmanifest", expected: 200, name: "PWA manifest" },
  { path: "/offline.html", expected: 200, name: "Offline fallback" },
  { path: "/icon.svg", expected: 200, name: "App icon" },
  { path: "/robots.txt", expected: 200, name: "Robots" },
  { path: "/sitemap.xml", expected: 200, name: "Sitemap" },
  { path: "/api/appointments/availability?date=bad-date", expected: 400, name: "Invalid availability date rejected" },
];
let failed = 0;
for (const check of checks) {
  try {
    const response = await fetch(new URL(check.path, base), { redirect: "manual" });
    const pass = response.status === check.expected;
    console.log(`${pass ? "PASS" : "FAIL"} ${check.name}: expected ${check.expected}, got ${response.status}`);
    if (!pass) failed++;
    if (check.path === "/manifest.webmanifest" && pass) {
      const manifest = await response.json();
      for (const [key, expected] of [["name", "CSCSKB Online — CSC Shikohabad"], ["display", "standalone"], ["start_url", "/"]]) {
        const ok = manifest[key] === expected;
        console.log(`${ok ? "PASS" : "FAIL"} Manifest ${key}`);
        if (!ok) failed++;
      }
    }
  } catch (error) {
    console.log(`FAIL ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}
console.log(`Smoke checks: ${checks.length + 3 - failed}/${checks.length + 3} passed`);
process.exitCode = failed ? 1 : 0;
