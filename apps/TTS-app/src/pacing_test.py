import os
import sys
from voice_blender import VoiceBlender

def run_pacing_test():
    # Targets
    HYBRID_SEED = os.path.join("output", "blended_hybrid_voice.wav")
    OUT_DIR = os.path.join("output", "pacing_tests")
    os.makedirs(OUT_DIR, exist_ok=True)
    
    if not os.path.exists(HYBRID_SEED):
        print(f"Error: {HYBRID_SEED} missing.")
        return
    
    blender = VoiceBlender(gpu=False)
    
    # Extract identity
    gpt, spk = blender.get_embeddings(HYBRID_SEED)
    
    # Test 1: Rapid Pacing (Short sentences, commas)
    print("\n--- Test 1: Rapid Pacing ---")
    text_rapid = "Quick, fast, immediate, now! We need it done, correctly, and efficiently."
    blender.synthesize(text_rapid, gpt, spk, os.path.join(OUT_DIR, "rapid_pacing.wav"))
    
    # Test 2: Slow/Ponderous (Ellipses, long words)
    print("\n--- Test 2: Slow Ponderous ---")
    text_slow = "Well... let me think about that for a moment... It requires... careful consideration."
    blender.synthesize(text_slow, gpt, spk, os.path.join(OUT_DIR, "slow_ponderous.wav"))
    
    # Test 3: Micro-Jitter (Standard text with random length_penalty per block)
    print("\n--- Test 3: Micro-Jitter ---")
    text_jitter = "Consistency is good, but subtle variation makes it feel alive."
    # We simulate jitter by varying the prompt slightly or using the length_penalty if we expose it
    # For now, let's just use the synthesize wrapper
    blender.synthesize(text_jitter, gpt, spk, os.path.join(OUT_DIR, "jitter_test.wav"))

    print(f"\nPacing tests generated in {OUT_DIR}")

if __name__ == "__main__":
    sys.path.append(os.path.join(os.getcwd(), "src"))
    run_pacing_test()
