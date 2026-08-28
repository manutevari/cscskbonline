# knowledge/services.py
from enum import Enum
from typing import Dict, Any

class Service(Enum):
    PAN = "PAN"
    AADHAAR = "AADHAAR"
    AYUSHMAN = "AYUSHMAN"
    PM_KISAN = "PM_KISAN"
    VOTER_ID = "VOTER_ID"
    PASSPORT = "PASSPORT"
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE"
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE"
    DOMICILE_CERTIFICATE = "DOMICILE_CERTIFICATE"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    DEATH_CERTIFICATE = "DEATH_CERTIFICATE"
    PENSION = "PENSION"
    SCHOLARSHIP = "SCHOLARSHIP"
    FSSAI = "FSSAI"
    DIGIPAY = "DIGIPAY"
    BANKING = "BANKING"
    GENERAL_CSC = "GENERAL_CSC"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    UNKNOWN = "UNKNOWN"

SERVICE_KNOWLEDGE: Dict[Service, Dict[str, Any]] = {
    Service.PAN: {
        "documents": [
            "Aadhaar Card (must have correct DOB and linked mobile number)",
            "Passport-size photo (if required/physical mode)",
            "Signature or thumb impression"
        ],
        "fees": "Government fee is approx ₹107. Additional CSC service charges may apply.",
        "process": "1. Visit CSC with documents. 2. Biometric or OTP authentication. 3. Form submission. 4. e-PAN arrives in email, physical PAN by post.",
        "eligibility": "Any Indian citizen.",
        "processing_time": "e-PAN in 3-5 days; physical card in 15-20 days."
    },
    Service.AYUSHMAN: {
        "documents": [
            "Aadhaar Card",
            "Mobile number",
            "Ration Card or Family ID (if applicable)"
        ],
        "fees": "No government fee for card generation. Nominal CSC printing charge may apply.",
        "process": "1. Verify name in PM-JAY list. 2. Do e-KYC using Aadhaar (OTP/Fingerprint). 3. Card is generated and printed.",
        "eligibility": "Families listed in SECC 2011 data, Antyodaya Anna Yojana (AAY) cardholders, and other state-specific eligible lists.",
        "processing_time": "Usually instant or within a few hours if KYC matches perfectly."
    },
    Service.PM_KISAN: {
        "documents": [
            "Aadhaar Card",
            "Bank Passbook",
            "Khatauni (Land Record)"
        ],
        "fees": "Nominal CSC service charge for registration.",
        "process": "1. Register on portal via CSC. 2. Verify land details. 3. Aadhaar e-KYC.",
        "eligibility": "Landholding farmer families with cultivable land.",
        "processing_time": "Approval by State Government may take a few weeks to months."
    },
    Service.INCOME_CERTIFICATE: {
        "documents": [
            "Aadhaar Card",
            "Passport-size photo",
            "Self-declaration form",
            "Previous income proof or Ration card"
        ],
        "fees": "State government fee + CSC service charge (varies by state, typically ₹30-50).",
        "process": "1. Apply via e-District portal at CSC. 2. Form forwarded to Lekhpal/Tehsildar. 3. Certificate issued online.",
        "eligibility": "Citizen requiring proof of income.",
        "processing_time": "Normally 7-15 working days."
    },
    Service.GENERAL_CSC: {
        "documents": ["Bring Aadhaar and relevant existing documents for accurate guidance."],
        "fees": "Varies by specific service.",
        "process": "Visit the CSC center for detailed guidance.",
        "eligibility": "N/A",
        "processing_time": "Varies by service."
    }
}
