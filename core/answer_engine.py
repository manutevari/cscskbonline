from __future__ import annotations

from core.confidence import ConfidenceLevel

ANSWERS = {
    "pan": ("PAN Card — Required Documents\n\n1. Aadhaar Card\n2. Passport-size photo\n3. Signature on white paper\n4. Date of birth proof if DOB is not clear in Aadhaar\n\nPlease visit CSC Shikohabad with original documents for final verification.", "NSDL / UTIITSL guidelines"),
    "ayushman": ("Ayushman Card — Please bring Aadhaar, mobile number, ration card/family ID if available, and any existing health-card details. Staff can check eligibility and guide the next step.", "PM-JAY / Ayushman Bharat"),
    "pm kisan": ("PM Kisan — Keep Aadhaar, land records, bank account details, mobile number, and eKYC information ready. Eligibility depends on government scheme rules.", "PM Kisan portal"),
    "voter": ("Voter ID — Keep Aadhaar, address proof, age proof, passport photo, and mobile number ready. CSC staff can help with application or correction guidance.", "NVSP / ECI guidance"),
    "income": ("Income Certificate — Usually requires Aadhaar, photo, address proof, income proof/self-declaration, and local authority documents as applicable.", "State eDistrict guidance"),
    "aadhaar": ("Aadhaar Update — Carry Aadhaar card, mobile number, and valid proof for the detail you want to update. Biometric or demographic updates may have different requirements.", "UIDAI guidance"),
    "passport": ("Passport — Keep Aadhaar, address proof, date-of-birth proof, photos if needed, and previous passport details if renewing. Apply through the official Passport Seva process.", "Passport Seva"),
    "kahan": ("CSC Shikohabad location: Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135. Call +91-8937887070 for help.", "Local center details"),
}


def generate_answer(question: str) -> dict[str, str]:
    text = question.lower()
    for key, (answer, source) in ANSWERS.items():
        if key in text:
            return {"answer": answer, "source": source, "confidence": ConfidenceLevel.HIGH.value}
    return {
        "answer": "Please visit CSC Shikohabad with Aadhaar, mobile number, and any document related to your service. Our staff will check the exact requirement and guide you step by step. Call +91-8937887070 for quick support.",
        "source": "CSC Shikohabad help desk",
        "confidence": ConfidenceLevel.MEDIUM.value,
    }
# core/answer_engine.py
from core.query_normalizer import normalize_query
from core.intent_classifier import classify_intent, Intent
from core.service_classifier import classify_service
from core.confidence import assess_confidence, ConfidenceLevel
from knowledge.services import Service, SERVICE_KNOWLEDGE
from knowledge.sources import OFFICIAL_SOURCES

def generate_answer(query: str) -> dict:
    normalized_query = normalize_query(query)
    intent = classify_intent(normalized_query)
    service = classify_service(normalized_query)
    confidence = assess_confidence(intent, service)
    
    response = {
        "intent": intent.name,
        "service": service.name,
        "confidence": confidence.name,
        "answer": "",
        "source": None
    }
    
    if intent == Intent.CSC_LOCATION:
        response["answer"] = (
            "**CSC — Shikohabad**\n\n"
            "**Purana Bijli Office, Agra Road, near Roadways Bus Stand, Shikohabad, Uttar Pradesh 283135**\n\n"
            "[Open in Google Maps](https://maps.app.goo.gl/WNidZh1cEukiXna88)"
        )
        response["confidence"] = ConfidenceLevel.HIGH.name
        return response
        
    if confidence == ConfidenceLevel.LOW:
        response["answer"] = "I could not verify the exact current requirement from the available official information. Please verify with the concerned department/CSC before submission."
        return response
        
    if service in SERVICE_KNOWLEDGE:
        knowledge = SERVICE_KNOWLEDGE[service]
        
        # Build answer based on intent
        if intent == Intent.DOCUMENT_REQUIREMENTS:
            docs = "\n".join([f"{i+1}. {doc}" for i, doc in enumerate(knowledge.get("documents", []))])
            response["answer"] = f"### {service.name.replace('_', ' ').title()} — Documents Required\n\n**Required / applicable documents**\n{docs}\n\n**Important**\nRequirements can vary depending on the application type."
        elif intent == Intent.FEES_CHARGES:
            response["answer"] = f"### {service.name.replace('_', ' ').title()} — Fees\n\n{knowledge.get('fees', 'Information not available.')}"
        elif intent == Intent.APPLICATION_PROCESS:
            response["answer"] = f"### {service.name.replace('_', ' ').title()} — Process\n\n{knowledge.get('process', 'Information not available.')}"
        elif intent == Intent.ELIGIBILITY:
            response["answer"] = f"### {service.name.replace('_', ' ').title()} — Eligibility\n\n{knowledge.get('eligibility', 'Information not available.')}"
        elif intent == Intent.PROCESSING_TIME:
            response["answer"] = f"### {service.name.replace('_', ' ').title()} — Processing Time\n\n{knowledge.get('processing_time', 'Information not available.')}"
        else:
            # General fallback for known service
            response["answer"] = f"For {service.name.replace('_', ' ').title()}, please visit the CSC center with your Aadhaar and relevant documents."
            
        if service.name in OFFICIAL_SOURCES:
            response["source"] = OFFICIAL_SOURCES[service.name]
            
    else:
        # Known intent but unknown service
        response["answer"] = "Please visit the CSC center with your Aadhaar, mobile number, and any related document so the exact service requirement can be checked."
        
    if confidence == ConfidenceLevel.MEDIUM:
        response["answer"] += "\n\n*(Note: I could not verify the exact current requirement with high confidence. Please verify with the concerned department/CSC before submission.)*"
        
    return response
