from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import pdfplumber
import docx
import io
import os

from sqlalchemy.orm import Session
from fastapi import Depends
from database import SessionLocal, Analysis

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-resume-anlyzer-omega.vercel.app"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TextInput(BaseModel):
    text: str


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()

    if filename.endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

    elif filename.endswith(".docx"):
        document = docx.Document(io.BytesIO(content))
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)

    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    return {"filename": file.filename, "extracted_text": text}


@app.post("/analyze")
async def analyze_text(input: TextInput, db: Session = Depends(get_db)):
    if not input.text.strip():
        raise HTTPException(status_code=400, detail="No text provided to analyze.")

    prompt = f"""
You are a professional resume reviewer. Analyze the following resume text and provide:
1. Three key strengths
2. Three areas for improvement
3. A short overall summary (2-3 sentences)

Resume text:
{input.text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    saved = Analysis(input_text=input.text, result_text=response.text)
    db.add(saved)
    db.commit()
    db.refresh(saved)

    return {"analysis": response.text, "id": saved.id}


@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    records = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "input_text": r.input_text,
            "result_text": r.result_text,
            "created_at": r.created_at,
        }
        for r in records
    ]