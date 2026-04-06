import os
import sys
from voice_blender import VoiceBlender

def run_blending_test():
    # Targets
    SEED_1 = os.path.join("output", "base_voice_vits.wav")
    SEED_2 = os.path.join("output", "piper_test.wav")
    BLEND_OUT = os.path.join("output", "blended_hybrid_voice.wav")
    
    if not os.path.exists(SEED_1) or not os.path.exists(SEED_2):
        print("Error: Seed files missing. Ensure Phase 1 and 3 seeds are present.")
        return
    
    blender = VoiceBlender(gpu=False)
    
    # Extract
    emb1 = blender.get_embeddings(SEED_1)
    emb2 = blender.get_embeddings(SEED_2)
    
    # 50/50 Blend
    print("Blending 50/50...")
    gpt, spk = blender.blend_embeddings([emb1, emb2], weights=[0.5, 0.5])
    
    # Synthesize
    blender.synthesize(
        "This is a hybrid voice created by blending two unique synthetic identities. The result is a completely new persona.",
        gpt, spk, BLEND_OUT
    )
    
    print(f"Blending test successful! Output: {BLEND_OUT}")

if __name__ == "__main__":
    # Add src to path so we can import voice_blender if running from project root
    sys.path.append(os.path.join(os.getcwd(), "src"))
    run_blending_test()
