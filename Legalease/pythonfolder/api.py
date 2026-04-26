from fastapi import FastAPI, UploadFile, File
import pdfplumber
from docx import Document
import re
import json
import google.generativeai as genai

app = FastAPI()


#  Gemini setup
genai.configure(api_key="AIzaSyCZUAd-rfZlGyysz2teWgmB4mGg3s-JYNc")
model = genai.GenerativeModel("gemini-flash-latest")


# -------- TEXT EXTRACTION --------
def extract_text(file):
    text = ""
    # with pdfplumber.open(file.file) as pdf:
    #     for page in pdf.pages:
    #         if page.extract_text():
    #             text += page.extract_text() + "\n"

    filename = file.filename.lower()

    #  PDF
    if filename.endswith(".pdf"):
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                if page.extract_text():
                    text += page.extract_text() + "\n"

    #  DOCX
    elif filename.endswith(".docx"):
        doc = Document(file.file)
        for para in doc.paragraphs:
            text += para.text + "\n"

    #  DOC (older format - optional support)
    elif filename.endswith(".doc"):
        return ""  # skip for now (or convert later)

    return text.strip()


# -------- CLEAN TEXT --------
def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", "", text)
    return text.strip()

# -------- LEGAL DOCUMENT CHECK --------
def is_legal_document(text):
    text = text.lower()

    legal_keywords = [
        "agreement", "contract", "clause", "party",
        "court", "petition", "plaintiff", "defendant",
        "law", "legal", "act", "section", "judge","jurisdiction",
        "liability","breach",
        #  ADD THESE (IMPORTANT)
         "tender", "notice", "bid", "quotation",
       "terms and conditions", "registrar", "high court"
    ]

    score = sum(1 for word in legal_keywords if word in text)

    return score >= 4



########################################################
def detect_category(text):
    text = text.lower()

    if "non disclosure" in text or "nda" in text:
        return "NDA"

    elif "lease" in text or "rent" in text:
        return "Lease"

    elif "agreement" in text:
        return "Agreement"

    elif "contract" in text:
        return "Contract"

    else:
        return "Other"

# -------- GEMINI AI --------
def summarize_fast(text):
    text = text[:2000]

    prompt = f"""
Analyze this legal document and return:

1. Title (short, 4-6 words)
2. Summary (5=6 simple sentences,easy English)
3. Risk level (Low/Medium/High)
4. Important deadlines
5. Risky clauses
6.Parties involved:
  -Petitioner
  -Respondent
Return ONLY JSON:
{{
  "title": "...",
  "summary": "...",
  "risk": "...",
  "deadlines": ["..."],
  "riskyClauses": ["..."],
  "parties": {{
  "petitioner": "...",
  "respondent": "..."
  }}
}}

Text:
{text}
"""

    try:
        response = model.generate_content(prompt)

        raw = response.text.strip()
        

        #  STEP 1: remove markdown
        raw = raw.replace("```json", "").replace("```", "").strip()

        #  STEP 2: extract JSON safely
        start = raw.find("{")
        end = raw.rfind("}") + 1

        if start != -1 and end != -1:
            raw = raw[start:end]

        #  STEP 3: try parsing
        parsed = json.loads(raw)

        return parsed

    except Exception as e:
        print("GEMINI ERROR:", e)

        #  IMPORTANT: return RAW instead of failing silently
        return {
            "summary": raw if 'raw' in locals() else "AI failed",
            "risk": "Low",
            "deadlines": []
        }

def extract_risky_clauses(text):
    risky = []
    keywords = [
    "penalty", "liability", "termination", "breach",
    "court", "arrest", "fraud", "offence", "crime", "dispute"
]

    sentences = text.split(". ")

    for s in sentences:
        if any(word in s.lower() for word in keywords):
            risky.append(s.strip())

    return risky[:3]
# -------- MAIN API --------
@app.post("/summarize")
async def summarize(file: UploadFile = File(...)):

     #  NEW: block images & non-pdf
    if not file.filename.lower().endswith((".pdf",".doc",".docx")):
        return {
            "error": "This is not a legal document",
            "is_legal": False
        }
    text = clean_text(extract_text(file))

    if not text:
        return {"error": "No text found"}
    #  NEW (SAFE - does NOT break anything)
    is_legal = is_legal_document(text)
#  STOP ONLY IF NOT LEGAL (SAFE)
    if not is_legal:
     return {
        "error": "This is not a legal document",
        "is_legal": False
    }
    category = detect_category(text)
    # print("CATEGORY:", category) 
    ai_data = summarize_fast(text)
    deadlines = ai_data.get("deadlines", [])

    if not deadlines:
        deadlines = ["No deadline detected"]


    risky_clauses = ai_data.get("riskyClauses", [])

    if not risky_clauses:
        risky_clauses = ["No risky clauses detected"]

    
    title = ai_data.get("title", "")

    if not title:
        title = text[:50]   # fallback first line

    return {
        "title": title,
        "summary": ai_data.get("summary", ""),
        "risk": ai_data.get("risk", "Low"),
        "deadlines": deadlines,
        "riskyClauses": risky_clauses,
        "parties": ai_data.get("parties", {
        "petitioner": "Not specified",
        "respondent": "Not specified"
    }),
    #  NEW (SAFE - does NOT break anything)
    "is_legal" : is_legal,
    "category": category
    }
    