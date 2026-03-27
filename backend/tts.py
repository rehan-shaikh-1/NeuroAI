import edge_tts
import os
import random
import asyncio
import tempfile
import uuid
import re

# Premium Edge TTS Voices
VRM_VOICE = "en-US-GuyNeural"
FEMALE_VOICES = ["en-US-AriaNeural", "en-US-JennyNeural", "en-CA-ClaraNeural"]

def clean_text_for_speech(text: str) -> str:
    """Removes emojis, URLs, and asterisks so the TTS engine doesn't read them aloud organically."""
    text = re.sub(r'[^\w\s\.,!\?\'"\-]', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('-', ', ')
    return text.strip()

async def edge_save_to_file(raw_text: str, voice: str, filepath: str):
    """Asynchronous generation using edge-tts."""
    text = clean_text_for_speech(raw_text)
    if not text:
        text = "Sorry, I cannot process that."
        
    communicate = edge_tts.Communicate(text, voice, rate="+5%")
    await communicate.save(filepath)

async def generate_speech(text: str, model_type: str) -> str:
    voice = VRM_VOICE if model_type == "vrm" else random.choice(FEMALE_VOICES)
    
    # Needs a temp dir
    os.makedirs(tempfile.gettempdir(), exist_ok=True)
    temp_filename = f"neuro_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(tempfile.gettempdir(), temp_filename)
    
    await edge_save_to_file(text, voice, filepath)
    return filepath
