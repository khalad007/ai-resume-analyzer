from fastapi import FastAPI, HTTPException, UploadFile, File, HTTPException
import pdfplumber
import docx
import io

app = FastAPI()
@app.get("/")
def health_check():
    return {"Status": "ok"}



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
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    return {"filename": file.filename, "text": text}                   