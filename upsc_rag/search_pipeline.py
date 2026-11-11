"""Provider-neutral orchestration contract for hybrid UPSC retrieval.

Integrate concrete PostgreSQL/pgvector, Tavily and LLM clients in the API layer.
This module intentionally never treats live-web snippets as trusted instructions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence

from .ranking import Candidate, RankedCandidate, rank_candidates


@dataclass(frozen=True)
class SearchDocument:
    id: str
    title: str
    url: str
    text: str
    published_at: str | None = None
    source_domain: str | None = None


class SemanticRetriever(Protocol):
    async def search(self, query: str, limit: int) -> Sequence[SearchDocument]: ...


class TavilyRetriever(Protocol):
    async def search(self, query: str, limit: int) -> Sequence[SearchDocument]: ...


class PriorRankRetriever(Protocol):
    async def search(self, query: str, limit: int) -> Sequence[SearchDocument]: ...


class Ranker(Protocol):
    def features(self, query: str, document: SearchDocument, channel: str) -> Candidate: ...


async def hybrid_retrieve(
    query: str,
    semantic: SemanticRetriever,
    tavily: TavilyRetriever,
    prior_rank: PriorRankRetriever,
    ranker: Ranker,
    per_channel_limit: int = 8,
) -> list[RankedCandidate]:
    """Fetch all three channels concurrently, then normalize and rank candidates."""
    import asyncio

    semantic_docs, live_docs, prior_docs = await asyncio.gather(
        semantic.search(query, per_channel_limit),
        tavily.search(query, per_channel_limit),
        prior_rank.search(query, per_channel_limit),
    )
    candidates: list[Candidate] = []
    for channel, documents in (
        ("semantic", semantic_docs),
        ("tavily", live_docs),
        ("prior_rank", prior_docs),
    ):
        candidates.extend(ranker.features(query, document, channel) for document in documents)
    return rank_candidates(candidates)


def build_llm_evidence(ranked: Sequence[RankedCandidate], max_items: int = 8) -> list[dict]:
    """Return bounded, attributable evidence; the LLM must cite these source URLs."""
    evidence = []
    for item in ranked[:max_items]:
        doc = item.candidate
        evidence.append({
            "rank": item.rank,
            "score": item.score,
            "title": doc.title,
            "url": doc.source_url,
            "channel": doc.channel,
            "content": doc.content,
        })
    return evidence
