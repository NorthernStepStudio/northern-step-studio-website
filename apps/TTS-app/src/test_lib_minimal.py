import os
import sys
import torch

# Environment Fixes
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

sys.path.append(os.path.join(os.getcwd(), "src"))
from voice_library import VoiceLibrary

print("Starting VoiceLibrary Test...")
try:
    lib = VoiceLibrary(gpu=False)
    print(f"Success! Voices found: {lib.list_voices()}")
except Exception as e:
    print(f"Failed: {e}")
