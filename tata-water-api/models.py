from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re

class LeadSubmission(BaseModel):
    # Personal Details
    full_name: str = Field(..., min_length=2, description="Full Name of the applicant")
    mobile_number: str = Field(..., description="10-digit mobile number")
    email_address: Optional[EmailStr] = Field(None, description="Valid email address")
    whatsapp_number: Optional[str] = Field(None, description="10-digit whatsapp number")
    
    # Business Details
    type_of_business: str = Field(..., description="FMCG, Retail, Other")
    business_experience: str = Field(..., description="Years of experience")
    existing_distribution: Optional[str] = Field("no")
    warehouse_facility: Optional[str] = Field("no")
    
    # Territory Details
    state: str = Field(..., description="State of application")
    district: str = Field(..., description="District of application")
    
    # UTM / Tracking Parameters (Hidden fields or captured from URL)
    utm_source: Optional[str] = Field("direct")
    utm_medium: Optional[str] = Field("organic")
    utm_campaign: Optional[str] = Field(None)
    
    @validator("mobile_number", "whatsapp_number")
    def validate_phone(cls, v):
        if v:
            # Strip spaces, hyphens, and +91
            clean_number = re.sub(r'[\s\-\+]', '', v)
            if clean_number.startswith('91') and len(clean_number) == 12:
                clean_number = clean_number[2:]
            if not re.match(r'^[6-9]\d{9}$', clean_number):
                raise ValueError("Invalid Indian mobile number")
            return clean_number
        return v
