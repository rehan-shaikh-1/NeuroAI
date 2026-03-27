import whisper
import os
import asyncio
import threading

# Global model cache to prevent reloading the 150MB checkpoint per request
model_lock = threading.Lock()
whisper_model = None

def get_model():
    global whisper_model
    if whisper_model is None:
        print("Loading Whisper 'base' model into memory... (This takes a few seconds)")
        whisper_model = whisper.load_model("base")
    return whisper_model

def transcribe_audio_file(filepath: str) -> str:
    """Synchronous Whisper logic run in the background thread."""
    with model_lock:
        local_model = get_model()
        # Enforce English, avoid static hallucination loops, and seed a conversational tone
        result = local_model.transcribe(
            filepath, 
            language="en", 
            condition_on_previous_text=False,
            initial_prompt="Hello! Let me ask you a question. Umm, wait. Okay, so..."
        )
        return result["text"]

async def transcribe(audio_filepath: str) -> str:
    """Asynchronously passes local temp files to whisper transcriber."""
    text = await asyncio.to_thread(transcribe_audio_file, audio_filepath)
    return text.strip()
