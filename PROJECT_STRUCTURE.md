# CSCSKB Online - Enterprise Blueprint

## Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- PWA

## Backend
- FastAPI
- JWT Auth
- REST APIs
- WebSockets

## AI
- LangGraph
- RAG
- OCR
- Voice Assistant
- Knowledge Base
- OpenRouter API provider via `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`, and `OPENROUTER_MODEL`.

## Data
- PostgreSQL
- pgvector
- Redis
- S3 Storage

## DevOps
- Docker
- GitHub Actions
- Nginx
- Prometheus
- Grafana

## Modules
Home
About
Services
Schemes
Knowledge Base
AI Assistant
Admin Dashboard
Analytics
Contact


## WordPress Integration
- Production WordPress domain: https://cscskb.online
- Recommended merge path: keep WordPress as the public CMS and route the app under /app/ with FastAPI under /api/.
- Reviews and Google Maps location content are documented in WORDPRESS_INTEGRATION.md.

## Competitive Website Layer
- Competitive CSC/VLE strategy: COMPETITIVE_CSC_WEBSITE_STRATEGY.md
- WordPress headline marquee plugin: wordpress-plugin/cscskb-csc-news-marquee/cscskb-csc-news-marquee.php
