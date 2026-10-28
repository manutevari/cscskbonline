import { NextRequest, NextResponse } from "next/server";
import { TOOL_CATALOG, chunkTool } from "@/lib/tools-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function makeEmbeddings(texts: string[]): Promise<number[][]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.RAG_EMBEDDING_MODEL || "text-embedding-3-small", input: texts }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Embedding provider returned ${response.status}`);
  const json = await response.json();
  return (json.data as Array<{ index: number; embedding: number[] }>).sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export async function POST(request: NextRequest) {
  const expected = process.env.RAG_INGEST_SECRET;
  const supplied = request.headers.get("x-rag-ingest-secret");
  if (!expected || !supplied || supplied.length !== expected.length) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  if (mismatch !== 0) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY first." }, { status: 503 });
  }

  try {
    const chunks = TOOL_CATALOG.map(chunkTool);
    const embeddings = await makeEmbeddings(chunks.map((chunk) => chunk.content));
    const rows = chunks.map((chunk, index) => ({
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddings[index],
    }));
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/tool_knowledge?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
      cache: "no-store",
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Supabase upsert failed (${response.status}): ${details.slice(0, 240)}`);
    }
    return NextResponse.json({ ok: true, indexed: rows.length, model: process.env.RAG_EMBEDDING_MODEL || "text-embedding-3-small" });
  } catch (error) {
    console.error("Tool RAG ingestion error", error);
    return NextResponse.json({ error: "Ingestion failed. Check server logs and database schema." }, { status: 500 });
  }
}
