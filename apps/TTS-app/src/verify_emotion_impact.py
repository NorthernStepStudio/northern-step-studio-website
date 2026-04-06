import os
import torch
import soundfile as sf
import numpy as np
from voice_blender import VoiceBlender

def test_emotion_impact():
    print("Initializing VoiceBlender...")
    blender = VoiceBlender(gpu=None) # Auto-detect
    
    # Use a dummy embedding (or load one if available)
    # For speed, let's just use random tensors if the model supports it, 
    # but XTTS needs valid embeddings. We'll try to load the seed.
    seed_path = "models/voices/seeds/hero_vits.wav"
    if not os.path.exists(seed_path):
        print(f"Skipping test: Seed {seed_path} not found.")
        return

    gpt, spk = blender.get_embeddings(seed_path)
    text = "This is a test of the emergency broadcast system."
    
    print("\n--- Generating Neutral ---")
    out_neutral = "output/test_neutral.wav"
    blender.synthesize(text, gpt, spk, out_neutral, emotion=None)
    
    print("\n--- Generating High Arousal (Fast/Varied) ---")
    out_excited = "output/test_excited.wav"
    emotion = {"speed": 1.5, "temperature": 0.9, "repetition_penalty": 2.0}
    blender.synthesize(text, gpt, spk, out_excited, emotion=emotion)
    
    # effective comparison
    data_neutral, rate = sf.read(out_neutral)
    data_excited, _ = sf.read(out_excited)
    
    len_n = len(data_neutral)
    len_e = len(data_excited)
    
    print(f"\nNeutral Length: {len_n} samples")
    print(f"Excited Length: {len_e} samples")
    
    if len_e < len_n:
        print("PASS: High arousal (speed 1.5) resulted in shorter audio.")
    else:
        print("FAIL: Audio lengths are similar or excited is longer.")
        
    if not np.array_equal(data_neutral[:min(len_n, len_e)], data_excited[:min(len_n, len_e)]):
         print("PASS: Audio content is different.")
    else:
         print("FAIL: Audio content is identical despite parameters.")

if __name__ == "__main__":
    try:
        test_emotion_impact()
    except Exception as e:
        print(f"Test Crashed: {e}")
