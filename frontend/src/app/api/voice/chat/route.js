import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PORTALS = [
  { name: "UPPSC", url: "https://uppsc.up.nic.in/", category: "Uttar Pradesh" },
  { name: "UPSSSC", url: "https://upsssc.gov.in/", category: "Uttar Pradesh" },
  { name: "UP Police Recruitment", url: "https://uppbpb.gov.in/", category: "Uttar Pradesh" },
  { name: "SSC", url: "https://ssc.gov.in/", category: "Central Government" },
  { name: "Railway Recruitment", url: "https://www.rrbapply.gov.in/", category: "Central Government" },
];

const SYSTEM_PROMPT = `You are the CSCSKB Online Recruitment Counsellor, a polite Hindi/Hinglish/English voice-and-text assistant for Indian government recruitment. Help with official vacancy discovery, notifications, eligibility, application forms, and document preparation.

MANDATORY COUNSELLING WORKFLOW:
1) When a user asks about vacancies, recruitment, notifications, jobs, or asks what they can apply for, first use the LIVE OFFICIAL PORTAL CHECK results appended below. Never ask them to upload a notification before attempting this search. Present matching notices as options, including agency, post/title, source link, and any date/age/qualification only when the official page actually provides it. Say clearly when a portal could not be checked or the page did not expose notice details. The live check scans public links only; it is not an official API and may miss notices. Never pretend this is a complete vacancy list.
2) Ask which listed recruitment they want to explore. If no relevant notice is found, ask their state/qualification/field and explain which official portals were checked; do not invent vacancies.
3) After the user chooses a recruitment, use available official-source details to ask one question at a time: date of birth or age as on the notice's specified cutoff date (prefer age, and do not request full DOB unless needed), education/degree, required subject/marks, category and relaxation eligibility, domicile, experience, physical/other criteria only if relevant. Do not request Aadhaar number, OTP, password, bank details, or unnecessary sensitive data.
4) Compare the answers against the selected notice's exact rules. Classify as "likely eligible", "likely not eligible", or "cannot determine yet"; explain each criterion and missing evidence. Never declare eligibility if the notice details could not be retrieved or cutoff/relaxation rules are unknown. Invite the user to verify the official notification.
5) Make a tailored document checklist only after the recruitment is selected and eligibility is assessed. Distinguish commonly required documents from those explicitly required by the notice. Explain photo/signature format, dimensions, file-size limits only if confirmed in the official notice.
6) Help fill the form field-by-field and review entries. Do not claim to upload files or submit the application unless the site actually provides that action and it succeeded. Before any final submission/payment, show a summary and obtain explicit user confirmation. Never submit an application or payment automatically.

CONVERSATION: Match the user's language and keep responses short enough to speak aloud. Ask one clear question at a time. Be respectful, never pushy. The user can speak or type; treat both as equivalent. Do not ask for an uploaded PDF if a live official search can be attempted first. Do not fabricate current vacancies, dates, eligibility, fees, or notice details. Use only the LIVE PORTAL CHECK results below as current search evidence, and distinguish official page links from extracted text. If no useful results are returned, say so honestly and offer official portal links. `;

function stripTags(value) {
  return value.replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ").trim();
}

function findNoticeLinks(html, baseUrl, allowedHost) {
  const found = [];
  const pattern = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  const relevant = /recruit|vacan|advertis|noti|result|admit|answer|exam|notice|application|apply|career|भर्ती|विज्ञ|परिणाम|प्रवेश पत्र|परीक्षा|सूचना|आवेदन/i;
  let match;
  while ((match = pattern.exec(html)) !== null && found.length < 50) {
    const href = (match[1] || match[2] || match[3] || "").trim();
    const title = stripTags(match[4] || "");
    if (!href || title.length < 4 || title.length > 220 || !relevant.test(title)) continue;
    try {
      const url = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      const hostname = url.hostname.toLowerCase();
      const officialHost = allowedHost.toLowerCase();
      if (hostname !== officialHost && !hostname.endsWith(`.${officialHost}`)) continue;
      if (!found.some((item) => item.url === url.href)) found.push({ title, url: url.href });
    } catch {}
  }
  return found.slice(0, 12);
}

