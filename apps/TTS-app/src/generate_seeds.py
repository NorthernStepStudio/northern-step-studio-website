import os
import sys

# --- ENVIRONMENT FIXES (MUST BE BEFORE TTS IMPORT) ---
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = os.path.join(ESPEAK_PATH, "libespeak-ng.dll")
os.environ["PHONEMIZER_ESPEAK_PATH"] = ESPEAK_PATH
os.environ["COQUI_TOS_AGREED"] = "1"

import torch

# PyTorch 2.6 fix
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

# Now import TTS
from TTS.api import TTS

def generate_seeds():
    OUT_DIR = os.path.join("models", "voices", "seeds")
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # Use VCTK multispeaker VITS for diversity
    print("Loading tts_models/en/vctk/vits...")
    tts = TTS(model_name="tts_models/en/vctk/vits", gpu=False)
    
    # VCTK common speakers: p226 (male), p225 (female), p232 (male), p243 (male/whispery)
    profiles = [
        {"name": "elder_vits", "speaker": "p226", "text": "I have seen many winters in these mountains, and I have much wisdom to share about the ancient paths and the secrets hidden in the snow."},
        {"name": "young_vits", "speaker": "p225", "text": "Wait for me! I want to see what is over that hill! Maybe there is a treasure or a magical creature waiting for us to find it!"},
        {"name": "hero_vits", "speaker": "p232", "text": "Do not fear, for I will stand between you and the darkness. My blade is sharp and my resolve is unbreakable, even in the darkest hour."},
        {"name": "whisper_vits", "speaker": "p243", "text": "Please, speak softly... the shadows have ears in this place, and we must not wake the ancient spirits that sleep beneath the earth."}
    ]
    
    for p in profiles:
        out_path = os.path.join(OUT_DIR, f"{p['name']}.wav")
        print(f"Generating seed: {p['name']} (Speaker: {p['speaker']})...")
        tts.tts_to_file(text=p['text'], speaker=p['speaker'], file_path=out_path)
    
    print(f"\nSeeds generated in {OUT_DIR}")

if __name__ == "__main__":
    generate_seeds()
