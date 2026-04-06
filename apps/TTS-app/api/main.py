import os
import sys
import time
import torch
import torchaudio
import soundfile as sf
import numpy as np
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

# --- ENVIRONMENT FIXES (PyTorch 2.6 + Torchaudio DLLs) ---
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

def patched_torchaudio_load(path, **kwargs):
    data, samplerate = sf.read(path)
    if len(data.shape) == 1:
        data = data.reshape(1, -1)
    else:
        data = data.T
    return torch.from_numpy(data).float(), samplerate

torchaudio.load = patched_torchaudio_load

# Add espeak-ng to PATH when a host path is configured.
ESPEAK_PATH = os.environ.get("ESPEAK_PATH", r"C:\Program Files\eSpeak NG")
if ESPEAK_PATH and os.path.exists(ESPEAK_PATH):
    os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["COQUI_TOS_AGREED"] = "1"

# Import our custom engines
from voice_blender import VoiceBlender
from realism_engine import RealismEngine
from sfx_mixer import SFXMixer
from voice_library import VoiceLibrary
from sound_generator import SoundGenerator
import zipfile
import csv
import io
import json
import shutil

# --- MODELS & SCHEMAS ---

class SynthesisRequest(BaseModel):
    text: str
    valence: float = 0.0
    arousal: float = 0.0
    pitch: float = 1.0
    speed: float = 1.0
    volume: float = 1.0
    voice_id: str = "hybrid"
    engine: str = "xtts"

class VoiceSaveRequest(BaseModel):
    name: str # Human name
    parent_id: str # Source ID
    valence: float
    arousal: float
    pitch: float

class SFXRequest(BaseModel):
    event_name: str
    valence: float = 0.0
    arousal: float = 0.0

class SFXGenerateRequest(BaseModel):
    prompt: str
    duration: float = 5.0
    guidance_scale: float = 4.5
    steps: int = 25
    seed: Optional[int] = None
    num_waveforms: int = 1
    sound_class: str = "auto"
    eq_preset: str = "auto"
    pitch_randomize: bool = True

class LibrarySaveRequest(BaseModel):
    url: str # The URL of the file to save (e.g. /output/api/synth_123.wav)
    name: str # The user-provided name for the saved file

# --- APP INITIALIZATION ---

app = FastAPI(title="Antigravity TTS Controller")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="api/static"), name="static")
app.mount("/output", StaticFiles(directory="output"), name="output")

# Singleton Engine Instances
engines = {
    "blender": None,
    "library": None,
    "realism": RealismEngine(),
    "sfx": SFXMixer(),
    "gen_sfx": None
}

def get_blender():
    if engines["blender"] is None:
        engines["blender"] = VoiceBlender(gpu=None)
    return engines["blender"]

def get_library():
    if engines["library"] is None:
        blender = get_blender()
        engines["library"] = VoiceLibrary(gpu=None, blender=blender)
    return engines["library"]

def get_gen_sfx():
    if engines["gen_sfx"] is None:
        engines["gen_sfx"] = SoundGenerator()
    return engines["gen_sfx"]
