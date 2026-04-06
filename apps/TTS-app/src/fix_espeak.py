import os
import shutil
import sys

# The exact path we found
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
ESPEAK_EXE = os.path.join(ESPEAK_PATH, "espeak-ng.exe")

def fix_and_verify():
    print(f"Checking for espeak-ng at: {ESPEAK_EXE}")
    if not os.path.exists(ESPEAK_EXE):
        print("ERROR: espeak-ng.exe not found at the expected path!")
        return False
    
    # Update PATH for the current process
    os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
    
    # Verify shutil.which can see it
    found = shutil.which("espeak-ng")
    print(f"shutil.which('espeak-ng') found: {found}")
    
    if not found:
        print("ERROR: shutil.which still cannot find espeak-ng even after PATH update!")
        return False

    # Try to import TTS and check phonemizer
    try:
        from TTS.api import TTS
        print("TTS imported successfully.")
        
        # We can try to manually set the backend if needed, 
        # but let's see if the VITS model can be initialized now.
        model_name = "tts_models/en/ljspeech/vits"
        print(f"Attempting to initialize {model_name} (CPU)...")
        # Bypass TOS
        os.environ["COQUI_TOS_AGREED"] = "1"
        tts = TTS(model_name=model_name, gpu=False)
        print("Model initialized successfully!")
        
        test_output = os.path.join("output", "espeak_fix_test.wav")
        os.makedirs("output", exist_ok=True)
        tts.tts_to_file(text="The espeak backend is now correctly configured.", file_path=test_output)
        print(f"Verification WAV generated at: {test_output}")
        return True
        
    except Exception as e:
        print(f"Verification failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = fix_and_verify()
    sys.exit(0 if success else 1)
