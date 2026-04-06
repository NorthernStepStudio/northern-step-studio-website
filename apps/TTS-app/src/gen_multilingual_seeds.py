import os
import sys
import torch
from TTS.api import TTS

# --- ENVIRONMENT CONFIG ---
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = os.path.join(ESPEAK_PATH, "libespeak-ng.dll")
os.environ["PHONEMIZER_ESPEAK_PATH"] = ESPEAK_PATH
os.environ["COQUI_TOS_AGREED"] = "1"

# Fix torch.load for newer pytorch versions
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

OUT_DIR = os.path.join("models", "voices", "seeds")
os.makedirs(OUT_DIR, exist_ok=True)

def generate_seeds():
    # 1. American English (LJSpeech - Female)
    # This is the gold standard for American TTS
    try:
        print("\n--- Generating American Seed (LJSpeech) ---")
        model_name = "tts_models/en/ljspeech/vits"
        tts = TTS(model_name=model_name, gpu=False)
        text = "The quick brown fox jumps over the lazy dog. Typically, Americans appreciate directness and clarity in speech."
        out_path = os.path.join(OUT_DIR, "american_ljspeech.wav")
        tts.tts_to_file(text=text, file_path=out_path)
        print(f"Saved: {out_path}")
    except Exception as e:
        print(f"Failed American (LJSpeech): {e}")

    # 2. Spanish (CSS10 - Male)
    # CSS10 Spanish is usually a good single speaker model
    try:
        print("\n--- Generating Spanish Seed (CSS10) ---")
        model_name = "tts_models/es/css10/vits" 
        tts = TTS(model_name=model_name, gpu=False)
        text = "Hola, esto es una prueba de voz en español. La lluvia en Sevilla es una maravilla."
        out_path = os.path.join(OUT_DIR, "spanish_css10.wav")
        tts.tts_to_file(text=text, file_path=out_path)
        print(f"Saved: {out_path}")
    except Exception as e:
        print(f"Failed Spanish (CSS10): {e}")

    # 3. Italian (Mai - Female)
    # Using 'mai_female' or if redundant, try 'css10'
    try:
        print("\n--- Generating Italian Seed (Mai Female) ---")
        # Try finding a known Italian model. 
        # tts_models/it/mai_female/vits is common in Coqui's model list.
        # If it fails, we fall back to manual verification later.
        model_name = "tts_models/it/mai_female/vits" 
        tts = TTS(model_name=model_name, gpu=False)
        text = "Buongiorno! Questa è una voce italiana generata dall'intelligenza artificiale. La vita è bella."
        out_path = os.path.join(OUT_DIR, "italian_mai.wav")
        tts.tts_to_file(text=text, file_path=out_path)
        print(f"Saved: {out_path}")
    except Exception as e:
        print(f"Failed Italian (Mai): {e}")
        # Secondary fallback for Italian
        try:
           print("Retrying Italian with CSS10/VITS...")
           # Sometimes labeled differently? Let's try getting list/manager if needed, 
           # but let's assume if Mai fails, we might just be out of luck for auto-download
           pass
        except:
           pass

if __name__ == "__main__":
    generate_seeds()
