from typing import List, Dict, Optional
import os
import requests

def generate_response(system_prompt: str, user_prompt: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """Send the structured prompt and history to a Local Ollama instance (100% Free, NO tokens)."""
    
    # 1. Prepare standard ChatML format messages
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if history:
        messages.extend(history)
        
    messages.append({"role": "user", "content": user_prompt})
    
    # 2. Point to the local Ollama daemon (requires installing Ollama from ollama.com)
    # Using 'llama3' or 'llama3.2'
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama3",
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        return response.json().get("message", {}).get("content", "")
    except requests.exceptions.ConnectionError:
        return "CONNECTION ERROR: Ollama is not running! \n\nPlease download Ollama from https://ollama.com\nOpen your terminal and run: `ollama run llama3` to start the local server."
    except Exception as e:
        return f"Error communicating with Local LLM: {str(e)}"
