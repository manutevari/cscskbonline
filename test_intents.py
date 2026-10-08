from core.answer_engine import generate_answer

def test():
    tests = [
        {"query": "PAN card ke liye kya documents lagenge?", "service": "PAN", "intent": "DOCUMENT_REQUIREMENTS"},
        {"query": "pan banwane ke liye kya kya lagega", "service": "PAN", "intent": "DOCUMENT_REQUIREMENTS"},
        {"query": "Ayushman card kaise banega?", "service": "AYUSHMAN", "intent": "APPLICATION_PROCESS"},
        {"query": "PM Kisan ke liye kaun eligible hai?", "service": "PM_KISAN", "intent": "ELIGIBILITY"},
        {"query": "PAN banane ki fee kitni hai?", "service": "PAN", "intent": "FEES_CHARGES"},
        {"query": "mera application status kaise check hoga?", "service": "UNKNOWN", "intent": "STATUS_TRACKING"},
        {"query": "CSC Shikohabad kaha hai?", "service": "GENERAL_CSC", "intent": "CSC_LOCATION"},
        {"query": "पुराना बिजली ऑफिस वाला CSC कहाँ है?", "service": "GENERAL_CSC", "intent": "CSC_LOCATION"},
        {"query": "Income certificate ke liye kya papers chahiye?", "service": "INCOME_CERTIFICATE", "intent": "DOCUMENT_REQUIREMENTS"},
    ]
    
    passed = 0
    for t in tests:
        res = generate_answer(t["query"])
        if res["service"] == t["service"] and res["intent"] == t["intent"]:
            print(f"[PASS] {t['query']}")
            passed += 1
        else:
            print(f"[FAIL] {t['query']}")
            print(f"  Expected: {t['service']} / {t['intent']}")
            print(f"  Got: {res['service']} / {res['intent']}")
            
    print(f"\nPassed {passed}/{len(tests)} tests.")

if __name__ == "__main__":
    test()
