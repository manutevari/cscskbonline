# core/query_normalizer.py
import re

def normalize_query(query: str) -> str:
    """Normalize user query by making it lowercase and replacing common variations."""
    query = query.lower().strip()
    
    # Common variations and transliterations
    replacements = {
        r'\bdoc\b': 'document',
        r'\bdocs\b': 'documents',
        r'\bpapers\b': 'documents',
        r'\bkagaz\b': 'documents',
        r'\bkaagaz\b': 'documents',
        r'\bpaise\b': 'fee',
        r'\bfees\b': 'fee',
        r'\bkitna\b': 'how much',
        r'\bkaha\b': 'where',
        r'\bkahan\b': 'where',
        r'\blocation\b': 'where',
        r'\bkaise\b': 'how',
        r'\bstatus\b': 'status',
        r'\bkaun\b': 'who',
        r'\bbanega\b': 'apply',
        r'\bbanwane\b': 'apply',
        r'\bchahiye\b': 'required',
        r'\blagega\b': 'required',
        r'\blagenge\b': 'required'
    }
    
    for pattern, repl in replacements.items():
        query = re.sub(pattern, repl, query)
        
    return query
