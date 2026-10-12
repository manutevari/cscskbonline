import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SchemeUpdate = {
  title: string;
  url: string;
  date: string;
  source: "Press Information Bureau";
};

const PIB_RSS = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1";
const ALLOWED_HOSTS = new Set(["pib.gov.in", "www.pib.gov.in"]);
const SCHEME_TERMS = /scheme|yojana|subsidy|scholarship|pension|benefit|farmer|kisan|women|entrepreneur|employment|financial assistance|eligib|application|welfare|ayushman|pm[- ]?/i;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/<[^>]*>/g, "")
    .trim();
}

function readTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function isAllowedOfficialUrl(raw: string) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const response = await fetch(PIB_RSS, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { updates: [], source: PIB_RSS, status: "source_unavailable", checkedAt: new Date().toISOString() },
        { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } },
      );
    }

    const xml = await response.text();
    const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
    const updates: SchemeUpdate[] = [];

    for (const item of items) {
      const title = readTag(item, "title");
      const url = readTag(item, "link");
      const pubDate = readTag(item, "pubDate");
      if (!title || !url || !isAllowedOfficialUrl(url) || !SCHEME_TERMS.test(title)) continue;

      const parsedDate = pubDate ? new Date(pubDate) : null;
      updates.push({
        title,
        url,
        date: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : "",
        source: "Press Information Bureau",
      });
      if (updates.length >= 12) break;
    }

    return NextResponse.json(
      { updates, source: PIB_RSS, status: updates.length ? "ok" : "no_matching_updates", checkedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json(
      { updates: [], source: PIB_RSS, status: "source_unavailable", checkedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } },
    );
  }
}
