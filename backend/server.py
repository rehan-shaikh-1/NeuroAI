from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.models import StudentInput
from backend.main import run_study_buddy_pipeline
from backend.stt import transcribe
from backend.tts import generate_speech
import os
import uuid
import tempfile

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
        inference_result = await run_study_buddy_pipeline(student.model_dump())
        return {
            "success": True, 
            "reply": inference_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/stt")
async def process_stt(audio: UploadFile = File(...)):
    """Convert browser uploaded microphone data to text via Whisper."""
    try:
        temp_dir = tempfile.gettempdir()
        unique_filename = f"stt_{uuid.uuid4().hex}.webm"
        file_location = os.path.join(temp_dir, unique_filename)
        
        # Save file to disk safely
        with open(file_location, "wb") as f:
            f.write(await audio.read())
            
        # Transcribe using our async wrapper
        text = await transcribe(file_location)
        
        # Clean up temp upload
        os.remove(file_location)
        
        return {"success": True, "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/tts")
async def process_tts(text: str, model: str, background_tasks: BackgroundTasks):
    """Convert text to speech via pyttsx3 and stream the WAV file back."""
    try:
        mp3_filepath = await generate_speech(text, model)
        
        # Delete the file securely after responding to avoid disk bloating
        background_tasks.add_task(os.remove, mp3_filepath)
        
        return FileResponse(
            path=mp3_filepath, 
            media_type="audio/mpeg", 
            filename="response.mp3"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