@app.on_event("startup")
def startup_event():
    os.makedirs("output/api", exist_ok=True)
    os.makedirs("output/library", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    print("Pre-loading engines and Voice Library...")
    get_blender()
    get_library()
    print("All engines healthy.")
    os.makedirs("api/static", exist_ok=True)

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return FileResponse("api/static/index.html")

@app.get("/v1/voices")
async def list_voices():
    lib = get_library()
    return {"voices": lib.list_voices()}

@app.post("/v1/voices/save")
async def save_voice(req: VoiceSaveRequest):
    lib = get_library()
    # Clean name for ID (lowercase, no spaces)
    voice_id = req.name.lower().replace(" ", "_")
    success = lib.save_voice(voice_id, req.parent_id, req.valence, req.arousal, req.pitch)
    if success:
        return {"success": True, "voice_id": voice_id}
    raise HTTPException(status_code=400, detail="Failed to save voice. Check parent_id.")

@app.post("/v1/voices/update")
async def update_voice(req: VoiceSaveRequest):
    lib = get_library()
    voice_id = req.name.lower().replace(" ", "_")
    success = lib.save_voice(voice_id, req.parent_id, req.valence, req.arousal, req.pitch)
    if success:
        return {"success": True}
    raise HTTPException(status_code=400, detail="Update failed.")

@app.post("/v1/voices/delete/{voice_id}")
async def delete_voice(voice_id: str):
    lib = get_library()
    lib.delete_voice(voice_id)
    return {"success": True}

@app.post("/v1/synthesis")
async def synthesize(req: SynthesisRequest):
    blender = get_blender()
    lib = get_library()
    realism = engines["realism"]
    
    # 1. Map Emotion
    emotion_dict = realism.map_valence_arousal(req.valence, req.arousal)
    xtts_params = realism.get_xtts_params(emotion_dict)
    prosody = realism.predict_prosody(req.text, emotion_dict)
    
    # 2. Get Voice Identity
    voice_data = lib.get_voice(req.voice_id)
    if not voice_data:
        # Fallback to blended_hybrid if requested ID is missing
        voice_data = lib.get_voice("blended_hybrid")
        if not voice_data:
            raise HTTPException(status_code=404, detail=f"Voice {req.voice_id} not found and no fallback available.")
    
    gpt = voice_data["gpt_cond_latent"]
    spk = voice_data["speaker_embedding"]
    
    # 3. Synthesize
    filename = f"synth_{int(time.time())}.wav"
    output_path = os.path.join("output", "api", filename)
    
    try:
        blender.synthesize(
            req.text, 
            gpt, 
            spk, 
            output_path, 
            pitch=req.pitch, 
            speed=req.speed,
            volume=req.volume,
            emotion=xtts_params
        )
        return {
            "url": f"/output/api/{filename}",
            "emotion": emotion_dict,
            "xtts_params": xtts_params,
            "prosody": prosody
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RandomVoiceRequest(BaseModel):
    current_voice_id: Optional[str] = None

@app.post("/v1/voices/random")
async def generate_random_voice(req: RandomVoiceRequest):
    lib = get_library()
    
    # Determine target gender based on current voice
    target_gender = None
    if req.current_voice_id:
        # Resolve to seed
        # Real simple lookup for now.
        # In a real app we'd traverse parent_id, but here current_voice_id might be a seed or a save
        # We'll just check if the ID contains "female" or "male" markers or maps to our seed list
        # Actually library methods are safer
        pass

    # For now, let the library logic handle it if we pass the seed name
    # But wait, implementation plan says we resolve it here. 
    # Let's simplify and just pass the gender STRING if we can infer it, 
    # or let the library look up the parent of current_voice_id.
    
    # Better yet: The frontend knows the gender better? No, frontend just knows ID.
    # Let's import SEED_GENDER_MAP here or access it from lib? 
    # Accessing from lib is cleaner but lib instance isn't globally imported.
    # Let's just blindly try to find the gender from the ID string for now to be robust
    
    gender = None
    cid = req.current_voice_id
    if cid:
        if "hero" in cid or "elder" in cid:
            gender = "male"
        elif "whisper" in cid or "young" in cid:
            gender = "female"
            
    new_id = lib.generate_random_voice(gender=gender)
    if new_id:
        return {"success": True, "voice_id": new_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to generate random voice")

@app.post("/v1/sfx")
async def trigger_sfx(req: SFXRequest):
    mixer = engines["sfx"]
    realism = engines["realism"]
    
    emotion_dict = realism.map_valence_arousal(req.valence, req.arousal)
    
    filename = f"sfx_{req.event_name}_{int(time.time())}.wav"
    output_path = os.path.join("output", "api", filename)
    
    signal = mixer.play_event(
        req.event_name, 
        emotion_dict=emotion_dict, 
        is_tts_active=False, # We could detect this via state if needed
        output_path=output_path
    )
    
    if signal is None:
        raise HTTPException(status_code=400, detail=f"Event {req.event_name} not found.")
        
    return {"url": f"/output/api/{filename}"}

@app.post("/v1/sfx/generate")
async def generate_sfx(req: SFXGenerateRequest):
    gen = get_gen_sfx()
    filename = f"gen_sfx_{int(time.time())}.wav"
    output_path = os.path.join("output", "api", filename)
    
    try:
        results = gen.generate(
            req.prompt, 
            output_path, 
            duration=req.duration, 
            guidance_scale=req.guidance_scale, 
            steps=req.steps, 
            seed=req.seed,
            num_waveforms=req.num_waveforms,
            manual_class=req.sound_class,
            eq_preset=req.eq_preset,
            pitch_randomize=req.pitch_randomize
        )
        return {"status": "success", "results": results}
    except Exception as e:
        print(f"[Error] Generate SFX: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/sfx/suggestions")
async def get_sfx_suggestions():
    path = "data/sfx_suggestions.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

@app.get("/v1/library")
async def list_library():
    lib_dir = "output/library"
    files = []
    if os.path.exists(lib_dir):
        for f in os.listdir(lib_dir):
            if f.endswith(".wav"):
                files.append({
                    "name": f,
                    "url": f"/output/library/{f}",
                    "size": os.path.getsize(os.path.join(lib_dir, f))
                })
    return {"files": files}

@app.post("/v1/library/save")
async def save_to_library(req: LibrarySaveRequest):
    # Extract filename from URL (e.g. /output/api/synth_123.wav -> synth_123.wav)
    filename = req.url.split("/")[-1]
    src_path = os.path.join("output", "api", filename)
    
    if not os.path.exists(src_path):
        # Maybe it's already in library or elsewhere? Check library just in case but usually it's from api tmp
        raise HTTPException(status_code=404, detail="Source file not found in API output.")

    # Sanitize name for filename
    safe_name = "".join([c for c in req.name if c.isalnum() or c in (' ', '.', '_', '-')]).strip().replace(' ', '_')
    if not safe_name:
        safe_name = f"saved_{int(time.time())}"
    
    if not safe_name.endswith(".wav"):
        safe_name += ".wav"
        
    dest_path = os.path.join("output", "library", safe_name)
    shutil.copy2(src_path, dest_path)
    
    return {"success": True, "url": f"/output/library/{safe_name}"}

@app.post("/v1/library/delete")
async def delete_library_file(req: LibrarySaveRequest):
    # Extract filename from URL
    filename = req.url.split("/")[-1]
    path = os.path.join("output", "library", filename)
    if os.path.exists(path):
        os.remove(path)
        return {"success": True}
    raise HTTPException(status_code=404, detail="File not found in library.")

@app.post("/v1/api/delete")
async def delete_output(req: LibrarySaveRequest):
    # Reuse LibrarySaveRequest schema since it just needs a URL
    filename = req.url.split("/")[-1]
    path = os.path.join("output", "api", filename)
    if os.path.exists(path):
        os.remove(path)
        return {"success": True}
    raise HTTPException(status_code=404, detail="File not found in API output.")

@app.post("/v1/batch")
async def batch_synthesize(file: UploadFile = File(...)):
    blender = get_blender()
    lib = get_library()
    realism = engines["realism"]
    
    content = await file.read()
    filename_in = file.filename
    results = []
    
    batch_dir = f"output/api/batch_{int(time.time())}"
    os.makedirs(batch_dir, exist_ok=True)
    
    # Simple Parser logic (CSV preferred, TXT fallback)
    lines = []
    if filename_in.endswith(".csv"):
        stream = io.StringIO(content.decode("utf-8"))
        reader = csv.DictReader(stream)
        for row in reader:
            lines.append(row)
    else:
        # TXT: each line is a text prompt, using defaults
        raw_lines = content.decode("utf-8").splitlines()
        for idx, line in enumerate(raw_lines):
            if line.strip():
                lines.append({
                    "text": line.strip(),
                    "valence": 0,
                    "arousal": 0,
                    "voice_id": "blended_hybrid",
                    "filename": f"line_{idx+1}.wav"
                })

    # Synthesis Loop
    for item in lines:
        text = item.get("text", "")
        v = float(item.get("valence", 0))
        a = float(item.get("arousal", 0))
        vid = item.get("voice_id", "blended_hybrid")
        out_name = item.get("filename", f"msg_{int(time.time())}.wav")
        if not out_name.endswith(".wav"): out_name += ".wav"
        
        # 1. Map Emotion
        emotion_dict = realism.map_valence_arousal(v, a)
        prosody = realism.predict_prosody(text, emotion_dict)
        
        # 2. Get Voice Identity
        voice_data = lib.get_voice(vid) or lib.get_voice("blended_hybrid")
        gpt = voice_data["gpt_cond_latent"]
        spk = voice_data["speaker_embedding"]
        
        # 3. Synthesize
        target_path = os.path.join(batch_dir, out_name)
        blender.synthesize(text, gpt, spk, target_path)
        results.append(out_name)
        
    # Zip the results
    zip_filename = f"batch_export_{int(time.time())}.zip"
    zip_path = os.path.join("output/api", zip_filename)
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for f in results:
            zipf.write(os.path.join(batch_dir, f), f)
            
    return {
        "count": len(results),
        "url": f"/output/api/{zip_filename}",
        "files": results
    }

if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8888"))
    uvicorn.run(app, host=host, port=port)
