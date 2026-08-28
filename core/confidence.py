# core/confidence.py
from enum import Enum

class ConfidenceLevel(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

def assess_confidence(intent, service) -> ConfidenceLevel:
    if str(intent.name) != "UNKNOWN" and str(service.name) != "UNKNOWN":
        return ConfidenceLevel.HIGH
    elif str(intent.name) != "UNKNOWN" or str(service.name) != "UNKNOWN":
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.LOW
