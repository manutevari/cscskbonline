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
