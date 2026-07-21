# CSCSKB Online Streamlit App

A Streamlit-deployable landing page for CSCSKB Online. It follows the existing WordPress homepage preview style and adds Streamlit-friendly contact actions, service cards, a simple CSC guidance input, review content, and map directions.

## Run locally

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Deploy on Streamlit Cloud

1. Push this repository and branch to GitHub.
2. Open [Streamlit Community Cloud](https://share.streamlit.io/).
3. Create a new app from this repository.
4. Set **Main file path** to `streamlit_app.py`.
5. Deploy. Streamlit installs dependencies from `requirements.txt` and reads theme/server settings from `.streamlit/config.toml` automatically.

## Files used by Streamlit Cloud

- `streamlit_app.py` — app entry point.
- `requirements.txt` — Python dependencies.
- `.streamlit/config.toml` — production-friendly Streamlit server/theme settings.
