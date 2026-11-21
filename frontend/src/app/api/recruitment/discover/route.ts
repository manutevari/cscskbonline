import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOfficial(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "gov.in" || host.endsWith(".gov.in") || host === "nic.in" || host.endsWith(".nic.in") || host.endsWith(".edu.in");
  } catch { return false; }
}

function extractDates(text: string) {
  const patterns = [
    /(?:application|apply|registration|form)\s*(?:start|starts|begin|begins|from|opening)?\s*[:\-–]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/ig,
    /(?:last date|closing date|deadline|application end|apply till|ends)\s*[:\-–]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/ig,
    /(?:exam date|examination date|written exam|परीक्षा तिथि|परीक्षा)\s*[:\-–]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/ig,
    /(?:notification date|published|released|dated)\s*[:\-–]?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/ig
  ];
  const found: string[] = [];
  for (const p of patterns) { let m: RegExpExecArray | null; while ((m = p.exec(text)) && found.length < 12) found.push(m[1]); }
  return [...new Set(found)];
}

export async function POST(request: Request) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Tavily is not configured for this Preview deployment.", configured: false }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const query = String(body.query || "").trim().slice(0, 180);
  if (!query) return NextResponse.json({ error: "Enter a recruitment search query." }, { status: 400 });
  const jurisdiction = String(body.jurisdiction || "All India").slice(0, 80);
  const category = String(body.category || "All categories").slice(0, 80);
  const searchQuery = [query, jurisdiction !== "All India" ? jurisdiction : "", category !== "All categories" ? category : "", "government recruitment vacancy notification"].filter(Boolean).join(" ");
  try {
    const response = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey, query: searchQuery, search_depth: "advanced", max_results: 10, include_answer: false, include_raw_content: true }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Tavily request failed");
    const data = await response.json();
    const notices = (Array.isArray(data.results) ? data.results : []).map((r: any) => {
      const url = String(r.url || "");
      const raw = String(r.raw_content || r.content || "");
      const official = isOfficial(url);
      return { title: String(r.title || "Recruitment notice").slice(0, 250), url, sourceDomain: (() => { try { return new URL(url).hostname; } catch { return ""; } })(), publishedDate: r.published_date || null, retrievedAt: new Date().toISOString(), excerpt: String(r.content || "").slice(0, 900), extractedDates: extractDates(raw), evidenceStatus: official ? "Official domain — verify notice" : "Discovery lead — verify official source", isOfficialDomain: official, score: typeof r.score === "number" ? r.score : null };
    });
    return NextResponse.json({ query: searchQuery, checkedAt: new Date().toISOString(), notices, disclaimer: "Discovery only. Dates and details extracted from search content are unverified until the original official notice is checked." }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Search failed. Retry; no results were marked verified." }, { status: 502 }); }
}
