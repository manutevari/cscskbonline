from __future__ import annotations

import hashlib
import json
import time
from threading import Lock
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from pydantic import BaseModel, ConfigDict, Field

from .core import get_settings

CACHE_TTL_SECONDS = 60
MAX_RESULTS = 5
_cache: dict[str, tuple[float, dict]] = {}
_cache_lock = Lock()


class LiveSearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(min_length=3, max_length=500)
    state: str | None = Field(default=None, max_length=80)
    category: str | None = Field(default=None, max_length=80)
    language: str = Field(default="auto", max_length=20)


def _is_official(url: str) -> bool:
    host = url.split("//", 1)[-1].split("/", 1)[0].lower().split(":")[0]
    return host.endswith(".gov.in") or host == "gov.in" or host.endswith(".nic.in") or host == "nic.in"


def search_tavily(request: LiveSearchRequest) -> dict:
    settings = get_settings()
    key = settings.tavily_api_key.get_secret_value() if settings.tavily_api_key else ""
    if not key:
        return {"status": "disabled", "message": "Tavily live search is not configured. Set TAVILY_API_KEY server-side.", "results": []}

    query_parts = [request.query.strip(), "official recruitment notification"]
    if request.state:
        query_parts.append(request.state)
    if request.category:
        query_parts.append(request.category)
    query = " ".join(query_parts)
    cache_key = hashlib.sha256(query.lower().encode()).hexdigest()
    now = time.monotonic()
    with _cache_lock:
        cached = _cache.get(cache_key)
        if cached and cached[0] > now:
            return {**cached[1], "cached": True}
        if cached:
            _cache.pop(cache_key, None)

    payload = {
        "api_key": key,
        "query": query,
        "search_depth": "basic",
        "topic": "general",
        "max_results": MAX_RESULTS,
        "include_answer": False,
        "include_raw_content": False,
    }
    req = Request(
        "https://api.tavily.com/search",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urlopen(req, timeout=12) as response:
            data = json.loads(response.read(1_000_000).decode("utf-8"))
    except HTTPError as exc:
        return {"status": "error", "message": f"Tavily request failed (HTTP {exc.code}).", "results": []}
    except (URLError, TimeoutError, ValueError) as exc:
        return {"status": "error", "message": "Tavily live search is temporarily unavailable.", "results": []}

    results = []
    for item in data.get("results", [])[:MAX_RESULTS]:
        url = str(item.get("url", ""))[:1200]
        title = str(item.get("title", ""))[:300]
        content = str(item.get("content", ""))[:2500]
        if not url or not title:
            continue
        results.append({
            "title": title,
            "url": url,
            "content": content,
            "score": float(item.get("score", 0) or 0),
            "published_date": item.get("published_date"),
            "official_domain": _is_official(url),
        })
    results.sort(key=lambda x: (not x["official_domain"], -x["score"]))
    result = {
        "status": "ok",
        "query": query,
        "searched_at": data.get("response_time") or None,
        "results": results,
        "cached": False,
        "note": "Search results are unverified web evidence. Prefer official-domain sources; verify notice dates and status before asserting recruitment is Live/Upcoming/Closed.",
    }
    with _cache_lock:
        _cache[cache_key] = (time.monotonic() + CACHE_TTL_SECONDS, result)
        if len(_cache) > 200:
            expired = [k for k, v in _cache.items() if v[0] <= time.monotonic()]
            for k in expired:
                _cache.pop(k, None)
    return result
