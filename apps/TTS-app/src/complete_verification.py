import os
import shutil
import sys
import time
import torch
import torchaudio
import soundfile as sf

# 1. PyTorch 2.6+ fix: Monkeypatch torch.load to allow Coqui model unpickling
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

# 2. Torchaudio fix: Monkeypatch torchaudio.load to use soundfile
# This bypasses the broken torchcodec/sox backends on some Windows setups.
def patched_torchaudio_load(path, **kwargs):
    # XTTS expects [channels, samples]
    data, samplerate = sf.read(path)
    if len(data.shape) == 1:
        data = data.reshape(1, -1)
    else:
        # If stereo, transpose to [channels, samples]
        data = data.T
    return torch.from_numpy(data).float(), samplerate

torchaudio.load = patched_torchaudio_load

# The exact path we found
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
# Update PATH for the current process
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["COQUI_TOS_AGREED"] = "1"

def run_verifications():
    try:
        from TTS.api import TTS
        print("TTS imported.")
        
        # 1. XTTS v2 (Phase 2)
        print("\n--- Verifying XTTS v2 (Phase 2) ---")
        xtts_model = "tts_models/multilingual/multi-dataset/xtts_v2"
        xtts_out = os.path.join("output", "xtts_final_test.wav")
        
        print(f"Loading {xtts_model}...")
        start_time = time.time()
        tts_xtts = TTS(model_name=xtts_model, gpu=False)
        print(f"Loaded in {time.time() - start_time:.2f}s")
        
        print("Synthesizing XTTS v2...")
        # Use our existing piper output as a reference speaker wav
        ref_wav = os.path.join("output", "piper_test.wav")
        if not os.path.exists(ref_wav):
            print(f"Error: {ref_wav} not found.")
            return False

        tts_xtts.tts_to_file(text="XTTS version 2 verification successful.", 
                             speaker_wav=ref_wav, 
                             language="en", 
                             file_path=xtts_out)
        print(f"XTTS v2 generated: {xtts_out}")

        # 2. VITS (Phase 3 Seed Voice)
        print("\n--- Verifying VITS Seed Voice (Phase 3) ---")
        vits_model = "tts_models/en/ljspeech/vits"
        vits_out = os.path.join("output", "base_voice_vits.wav")
        print(f"Loading {vits_model}...")
        tts_vits = TTS(model_name=vits_model, gpu=False)
        print("Synthesizing VITS seed voice...")
        tts_vits.tts_to_file(text="This is the synthetic seed voice used for legal cloning.", file_path=vits_out)
        print(f"VITS seed voice generated: {vits_out}")
        
        return True
        
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    success = run_verifications()
    sys.exit(0 if success else 1)
