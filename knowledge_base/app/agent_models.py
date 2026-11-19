from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field


class Intent(StrEnum):
    SCHEME = "scheme"
    FORM = "form"
    DOCUMENT = "document"
    RECRUITMENT = "recruitment"
    OUT_OF_SCOPE = "out_of_scope"


class IntentClassification(BaseModel):
    model_config = ConfigDict(extra="forbid")
    intent: Intent
    confidence: float = Field(ge=0, le=1)
    reason: str = Field(min_length=3, max_length=500)


class AgentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=3, max_length=2000)
    language: str = Field(default="auto", max_length=32)
    session_id: str | None = Field(default=None, max_length=128)


class AgentResponse(BaseModel):
    answer: str
    intent: Intent
    intent_confidence: float = Field(ge=0, le=1)
    tool_calls: int = Field(ge=0, le=12)
    evidence_status: str
