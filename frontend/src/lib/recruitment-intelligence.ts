export type RecruitmentSearchItem = {
  title: string;
  url: string;
  content: string;
  score?: number;
  source?: string;
};
export type RecruitmentSearchResult = {
  query: string;
  state: string;
  category: string;
  checkedAt: string;
  searchProvider: "tavily" | "unconfigured";
  items: RecruitmentSearchItem[];
  analyzed: boolean;
  analysis?: string;
  warning?: string;
};

const TAVILY_URL = "https://api.tavily.com/search";
const ALLOWED_SEARCH_DEPTH = "advanced";

export async function searchRecruitment(query: string, state: string, category: string): Promise<RecruitmentSearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  const checkedAt = new Date().toISOString();
  const contextualQuery = [query, state !== "All India" && state !== "All States" ? state : "", category !== "All Categories" ? category : "", "government recruitment official notification vacancy"].filter(Boolean).join(" ");
  if (!apiKey) {
    return { query: contextualQuery, state, category, checkedAt, searchProvider: "unconfigured", items: [], analyzed: false, warning: "TAVILY_API_KEY is not configured in this Preview environment." };
  }
  const response = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query: contextualQuery, search_depth: ALLOWED_SEARCH_DEPTH, topic: "general", max_results: 12, include_answer: false, include_raw_content: true }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Tavily search failed with HTTP ${response.status}`);
  const payload = await response.json();
  const items: RecruitmentSearchItem[] = Array.isArray(payload.results) ? payload.results.map((r: any) => ({
    title: String(r.title || "").slice(0, 300),
    url: String(r.url || ""),
    content: String(r.raw_content || r.content || "").slice(0, 12000),
    score: typeof r.score === "number" ? r.score : undefined,
    source: (() => { try { return new URL(String(r.url)).hostname; } catch { return ""; } })(),
  })).filter((r: RecruitmentSearchItem) => /^https?:\/\//i.test(r.url)) : [];
  let analysis: string | undefined;
  let analyzed = false;
  const llmKey = process.env.OPENAI_API_KEY;
  if (llmKey && items.length) {
    const model = process.env.RECRUITMENT_LLM_MODEL || "gpt-4.1-mini";
    const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${llmKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: "Analyze search results for Indian government recruitment. Use only evidence in supplied results. Do not invent dates, vacancies, eligibility, or official status. Treat URLs as sources; identify official sources cautiously by domain. Return concise findings, caveats, and a source list. This is discovery output, not verified notification data." },
          { role: "user", content: JSON.stringify({ query: contextualQuery, results: items.map(({title,url,content,score})=>({title,url,content,score})) }) }
        ]
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (llmResponse.ok) {
      const llmPayload = await llmResponse.json();
      analysis = llmPayload.choices?.[0]?.message?.content || undefined;
      analyzed = Boolean(analysis);
    } else {
      analysis = "Search results returned, but the configured LLM analyzer request failed.";
    }
  }
  return { query: contextualQuery, state, category, checkedAt, searchProvider: "tavily", items, analyzed, analysis, warning: !llmKey ? "OPENAI_API_KEY is not configured; raw results are returned without LLM analysis." : undefined };
}
