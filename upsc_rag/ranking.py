"""Hybrid ranking primitives for the UPSC RAG pipeline.

Scores are normalized to [0, 1]. The caller supplies semantic similarity,
keyword relevance, source authority, freshness, and evidence quality.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from math import isfinite
from typing import Iterable, Sequence

WEIGHTS = {
    "semantic": 0.35,
    "authority": 0.25,
    "keyword": 0.15,
    "freshness": 0.15,
    "evidence": 0.10,
}


@dataclass(frozen=True)
class Candidate:
    candidate_id: str
    source_url: str
    title: str
    content: str
    channel: str  # semantic | tavily | prior_rank
    semantic: float = 0.0
    authority: float = 0.0
    keyword: float = 0.0
    freshness: float = 0.0
    evidence: float = 0.0


@dataclass(frozen=True)
class RankedCandidate:
    candidate: Candidate
    score: float
    rank: int


def _clamp(value: float) -> float:
    if not isfinite(value):
        return 0.0
    return max(0.0, min(1.0, value))


def score_candidate(candidate: Candidate) -> float:
    values = {
        "semantic": candidate.semantic,
        "authority": candidate.authority,
        "keyword": candidate.keyword,
        "freshness": candidate.freshness,
        "evidence": candidate.evidence,
    }
    return round(sum(WEIGHTS[key] * _clamp(values[key]) for key in WEIGHTS), 6)


def rank_candidates(candidates: Iterable[Candidate]) -> list[RankedCandidate]:
    # De-duplicate URLs while retaining the strongest-scoring representation.
    best_by_url: dict[str, tuple[Candidate, float]] = {}
    for candidate in candidates:
        score = score_candidate(candidate)
        key = candidate.source_url.rstrip("/").lower() or candidate.candidate_id
        previous = best_by_url.get(key)
        if previous is None or score > previous[1]:
            best_by_url[key] = (candidate, score)
    ordered = sorted(
        best_by_url.values(),
        key=lambda item: (item[1], item[0].authority, item[0].freshness),
        reverse=True,
    )
    return [
        RankedCandidate(candidate=candidate, score=score, rank=index)
        for index, (candidate, score) in enumerate(ordered, start=1)
    ]


def global_rank_score(
    *, query_count: int, weighted_clicks: float, positive_feedback: float,
    negative_feedback: float, mean_query_score: float,
) -> float:
    """A bounded cumulative score; Bayesian-style smoothing limits one-hit spikes."""
    volume = min(1.0, query_count / 50.0)
    engagement = max(0.0, weighted_clicks) / (1.0 + max(0.0, weighted_clicks))
    feedback_total = max(0.0, positive_feedback) + max(0.0, negative_feedback)
    feedback = (
        (max(0.0, positive_feedback) + 2.0)
        / (feedback_total + 4.0)
    )
    relevance = _clamp(mean_query_score)
    return round(
        0.20 * volume + 0.20 * engagement + 0.25 * feedback + 0.35 * relevance,
        6,
    )
