from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests
import os
from config import OPENROUTER_API_KEY, OPENROUTER_API_URL, MODEL, FRONTEND_URL

app = FastAPI(title="Raaju v1.0 - AI Chat API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = MODEL

class ChatResponse(BaseModel):
    message: str
    model: str

# Store conversation history (in-memory, will reset on server restart)
conversation_history = []

@app.get("/")
async def root():
    return {
        "name": "Raaju v1.0",
        "version": "1.0.0",
        "description": "AI Chat Agent powered by OpenRouter",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Send a message to Raaju AI and get a response.
    """
    try:
        if not OPENROUTER_API_KEY:
            raise HTTPException(status_code=500, detail="API Key not configured")

        # Convert messages to OpenRouter format
        messages_formatted = []
        for msg in request.messages:
            messages_formatted.append({
                "role": msg.role,
                "content": msg.content
            })

        # Call OpenRouter API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": FRONTEND_URL,
            "X-Title": "Raaju v1.0",
        }

        payload = {
            "model": request.model,
            "messages": messages_formatted,
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 2048,
        }

        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=60)
        
        print(f"OpenRouter Response Status: {response.status_code}")
        print(f"OpenRouter Response: {response.text}")

        if response.status_code != 200:
            print(f"Error from OpenRouter: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenRouter API error: {response.text}"
            )

        api_response = response.json()
        assistant_message = api_response["choices"][0]["message"]["content"]

        return ChatResponse(
            message=assistant_message,
            model=request.model
        )

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Request timeout - OpenRouter server is slow")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/api/clear-history")
async def clear_history():
    """Clear conversation history"""
    global conversation_history
    conversation_history = []
    return {"message": "Chat history cleared"}

@app.get("/api/models")
async def get_available_models():
    """Get list of available free models"""
    return {
        "models": [
            {
                "id": "openrouter/free",
                "name": "OpenRouter Free (Auto)",
                "type": "free",
                "description": "Smart router - automatically selects best available free model"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=PORT)
