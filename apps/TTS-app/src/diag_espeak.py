import os
import ctypes
import ctypes.util
import shutil

ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
DLL_PATH = os.path.join(ESPEAK_PATH, "libespeak-ng.dll")

print(f"Checking for DLL at: {DLL_PATH}")
if os.path.exists(DLL_PATH):
    print("DLL exists.")
    try:
        lib = ctypes.cdll.LoadLibrary(DLL_PATH)
        print("Successfully loaded DLL via ctypes.cdll.LoadLibrary")
    except Exception as e:
        print(f"Failed to load DLL via ctypes: {e}")
else:
    print("DLL does NOT exist.")

# Test phonemizer library logic
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = DLL_PATH
os.environ["ESPEAK_DATA_PATH"] = os.path.join(ESPEAK_PATH, "espeak-ng-data")

try:
    from phonemizer.backend import EspeakBackend
    print("Phonemizer EspeakBackend imported.")
    if EspeakBackend.is_available():
        print("EspeakBackend.is_available() is TRUE")
    else:
        print("EspeakBackend.is_available() is FALSE")
except Exception as e:
    print(f"Phonemizer test failed: {e}")
