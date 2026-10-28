"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  url?: string | null;
  score?: number | null;
};
type SearchResponse = { query?: string; mode?: string; results?: SearchResult[]; error?: string; setupHint?: string };

const quickQueries = [
  "Resize a passport photo to 35 by 45 millimeters at 300 DPI",
  "Compress an image below 50 KB",
  "Make images ready for A4 printing",
  "Find OCR tools for scanned PDFs",
  "Process many images and download a ZIP",
  "Find audio trimming tools",
];

export default function ToolRagSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSearch(value = query) {
    const q = value.trim();
    if (q.length < 2) { setError("Type at least two characters."); return; }
    setQuery(q);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/tools/search?q=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" });
      const data = (await response.json()) as SearchResponse;
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []);
      setMode(data.mode || "");
      if (!(data.results || []).length) setError("No matching tools found. Try a task, file type, unit, or keyword.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search is temporarily unavailable.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  return (
    <section aria-labelledby="tool-rag-heading" style={{ margin: "0 0 20px", padding: 18, borderRadius: 16, border: "1px solid #b7d8c4", background: "linear-gradient(135deg,#f0faf3,#f7fbff)", color: "#17251f" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
        <div>
          <p style={{ margin: 0, color: "#176b4d", fontSize: 12, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase" }}>Personal Tool RAG</p>
          <h2 id="tool-rag-heading" style={{ margin: "5px 0", fontSize: 22, letterSpacing: "-.02em" }}>Find the right tool by describing your task</h2>
          <p style={{ margin: 0, maxWidth: 700, color: "#52635a", fontSize: 14, lineHeight: 1.5 }}>Search the CSC SKB tool knowledge base in natural language. When embeddings and the vector database are configured, this search uses semantic similarity; otherwise it uses a transparent keyword fallback.</p>
        </div>
        <span style={{ borderRadius: 999, padding: "5px 10px", background: "#d9f1e2", color: "#176b4d", fontSize: 12, fontWeight: 800 }}>RAG search</span>
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <input aria-label="Describe the tool you need" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. compress a signature under 20 KB at 300 DPI" style={{ flex: "1 1 260px", minWidth: 0, padding: "12px 13px", borderRadius: 10, border: "1px solid #b8cfc0", background: "#fff", color: "#17251f", fontSize: 15 }} />
        <button type="submit" disabled={loading} style={{ border: 0, borderRadius: 10, padding: "12px 18px", background: "#176b4d", color: "#fff", fontWeight: 800, cursor: loading ? "wait" : "pointer", opacity: loading ? .7 : 1 }}>{loading ? "Searching…" : "Find tools"}</button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
        {quickQueries.map(item => <button key={item} type="button" onClick={() => void runSearch(item)} style={{ border: "1px solid #c9dcd0", borderRadius: 999, background: "#fff", padding: "6px 10px", color: "#365348", fontSize: 12, cursor: "pointer" }}>{item}</button>)}
      </div>
      {error && <p role="status" style={{ margin: "12px 0 0", color: "#9f3028", fontSize: 13 }}>{error}</p>}
      {results.length > 0 && <div style={{ marginTop: 15 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#52635a" }}>{results.length} result(s) · retrieval mode: {mode === "semantic-vector" ? "semantic embeddings" : "keyword fallback"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 9 }}>
          {results.map(result => <article key={result.id} style={{ background: "#fff", border: "1px solid #d7e5dc", borderRadius: 12, padding: 12 }}>
            <p style={{ margin: 0, color: "#176b4d", fontSize: 11, fontWeight: 800 }}>{result.category}</p>
            <h3 style={{ margin: "5px 0", fontSize: 15 }}>{result.name}</h3>
            <p style={{ margin: "0 0 9px", color: "#52635a", fontSize: 13, lineHeight: 1.5 }}>{result.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#52635a" }}>{result.status}</span>
              {result.url && <a href={result.url} target={result.url.startsWith("http") ? "_blank" : undefined} rel={result.url.startsWith("http") ? "noreferrer" : undefined} style={{ color: "#176b4d", fontSize: 13, fontWeight: 800 }}>{result.url.startsWith("http") ? "Open tool ↗" : "Use tool →"}</a>}
            </div>
          </article>)}
        </div>
      </div>}
    </section>
  );
}
