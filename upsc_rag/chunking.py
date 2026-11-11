"""Token-aware document chunking. Requires tiktoken at runtime."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class TextChunk:
    chunk_index: int
    text: str
    token_count: int
    start_token: int
    end_token: int


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 75,
               encoding_name: str = "cl100k_base") -> list[TextChunk]:
    if chunk_size < 1 or overlap < 0 or overlap >= chunk_size:
        raise ValueError("Require chunk_size >= 1 and 0 <= overlap < chunk_size")
    try:
        import tiktoken
    except ImportError as exc:
        raise RuntimeError("Install tiktoken to perform exact token-based chunking") from exc

    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text or "")
    chunks: list[TextChunk] = []
    step = chunk_size - overlap
    for index, start in enumerate(range(0, len(tokens), step)):
        window = tokens[start:start + chunk_size]
        if not window:
            continue
        chunks.append(TextChunk(
            chunk_index=index,
            text=encoding.decode(window),
            token_count=len(window),
            start_token=start,
            end_token=start + len(window),
        ))
        if start + chunk_size >= len(tokens):
            break
    return chunks
