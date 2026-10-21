export type RecruitmentNotice = {
  id: string;
  board: string;
  title: string;
  url: string;
  sourceUrl: string;
  checkedAt: string;
  kind: "recruitment" | "result" | "admit-card" | "answer-key" | "exam" | "notice";
};

export type RecruitmentFeed = {
  checkedAt: string;
  mode: "official-portal-link-scan";
  disclaimer: string;
  sources: Array<{ name: string; url: string; status: "ok" | "unavailable"; noticeCount: number }>;
  notices: RecruitmentNotice[];
};

const SOURCES = [
  { name: "SSC", url: "https://ssc.gov.in/" },
  { name: "UPPSC", url: "https://uppsc.up.nic.in/" },
  { name: "UPSSSC", url: "https://upsssc.gov.in/" },
  { name: "Railway Recruitment Board", url: "https://www.rrbapply.gov.in/" },
  { name: "UP Police Recruitment Board", url: "https://uppbpb.gov.in/" },
];

const MATCH = /(notification|notice|recruitment|vacanc|advertisement|apply online|admit.?card|answer.?key|result|exam|examination|selection|important date|latest|भर्ती|अधिसूचना|विज्ञापन|प्रवेश पत्र|उत्तर कुंजी|परिणाम|परीक्षा|नोटिस)/i;
const KIND = (text: string): RecruitmentNotice["kind"] => {
  if (/admit.?card|प्रवेश पत्र/i.test(text)) return "admit-card";
  if (/answer.?key|उत्तर कुंजी/i.test(text)) return "answer-key";
  if (/result|परिणाम|merit list/i.test(text)) return "result";
  if (/exam|examination|परीक्षा|schedule|calendar/i.test(text)) return "exam";
  if (/recruitment|vacanc|advertisement|apply online|भर्ती|विज्ञापन/i.test(text)) return "recruitment";
  return "notice";
};

function cleanText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLinks(html: string, source: typeof SOURCES[number], checkedAt: string): RecruitmentNotice[] {
  const output: RecruitmentNotice[] = [];
  const seen = new Set<string>();
  const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) && output.length < 8) {
    const attributes = match[1] || "";
    const hrefMatch = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch && (hrefMatch[1] || hrefMatch[2] || hrefMatch[3]) || "").trim();
    const title = cleanText(match[2] || "").slice(0, 180);
    if (!href || !title || title.length < 3 || !MATCH.test(title + " " + href)) continue;
    try {
      const resolved = new URL(href, source.url);
      const base = new URL(source.url);
      if (resolved.protocol !== "https:" || !(resolved.hostname === base.hostname || resolved.hostname.endsWith("." + base.hostname))) continue;
      if (seen.has(resolved.href)) continue;
      seen.add(resolved.href);
      output.push({
        id: source.name + ":" + resolved.href,
        board: source.name,
        title,
        url: resolved.href,
        sourceUrl: source.url,
        checkedAt,
        kind: KIND(title + " " + resolved.href),
      });
    } catch {
      // Ignore malformed links from source HTML.
    }
  }
  return output;
}

let cache: { value: RecruitmentFeed; expiresAt: number } | null = null;

export async function getOfficialRecruitmentFeed(forceRefresh = false): Promise<RecruitmentFeed> {
  const now = Date.now();
  if (!forceRefresh && cache && cache.expiresAt > now) return cache.value;

  const checkedAt = new Date(now).toISOString();
  const settled = await Promise.all(SOURCES.map(async (source) => {
    try {
      const response = await fetch(source.url, {
        method: "GET",
        headers: {
          "Accept": "text/html,application/xhtml+xml",
          "User-Agent": "CSCSKB-Official-Notice-Link-Checker/1.0 (+https://www.cscskb.online)",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4500),
      });
      if (!response.ok) throw new Error("Source returned HTTP " + response.status);
      const finalUrl = new URL(response.url || source.url);
      const baseUrl = new URL(source.url);
      if (!(finalUrl.hostname === baseUrl.hostname || finalUrl.hostname.endsWith("." + baseUrl.hostname))) {
        throw new Error("Source redirected away from its official host");
      }
      const html = (await response.text()).slice(0, 1_500_000);
      const notices = parseLinks(html, source, checkedAt);
      return {
        source: { name: source.name, url: source.url, status: "ok" as const, noticeCount: notices.length },
        notices,
      };
    } catch {
      return {
        source: { name: source.name, url: source.url, status: "unavailable" as const, noticeCount: 0 },
        notices: [] as RecruitmentNotice[],
      };
    }
  }));

  const sources = settled.map((item) => item.source);
  const notices = settled.flatMap((item) => item.notices).slice(0, 30);
  const value: RecruitmentFeed = {
    checkedAt,
    mode: "official-portal-link-scan",
    disclaimer: "This is an automated scan of links exposed by official portal homepages, not an official API or a verified vacancy database. Open the linked notice to confirm dates, eligibility, vacancy counts and status.",
    sources,
    notices,
  };
  cache = { value, expiresAt: now + 5 * 60 * 1000 };
  return value;
}
