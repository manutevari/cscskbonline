import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Official source pages only. These are portal/notice destinations, not a claim
// that every action has a candidate-specific URL for every advertisement.
const PORTALS = [
  { name: "SSC", category: "Central Government", url: "https://ssc.gov.in/", feeds: ["https://ssccr.gov.in/announcements", "https://sscnr.nic.in/newlook/site/index.html"] },
  { name: "UPPSC", category: "Uttar Pradesh", url: "https://uppsc.up.nic.in/", feeds: ["https://uppsc.pariksha.nic.in/CandidatePages/Notifications.aspx"] },
  { name: "UPSSSC", category: "Uttar Pradesh", url: "https://upsssc.gov.in/", feeds: ["https://upsssc.gov.in/"] },
  { name: "UPESSC / Super TET", category: "Uttar Pradesh · Teacher recruitment", url: "https://apply.upessc.org/", feeds: ["https://apply.upessc.org/"] },
  { name: "UPTET / Exam Regulatory Authority", category: "Uttar Pradesh · Teacher eligibility", url: "https://updeled.gov.in/", feeds: ["https://updeled.gov.in/"] },
  { name: "Railway Recruitment", category: "Central Government", url: "https://rrcnr.org/", feeds: ["https://rrcnr.org/", "https://rrccr.com/home/home"] },
  { name: "UP Police Recruitment", category: "Uttar Pradesh", url: "https://uppbpb.gov.in/", feeds: ["https://uppbpb.gov.in/"] },
];

const NOTICE_WORDS = /recruit|vacan|advertis|noti(f|fi)|result|admit|answer|exam|notice|tender|application|भर्ती|विज्ञ|परिणाम|प्रवेश पत्र|परीक्षा|सूचना|आवेदन|registration|correction|schedule/i;

function stripTags(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ").trim();
}
function parseLinks(html, baseUrl, sourceName) {
  const links = [];
  const pattern = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null && links.length < 60) {
    const href = (match[1] || match[2] || match[3] || "").trim();
    const title = stripTags(match[4] || "");
    if (!href || !title || title.length < 4 || title.length > 240 || !NOTICE_WORDS.test(title)) continue;
    if (/\{\{|\}\}|\|\s*translate|\btranslate\b/i.test(title)) continue;
    try {
      const url = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      if (!links.some(item => item.url === url.href)) links.push({ title, url: url.href, source: sourceName });
    } catch {}
  }
  return links;
}
async function checkPage(url, name) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CSCSKBRecruitmentUpdates/1.1; +https://www.cscskb.online)", Accept: "text/html,application/xhtml+xml" },
      cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(10000),
    });
    const html = response.ok ? await response.text() : "";
    return { url, status: response.ok ? "online" : "unavailable", httpStatus: response.status, updates: html ? parseLinks(html, response.url || url, name) : [] };
  } catch {
    return { url, status: "unverified", httpStatus: null, updates: [] };
  }
}
export async function GET() {
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(PORTALS.map(async portal => {
    const checks = await Promise.all(portal.feeds.map(url => checkPage(url, portal.name)));
    const updates = checks.flatMap(item => item.updates).sort((a,b) => b.title.localeCompare(a.title)).slice(0, 20);
    const failed = checks.some(item => item.status === "unavailable");
    const online = checks.some(item => item.status === "online");
    return { ...portal, status: online ? "online" : failed ? "unavailable" : "unverified",
      httpStatus: checks.find(item => item.httpStatus)?.httpStatus ?? null,
      checks: checks.map(({url,status,httpStatus}) => ({url,status,httpStatus})), updates };
  }));
  const totalUpdates = results.reduce((sum, item) => sum + item.updates.length, 0);
  return NextResponse.json({ checkedAt, nextCheckSeconds: 120, sourceType: "official_portal_pages", totalUpdates, portals: results },
    { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store" } });
}
