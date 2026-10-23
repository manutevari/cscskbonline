import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PORTALS = [
  { name: "SSC", url: "https://ssc.gov.in/", category: "Central Government" },
  { name: "UPPSC", url: "https://uppsc.up.nic.in/", category: "Uttar Pradesh" },
  { name: "UPSSSC", url: "https://upsssc.gov.in/", category: "Uttar Pradesh" },
  { name: "Railway Recruitment", url: "https://www.rrbapply.gov.in/", category: "Central Government" },
  { name: "UP Police Recruitment", url: "https://uppbpb.gov.in/", category: "Uttar Pradesh" },
];

const NOTICE_WORDS = /recruit|vacan|advertis|noti(f|fi)|result|admit|answer|exam|notice|tender|application|भर्ती|विज्ञ|परिणाम|प्रवेश पत्र|परीक्षा|सूचना|आवेदन/i;

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ").trim();
}

function parseLinks(html, baseUrl) {
  const links = [];
  const pattern = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null && links.length < 30) {
    const href = (match[1] || match[2] || match[3] || "").trim();
    const title = stripTags(match[4] || "");
    if (!href || !title || title.length < 4 || title.length > 180 || !NOTICE_WORDS.test(title)) continue;
    // Ignore framework translation placeholders accidentally present in portal HTML.
    if (/\{\{|\}\}|\|\s*translate|Examinations_HM|\btranslate\b/i.test(title)) continue;
    try {
      const url = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      links.push({ title, url: url.href });
    } catch {}
  }
  return links;
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(PORTALS.map(async (portal) => {
    try {
      const response = await fetch(portal.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CSCSKBRecruitmentUpdates/1.0; +https://www.cscskb.online)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });
      if (!response.ok) {
        return { ...portal, status: "unavailable", httpStatus: response.status, updates: [] };
      }
      const html = await response.text();
      const updates = parseLinks(html, portal.url).slice(0, 8);
      return { ...portal, status: "checked", httpStatus: response.status, updates };
    } catch {
      return { ...portal, status: "unavailable", updates: [] };
    }
  }));

  const totalUpdates = results.reduce((sum, item) => sum + item.updates.length, 0);
  return NextResponse.json(
    { checkedAt, sourceType: "official_portal_live_check", totalUpdates, portals: results },
    { headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store" } }
  );
}
