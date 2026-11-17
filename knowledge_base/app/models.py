from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, StringConstraints


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class KnowledgeStatus(StrEnum):
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class SourceType(StrEnum):
    OFFICIAL_GOVERNMENT = "official_government"
    OFFICIAL_CSC = "official_csc"
    INTERNAL_MANUAL = "internal_manual"
    OTHER = "other"


NonEmpty = Annotated[str, StringConstraints(min_length=1, max_length=500)]


class DocumentMetadata(StrictModel):
    title: NonEmpty
    source_name: NonEmpty
    source_type: SourceType
    source_url: HttpUrl | None = None
    issuing_authority: str | None = Field(default=None, max_length=200)
    jurisdiction: str = Field(default="India", max_length=120)
    language: str = Field(default="unknown", max_length=32)
    category: str = Field(default="general", max_length=100)
    published_on: date | None = None
    effective_from: date | None = None
    effective_until: date | None = None
    version: str | None = Field(default=None, max_length=80)
    content_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")
    uploaded_by: str = Field(min_length=1, max_length=120)


class IngestResponse(StrictModel):
    document_id: str
    status: KnowledgeStatus
    chunk_count: int
    message: str


class QueryRequest(StrictModel):
    question: str = Field(min_length=3, max_length=2000)
    language: str = Field(default="auto", max_length=32)
    category: str | None = Field(default=None, max_length=100)
    top_k: int = Field(default=5, ge=1, le=10)


class Citation(StrictModel):
    document_id: str
    title: str
    source_name: str
    source_url: str | None = None
    issuing_authority: str | None = None
    published_on: date | None = None
    effective_until: date | None = None
    chunk_index: int = Field(ge=0)
    similarity: float = Field(ge=0, le=1)


class QueryResponse(StrictModel):
    answer: str
    evidence_status: str
    citations: list[Citation]
    insufficient_evidence: bool
    retrieved_at: datetime


class ApprovalRequest(StrictModel):
    reviewer_id: NonEmpty
    decision: str = Field(pattern=r"^(approve|reject)$")
    reason: str = Field(min_length=3, max_length=1000)
