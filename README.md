# CSCSKB Online Streamlit + Vercel App

A dual-deploy landing page for CSC Shikohabad / CSCSKB Online. It includes a Streamlit app for Streamlit Community Cloud and a Next.js app for Vercel. Both versions highlight live CSC feed links as a prominent marquee, plus service cards, local trust proof, AI guidance, contact actions, and map directions.

## Run Streamlit locally

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Run Vercel / Next.js locally

```bash
cd frontend
npm install
npm run dev
```

## Deploy on Streamlit Cloud

1. Push this repository and branch to GitHub.
2. Open [Streamlit Community Cloud](https://share.streamlit.io/).
3. Create a new app from this repository.
4. Set **Main file path** to `streamlit_app.py`.
5. Deploy. Streamlit installs dependencies from `requirements.txt` and reads theme/server settings from `.streamlit/config.toml` automatically.

## Deploy on Vercel

1. Push this repository and branch to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Keep the project root as configured in `vercel.json`: `frontend`.
4. Vercel runs `npm install`, `npm run build`, and serves the `.next` output.

## Files used by deployment platforms

- `streamlit_app.py` — Streamlit app entry point.
- `core/` — lightweight local answer engine used by the Streamlit AI assistant.
- `requirements.txt` — Python dependencies for Streamlit Cloud.
- `.streamlit/config.toml` — production-friendly Streamlit server/theme settings.
- `frontend/src/app/` — Next.js App Router pages used by Vercel.
- `vercel.json` — Vercel build configuration.
