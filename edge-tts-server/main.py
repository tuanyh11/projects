from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import edge_tts
import io
import os

app = FastAPI(title="Lingua Edge TTS API")

# Cho phép gọi từ mọi nơi (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Lingua Edge TTS API is running"}

@app.get("/hello")
def hello():
    return {"message": "Hello World"}

@app.get("/v1/audio/speech")
async def get_speech(text: str, voice: str = "en-US-AriaNeural"):
    """
    API endpoint để lấy file âm thanh từ Edge TTS.
    - text: Chữ cần đọc.
    - voice: Tên giọng đọc (VD: en-US-AriaNeural, vi-VN-HoaiMyNeural).
    """
    try:
        communicate = edge_tts.Communicate(text, voice)
        
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
                
        if not audio_data:
            raise HTTPException(status_code=500, detail="Failed to generate audio")
            
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8880))
    uvicorn.run(app, host="0.0.0.0", port=port)
