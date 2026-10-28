import { NextRequest, NextResponse } from "next/server";
import { TOOL_CATALOG, type ToolRecord } from "@/lib/tools-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VectorRow = { id: string; title: string; category: string; content: string; metadata?: Record<string, unknown>; embedding?: number[]; similarity?: number };

function tokenize(value: string) {
  return value.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}\s.-]/gu, " ").split(/[\s.-]+/).filter(Boolean);
}
function keywordScore(query: string, tool: ToolRecord) {
  const q = new Set(tokenize(query));
  const title = new Set(tokenize(tool.name));
  const category = new Set(tokenize(tool.category));
  const terms = new Set(tokenize([tool.description, ...tool.keywords].join(" ")));
  let score = 0;
  q.forEach((term) => {
    if (title.has(term)) score += 4;
    else if (category.has(term)) score += 2.5;
    else if (terms.has(term)) score += 1;
  });
  if (query.toLowerCase().includes("dpi") && tool.keywords.includes("dpi")) score += 4;
  return score;
}
async function embed(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.RAG_EMBEDDING_MODEL || "text-embedding-3-small", input: text }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Embedding provider returned ${response.status}`);
  const json = await response.json();
  return json.data?.[0]?.embedding ?? null;
}
async function vectorSearch(query: string, limit: number): Promise<VectorRow[] | null> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  const vector = await embed(query);
  if (!vector) return null;
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/search_tool_knowledge`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query_embedding: vector, match_count: limit, filter_category: null }),
    cache: "no-store",
  });
  if (!response.ok) {
    // Do not silently label a failed vector search as semantic retrieval.
    const details = await response.text();
    throw new Error(`Vector search failed (${response.status}): ${details.slice(0, 240)}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.max(1, Math.min(12, Number(request.nextUrl.searchParams.get("limit") ?? 6) || 6));
  if (query.length < 2) return NextResponse.json({ error: "Enter at least 2 characters.", results: [] }, { status: 400 });
  if (query.length > 500) return NextResponse.json({ error: "Query is too long.", results: [] }, { status: 400 });

  try {
    const vectorResults = await vectorSearch(query, limit);
    if (vectorResults?.length) {
      return NextResponse.json({
        query,
        mode: "semantic-vector",
        results: vectorResults.map((row) => ({ id: row.id, name: row.title, category: row.category, description: row.content, status: row.metadata?.status ?? "catalogued", url: row.metadata?.url ?? null, score: row.similarity ?? null })),
      });
    }
    const results = TOOL_CATALOG
      .map((tool) => ({ tool, score: keywordScore(query, tool) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
      .slice(0, limit)
      .map(({ tool, score }) => ({ id: tool.id, name: tool.name, category: tool.category, description: tool.description, status: tool.status, url: tool.url ?? null, score }));
    return NextResponse.json({ query, mode: "keyword-fallback", results, setupHint: "Configure OPENAI_API_KEY and Supabase vector credentials to enable embedding-based semantic retrieval." });
  } catch (error) {
    console.error("Tool RAG search error", error);
    return NextResponse.json({ error: "Tool search is temporarily unavailable." }, { status: 503 });
  }
}
