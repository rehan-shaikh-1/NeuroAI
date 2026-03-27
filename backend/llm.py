import os
import google.generativeai as genai
from typing import List, Dict, Optional

# Configure Gemini with the securely provided API key
genai.configure(api_key="[ENCRYPTION_KEY]")

# Using the blazing fast Gemini 2.5 Flash for conversational looping
MODEL_NAME = "gemini-2.5-flash"

async def generate_response(system_prompt: str, user_prompt: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """Send the structured prompt and history asynchronously to the Gemini Engine."""
    try:
        # 1. Initialize the model injecting the core system persona
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_prompt
        )
        
        # 2. Format our basic `{role, content}` history payload into Gemini's `{'role', 'parts'}` schema
        gemini_history = []
        if history:
            for msg in history:
                # Gemini expects "user" and "model" roles (no "assistant")
                role = "user" if msg.get("role") == "user" else "model"
                content = msg.get("content", "")
                if content:
                    gemini_history.append({
                        "role": role,
                        "parts": [content]
                    })
        
        # 3. Kickoff native chat session with mapped history
        chat = model.start_chat(history=gemini_history)
        
        # 4. Await response for optimized concurrency/batch processing
        response = await chat.send_message_async(user_prompt)
        
        return response.text
        
    except Exception as e:
        return f"Error communicating with Gemini API: {str(e)}"
