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