async function searchOfficialPortals() {
  const checkedAt = new Date().toISOString();
  const portals = await Promise.all(PORTALS.map(async (portal) => {
    try {
      const response = await fetch(portal.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CSCSKBRecruitmentCounsellor/1.0; +https://www.cscskb.online)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(6500),
      });
      if (!response.ok) return { ...portal, status: "unavailable", httpStatus: response.status, notices: [] };
      const html = await response.text();
      return { ...portal, status: "checked", httpStatus: response.status, notices: findNoticeLinks(html, portal.url, new URL(portal.url).hostname) };
    } catch {
      return { ...portal, status: "unavailable", notices: [] };
    }
  }));
  return { checkedAt, portals };
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body?.privacyConsent !== true) {
      return NextResponse.json({ error: "कृपया पहले गोपनीयता सूचना पढ़कर सहमति दें।" }, { status: 403 });
    }
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }));
    if (!safeMessages.length || !safeMessages.some((m) => m.role === "user")) {
      return NextResponse.json({ error: "कृपया अपना प्रश्न बोलें या लिखें।" }, { status: 400 });
    }

    const latestUserText = [...safeMessages].reverse().find((m) => m.role === "user")?.content || "";
    const recruitmentIntent = /recruit|vacan|vacanc(?:y|ies)|opening|openings|open position|current openings|latest openings|available jobs|job opening|job openings|apply for|job|notification|notice|bharti|भर्ती|भर्तियां|भर्तियाँ|नौकरी|वैकेंसी|रिक्ति|रिक्त पद|नोटिफिकेशन|सरकारी परीक्षा|government exam|what can i apply|किसमें आवेदन|वर्तमान भर्ती/i.test(latestUserText);
    const liveSearch = recruitmentIntent ? await searchOfficialPortals() : null;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "AI सेवा अभी कॉन्फ़िगर नहीं है। भर्ती खोजने के लिए नीचे दिए आधिकारिक पोर्टल खोलें।",
        ...(liveSearch ? { liveSearch } : {}),
      }, { status: 503 });
    }

    const sourceContext = liveSearch
      ? "\n\nLIVE OFFICIAL PORTAL CHECK (checked at " + liveSearch.checkedAt + "):\n" + JSON.stringify(liveSearch.portals.map((p) => ({
          agency: p.name, category: p.category, officialHome: p.url, checkStatus: p.status,
          notices: p.notices,
        }))) + "\nRemember: this is a live scan of links visible on official home pages, not a complete/verified vacancy database. Do not infer age, eligibility, or deadlines from link titles. Offer only relevant links and state limitations."
      : "";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.cscskb.online",
        "X-Title": "CSCSKB Online Recruitment Counsellor",
      },
      body: JSON.stringify({
        model: "inclusionai/ling-3.0-flash:free",
        messages: [{ role: "system", content: SYSTEM_PROMPT + sourceContext }, ...safeMessages],
        temperature: 0.25,
        max_tokens: 700,
        provider: { allow_fallbacks: false },
      }),
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({
        error: response.status === 402
          ? "OpenRouter की API credits/spending limit जाँचें; यह ChatGPT subscription से अलग है।"
          : "AI सेवा अभी जवाब नहीं दे सकी। थोड़ी देर बाद फिर कोशिश करें।",
        ...(liveSearch ? { liveSearch } : {}),
      }, { status: response.status === 402 ? 402 : 502 });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "AI से खाली जवाब मिला। फिर कोशिश करें।", ...(liveSearch ? { liveSearch } : {}) }, { status: 502 });
    }
    return NextResponse.json(
      { reply: reply.trim(), ...(liveSearch ? { liveSearch } : {}) },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return NextResponse.json({
      error: error?.name === "TimeoutError" ? "जवाब आने में अधिक समय लगा। फिर कोशिश करें।" : "Voice assistant से संपर्क नहीं हो सका।",
    }, { status: 500 });
  }
}
