from pydantic import BaseModel, ConfigDict, Field


class AgentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str = Field(min_length=3, max_length=2000)
    language: str = Field(default="auto", max_length=32)
    session_id: str | None = Field(default=None, max_length=128)


class AgentResponse(BaseModel):
    answer: str
    tool_calls: int = Field(ge=0, le=12)
    evidence_status: str
