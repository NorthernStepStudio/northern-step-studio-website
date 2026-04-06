import os
import sys
import torch
import time
import zipfile
import csv
import io

# Fix environment for speech
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = os.path.join(ESPEAK_PATH, "libespeak-ng.dll")
os.environ["PHONEMIZER_ESPEAK_PATH"] = ESPEAK_PATH
os.environ["COQUI_TOS_AGREED"] = "1"

# PyTorch 2.6 fix
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

# Imports from project
sys.path.append(os.path.join(os.getcwd(), "src"))
from voice_blender import VoiceBlender
from realism_engine import RealismEngine
from voice_library import VoiceLibrary

def run_local_batch():
    print("Initializing Engines...")
    blender = VoiceBlender(gpu=False)
    lib = VoiceLibrary(gpu=False)
    realism = RealismEngine()
    
    csv_content = """text,valence,arousal,voice_id,filename
Local batch test 1.,0.5,0.5,elder_vits,elder_test.wav
Local batch test 2.,-0.5,-0.5,whisper_vits,whisper_test.wav
Local batch test 3.,0.0,0.8,young_vits,young_test.wav
"""
    stream = io.StringIO(csv_content)
    reader = csv.DictReader(stream)
    lines = list(reader)
    
    batch_dir = f"output/local_batch_{int(time.time())}"
    os.makedirs(batch_dir, exist_ok=True)
    results = []
    
    print(f"Starting batch synthesis for {len(lines)} lines...")
    for item in lines:
        text = item["text"]
        v = float(item["valence"])
        a = float(item["arousal"])
        vid = item["voice_id"]
        out_name = item["filename"]
        
        print(f" - Processing {out_name} (Voice: {vid})...")
        emotion_dict = realism.map_valence_arousal(v, a)
        voice_data = lib.get_voice(vid) or lib.get_voice("blended_hybrid")
        gpt = voice_data["gpt_cond_latent"]
        spk = voice_data["speaker_embedding"]
        
        target_path = os.path.join(batch_dir, out_name)
        blender.synthesize(text, gpt, spk, target_path)
        results.append(target_path)
        
    print(f"\nBatch complete! Files generated in {batch_dir}")
    print("Verification SUCCESS.")

if __name__ == "__main__":
    run_local_batch()
