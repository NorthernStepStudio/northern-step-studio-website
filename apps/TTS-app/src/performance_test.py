import os
import sys
import torch
import torchaudio
import soundfile as sf
import numpy as np
from voice_blender import VoiceBlender
from realism_engine import RealismEngine

def run_performance_test():
    # Targets
    HYBRID_SEED = os.path.join("output", "blended_hybrid_voice.wav")
    OUT_DIR = os.path.join("output", "performance")
    os.makedirs(OUT_DIR, exist_ok=True)
    
    if not os.path.exists(HYBRID_SEED):
        print(f"Error: {HYBRID_SEED} missing. Run test_blending.py first.")
        return
    
    blender = VoiceBlender(gpu=False)
    realism = RealismEngine()
    
    # Extract identity
    gpt, spk = blender.get_embeddings(HYBRID_SEED)
    
    # Scenario 1: Excited / Happy (High Valence, High Arousal)
    print("\n--- Generating Scenario: EXCITED ---")
    emotions_excited = realism.map_valence_arousal(0.8, 0.8)
    prosody_excited = realism.predict_prosody("I am SO EXCITED to show you this brand new AI performance!", emotions_excited)
    
    excited_out = os.path.join(OUT_DIR, "excited_performance.wav")
    # Synthesis with prosody
    blender.synthesize(
        "I am SO EXCITED to show you this brand new AI performance!",
        gpt, spk, excited_out
    )
    # Note: XTTS model doesn't take pitch_multi directly in internal inference call easily,
    # but we can adjust it via speed or by modulating embeddings if we had more control.
    # For now we use the text-based energy and terminal contours.
    
    # Scenario 2: Sad / Somber (Low Valence, Low Arousal)
    print("\n--- Generating Scenario: SOMBER ---")
    emotions_somber = realism.map_valence_arousal(-0.7, -0.6)
    somber_out = os.path.join(OUT_DIR, "somber_performance.wav")
    blender.synthesize(
        "It's a quiet day today... I'm feeling quite reflective.",
        gpt, spk, somber_out
    )
    
    # Scenario 3: Angry / Energetic (Low Valence, High Arousal)
    print("\n--- Generating Scenario: ANGRY ---")
    emotions_angry = realism.map_valence_arousal(-0.5, 0.9)
    angry_out = os.path.join(OUT_DIR, "angry_performance.wav")
    blender.synthesize(
        "STOP! I told you not to touch that building. It is VERY dangerous!",
        gpt, spk, angry_out
    )

    print(f"\nPhase 4 performance tests generated in {OUT_DIR}")

if __name__ == "__main__":
    # Add src to path
    sys.path.append(os.path.join(os.getcwd(), "src"))
    run_performance_test()
