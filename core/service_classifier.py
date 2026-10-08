# core/service_classifier.py
from knowledge.services import Service
import re

SERVICE_KEYWORDS = {
    Service.PAN: [r'pan', r'पैन'],
    Service.AADHAAR: [r'aadhaar', r'aadhar', r'adhar', r'आधार'],
    Service.AYUSHMAN: [r'ayushman', r'pmjay', r'health card', r'आयुष्मान'],
    Service.PM_KISAN: [r'pm kisan', r'kisan', r'pm-kisan', r'किसान'],
    Service.VOTER_ID: [r'voter', r'pehchan patra', r'election card'],
    Service.PASSPORT: [r'passport', r'पासपोर्ट'],
    Service.INCOME_CERTIFICATE: [r'income', r'aay praman', r'आय'],
    Service.CASTE_CERTIFICATE: [r'caste', r'jaati', r'jati praman', r'जाति'],
    Service.DOMICILE_CERTIFICATE: [r'domicile', r'nivas', r'niwas', r'residence', r'निवास'],
}

def classify_service(normalized_query: str) -> Service:
    for service, patterns in SERVICE_KEYWORDS.items():
        for pattern in patterns:
            if re.search(pattern, normalized_query, re.IGNORECASE):
                return service
                
    if 'csc' in normalized_query:
        return Service.GENERAL_CSC
        
    return Service.UNKNOWN
