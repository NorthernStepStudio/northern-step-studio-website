import os
import sys
import time
import torch
import torchaudio
import soundfile as sf
import numpy as np

# --- ENVIRONMENT FIXES (PyTorch 2.6 + Torchaudio DLLs) ---
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

def patched_torchaudio_load(path, **kwargs):
    data, samplerate = sf.read(path)
    if len(data.shape) == 1:
        data = data.reshape(1, -1)
    else:
        data = data.T
    return torch.from_numpy(data).float(), samplerate

torchaudio.load = patched_torchaudio_load

# Add espeak-ng to PATH
ESPEAK_PATH = r"C:\Program Files\eSpeak NG"
os.environ["PATH"] = ESPEAK_PATH + os.pathsep + os.environ.get("PATH", "")
os.environ["COQUI_TOS_AGREED"] = "1"

# --- CORE BLENDER LOGIC ---

class VoiceBlender:
    def __init__(self, model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=None):
        from TTS.api import TTS
        
        # Auto-detect GPU if not explicitly set
        if gpu is None:
            gpu = torch.cuda.is_available()
            
        print(f"Initializing {model_name}... (GPU: {gpu})")
        self.tts = TTS(model_name=model_name, gpu=gpu)
        self.model = self.tts.synthesizer.tts_model
        print("Model loaded.")

    def get_embeddings(self, speaker_wav):
        """Extracts gpt_cond_latent and speaker_embedding from a WAV."""
        print(f"Extracting embeddings from {speaker_wav}...")
        gpt_cond_latent, speaker_embedding = self.model.get_conditioning_latents(audio_path=[speaker_wav])
        return gpt_cond_latent, speaker_embedding

    def blend_embeddings(self, embedding_list, weights=None):
        """Averages multiple embeddings to create a unique blended voice."""
        if weights is None:
            weights = [1.0 / len(embedding_list)] * len(embedding_list)
        
        # Initialize blended tensors
        blended_gpt = None
        blended_speaker = None
        
        for (gpt, speaker), weight in zip(embedding_list, weights):
            if blended_gpt is None:
                blended_gpt = gpt * weight
                blended_speaker = speaker * weight
            else:
                blended_gpt += gpt * weight
                blended_speaker += speaker * weight
        
        return blended_gpt, blended_speaker

    def synthesize(self, text, gpt_cond_latent, speaker_embedding, output_path, language="en", pitch=1.0, speed=1.0, volume=1.0, emotion=None):
        """
        Synthesizes text using the Loaded XTTS model.
        emotion: dict with keys 'speed', 'temperature', 'repetition_penalty'
        """
        print(f"Synthesizing: '{text}' (Pitch: {pitch}, Emotion: {emotion}) -> {output_path}")
        from torchaudio import functional as F
        
        # Defaults
        speed = 1.0
        temperature = 0.7
        rep_penalty = 2.0
        
        if emotion:
            speed *= emotion.get("speed", 1.0) # Manual speed is a multiplier
            temperature = emotion.get("temperature", 0.7)
            rep_penalty = emotion.get("repetition_penalty", 2.0)
        
        out = self.model.inference(
            text,
            language,
            gpt_cond_latent,
            speaker_embedding,
            temperature=temperature,
            length_penalty=1.0,
            repetition_penalty=rep_penalty,
            top_k=50,
            top_p=0.8,
            speed=speed
        )
        
        wav = out["wav"]
        if torch.is_tensor(wav):
            wav_tensor = wav.cpu().float()
        else:
            wav_tensor = torch.from_numpy(wav).float()

        # Apply Pitch Shift if needed
        if pitch != 1.0:
            try:
                # Convert pitch factor to semitones: 12 * log2(factor)
                n_steps = 12 * np.log2(pitch)
                if len(wav_tensor.shape) == 1:
                    wav_tensor = wav_tensor.unsqueeze(0)
                # Resample-based pitch shift (torchaudio default)
                wav_tensor = F.pitch_shift(wav_tensor, 24000, n_steps)
                wav_tensor = wav_tensor.squeeze(0)
            except Exception as e:
                print(f"Pitch shift failed: {e}")

        wav = wav_tensor.numpy()
        
        # Apply Gain (Volume)
        if volume != 1.0:
            wav = wav * volume
            
        sf.write(output_path, wav, 24000)
        print(f"Done.")

if __name__ == "__main__":
    # Test cloning from our synthetic seed
    SEED_WAV = os.path.join("output", "base_voice_vits.wav")
    CLONE_OUT = os.path.join("output", "cloned_synthetic_voice.wav")
    
    if not os.path.exists(SEED_WAV):
        print(f"Error: {SEED_WAV} missing. Run complete_verification.py first.")
        sys.exit(1)
        
    blender = VoiceBlender(gpu=False)
    
    # Extract and Synthesize
    gpt, spk = blender.get_embeddings(SEED_WAV)
    blender.synthesize(
        "This is a legally safe clone of a synthetic seed voice. No humans were used in this process.",
        gpt, spk, CLONE_OUT
    )
    
    print(f"Phase 3 verification clone created at: {CLONE_OUT}")
