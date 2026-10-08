# core/intent_classifier.py
from enum import Enum
from typing import List, Optional
import re

class Intent(Enum):
    DOCUMENT_REQUIREMENTS = "DOCUMENT_REQUIREMENTS"
    ELIGIBILITY = "ELIGIBILITY"
    APPLICATION_PROCESS = "APPLICATION_PROCESS"
    FEES_CHARGES = "FEES_CHARGES"
    PROCESSING_TIME = "PROCESSING_TIME"
    STATUS_TRACKING = "STATUS_TRACKING"
    CORRECTION_UPDATE = "CORRECTION_UPDATE"
    DOWNLOAD_PRINT = "DOWNLOAD_PRINT"
    RENEWAL = "RENEWAL"
    LOST_REPLACEMENT = "LOST_REPLACEMENT"
    SERVICE_AVAILABILITY = "SERVICE_AVAILABILITY"
    CSC_LOCATION = "CSC_LOCATION"
    CSC_CONTACT = "CSC_CONTACT"
    DOCUMENT_INTERPRETATION = "DOCUMENT_INTERPRETATION"
    GENERAL_CSC_QUERY = "GENERAL_CSC_QUERY"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    UNKNOWN = "UNKNOWN"

INTENT_KEYWORDS = {
    Intent.DOCUMENT_REQUIREMENTS: [r'document', r'required', r'paper', r'कागज', r'kaagaz', r'kaise banega', r'kya lagega'],
    Intent.ELIGIBILITY: [r'eligible', r'eligibility', r'who can', r'पात्रता', r'kaun', r'kon'],
    Intent.APPLICATION_PROCESS: [r'how to apply', r'how apply', r'process', r'आवेदन', r'kaise apply', r'step', r'apply'],
    Intent.FEES_CHARGES: [r'fee', r'cost', r'charge', r'paise', r'kitne', r'how much'],
    Intent.PROCESSING_TIME: [r'how long', r'time', r'kitne din', r'kab tak', r'days'],
    Intent.STATUS_TRACKING: [r'status', r'pending', r'check', r'mera application'],
    Intent.CSC_LOCATION: [r'where', r'location', r'kaha', r'kahan', r'address', r'raasta', r'map', r'कहाँ'],
    Intent.CORRECTION_UPDATE: [r'correct', r'update', r'change', r'galat', r'sudhar']
}

def classify_intent(normalized_query: str) -> Intent:
    # Basic rule-based classification based on keywords
    for intent, patterns in INTENT_KEYWORDS.items():
        for pattern in patterns:
            if re.search(pattern, normalized_query, re.IGNORECASE):
                # Specific check for location to not confuse with general "where"
                if intent == Intent.CSC_LOCATION and 'csc' not in normalized_query:
                    # if they just say "where is pan center", it might still mean CSC
                    pass
                return intent
                
    if 'csc' in normalized_query:
        return Intent.GENERAL_CSC_QUERY
        
    return Intent.UNKNOWN
