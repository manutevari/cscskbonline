from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import os
from dotenv import load_dotenv

from models import LeadSubmission
from zoho_integration import ZohoIntegration

load_dotenv()

app = FastAPI(
    title="Tata Water Lead API",
    description="API for processing and pushing distributor leads to Zoho CRM",
    version="1.0.0"
)

# Setup CORS to allow requests from the landing page
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "service": "Tata Water Lead API"}

@app.post("/submit-lead")
async def submit_lead(lead: LeadSubmission):
    """
    Endpoint to receive lead data from the frontend.
    1. Validates payload via Pydantic model.
    2. Runs deduplication and Zoho push logic.
    """
    try:
        # Pydantic validation happens automatically.
        # If we reach here, data is valid.
        
        # Process the lead
        result = ZohoIntegration.submit_lead(lead)
        
        if result["status"] == "duplicate":
            # You can choose to return a 409 Conflict or 200 OK with a specific message
            # For ads, returning 200 OK is often better so the pixel tracks a conversion anyway,
            # but we flag it internally.
            return {"status": "warning", "message": result["message"]}
            
        return {"status": "success", "message": result["message"], "data": result.get("zoho_response")}
        
    except Exception as e:
        # Catch unexpected errors
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# If running this file directly (for local testing)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
