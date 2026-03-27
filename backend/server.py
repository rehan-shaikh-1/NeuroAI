from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import StudentInput
from backend.main import run_study_buddy_pipeline

app = FastAPI(
    title="Study Buddy NeuroAvatar API",
    description="Microservice to process messy student input and generate human-like guide scripts with NVFP4 long context support.",
    version="1.0.0"
)

# Enable CORS so your frontend (like avatar.js) can talk to this microservice directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Simple check to make sure the microservice is running."""
    return {"status": "ok", "message": "NeuroAvatar Study Buddy API is online."}

@app.post("/api/v1/chat")
async def process_chat(student: StudentInput):
    """
    Main endpoint for the frontend.
    Accepts student history, raw input, and context.
    Returns the fully processed text to be sent to a Text-to-Speech synthesizer.
    """
    try:
        # Pydantic natively parsed the JSON request into our `StudentInput` model.
        # We pass it as a dict to your robust pipeline.
        inference_result = run_study_buddy_pipeline(student.model_dump())
        return {
            "success": True, 
            "reply": inference_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
