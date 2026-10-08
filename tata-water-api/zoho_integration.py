import os
import requests
from dotenv import load_dotenv
from models import LeadSubmission

load_dotenv()

ZOHO_API_DOMAIN = os.getenv("ZOHO_API_DOMAIN", "https://www.zohoapis.com")

# Mock database to simulate deduplication locally
mock_db = []

class ZohoIntegration:
    
    @staticmethod
    def get_access_token():
        # In a real scenario, this would use the refresh_token to get a fresh access_token
        # using https://accounts.zoho.com/oauth/v2/token
        # For this mock, we just return a dummy token
        return "mock_zoho_access_token_123"

    @staticmethod
    def check_duplicate(phone: str, email: str = None) -> bool:
        """
        Check if a lead already exists in Zoho (Mock implementation)
        In production, this would be a COQL query or Search API call to Zoho.
        """
        for lead in mock_db:
            if lead.get("Mobile") == phone:
                return True
            if email and lead.get("Email") == email:
                return True
        return False

    @staticmethod
    def map_to_zoho_format(lead: LeadSubmission) -> dict:
        """
        Map our Pydantic model to Zoho CRM standard/custom fields.
        """
        return {
            "Last_Name": lead.full_name, # Zoho requires Last_Name, usually we map Full Name here or split it
            "Mobile": lead.mobile_number,
            "Email": lead.email_address or "",
            "Lead_Source": "Website LP",
            # Custom Fields (assuming these API names exist in Zoho)
            "WhatsApp_Number": lead.whatsapp_number or lead.mobile_number,
            "Type_of_Business": lead.type_of_business,
            "Business_Experience": lead.business_experience,
            "Existing_Distribution": lead.existing_distribution,
            "Warehouse_Facility": lead.warehouse_facility,
            "State": lead.state,
            "District": lead.district,
            # UTM Parameters
            "UTM_Source": lead.utm_source,
            "UTM_Medium": lead.utm_medium,
            "UTM_Campaign": lead.utm_campaign,
        }

    @staticmethod
    def submit_lead(lead: LeadSubmission) -> dict:
        """
        Main function to process and submit the lead to Zoho CRM.
        """
        # 1. Deduplication Check
        if ZohoIntegration.check_duplicate(lead.mobile_number, lead.email_address):
            return {
                "status": "duplicate",
                "message": "A lead with this phone number or email already exists."
            }

        # 2. Prepare Data
        zoho_record = ZohoIntegration.map_to_zoho_format(lead)
        payload = {
            "data": [zoho_record],
            "trigger": ["workflow", "approval", "blueprint"]
        }

        # 3. API Push (Mocked)
        # access_token = ZohoIntegration.get_access_token()
        # headers = {"Authorization": f"Zoho-oauthtoken {access_token}"}
        # response = requests.post(f"{ZOHO_API_DOMAIN}/crm/v3/Leads", json=payload, headers=headers)
        
        # Simulating a successful Zoho API response
        mock_db.append(zoho_record)
        
        return {
            "status": "success",
            "message": "Lead successfully pushed to Zoho CRM",
            "zoho_response": {
                "data": [{"code": "SUCCESS", "details": {"id": f"4000000{len(mock_db)}"}}]
            }
        }
