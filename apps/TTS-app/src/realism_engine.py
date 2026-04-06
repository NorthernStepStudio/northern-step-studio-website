import numpy as np
import torch
import time
from emotion_engine import get_emotion_embedding

class RealismEngine:
    """
    Handles the mapping of psychology-based emotional inputs (Valence/Arousal)
    to TTS conditioning and applies dynamic performance curves.
    """
    def __init__(self, wobble_strength=0.05, wobble_freq=0.2):
        self.wobble_strength = wobble_strength
        self.wobble_freq = wobble_freq
        self.start_time = time.time()

    def map_valence_arousal(self, valence, arousal):
        """
        Maps 2D (V, A) space to 5D (Happiness, Sadness, Anger, Calm, Energy).
        V, A are assumed to be in range [-1.0, 1.0].
        """
        v = np.clip(valence, -1.0, 1.0)
        a = np.clip(arousal, -1.0, 1.0)
        
        happiness = max(0, v) * max(0.5, a + 0.5)
        sadness = max(0, -v) * max(0, -a)
        anger = max(0, -v) * max(0, a)
        calm = max(0, v) * max(0, -a)
        energy = max(0, a)
        
        return {
            "happiness": float(happiness),
            "sadness": float(sadness),
            "anger": float(anger),
            "calm": float(calm),
            "energy": float(energy)
        }

    def get_dynamic_emotion(self, base_v, base_a, t=None):
        """
        Returns a time-varying emotion state to avoid robotic stability.
        """
        if t is None:
            t = time.time() - self.start_time
            
        # Add subtle sine wobble to Arousal for 'breathing' effect
        wobble = self.wobble_strength * np.sin(2 * np.pi * self.wobble_freq * t)
        
        v_dyn = base_v
        a_dyn = np.clip(base_a + wobble, -1.0, 1.0)
        
        return self.map_valence_arousal(v_dyn, a_dyn)

    def get_xtts_params(self, emotion_dict):
        """
        Converts the 5D emotion dictionary into XTTS-specific inference parameters.
        """
        energy = emotion_dict.get("energy", 0.0)
        sadness = emotion_dict.get("sadness", 0.0)
        
        # Base settings
        speed = 1.0 + (energy * 0.2) - (sadness * 0.15)
        temp = 0.7 + (energy * 0.1)
        rep_penalty = 2.0
        
        return {
            "speed": float(np.clip(speed, 0.5, 2.0)),
            "temperature": float(np.clip(temp, 0.5, 1.0)),
            "repetition_penalty": rep_penalty
        }

    def predict_prosody(self, text, emotion_dict):
        """
        Heuristic-based prosody prediction for pitch and speed.
        Returns multipliers for [pitch, speed, energy].
        """
        pitch = 1.0
        speed = 1.0
        energy = 1.0
        
        # 1. Terminal Contours
        if text.strip().endswith("?"):
            pitch += 0.15 # Up-talk for questions
        elif text.strip().endswith("!"):
            energy += 0.2
            pitch += 0.05
            
        # 2. Emotion scaling
        pitch += 0.2 * emotion_dict.get("energy", 0)
        pitch -= 0.1 * emotion_dict.get("sadness", 0)
        
        speed += 0.2 * emotion_dict.get("happiness", 0)
        speed -= 0.2 * emotion_dict.get("sadness", 0)
        
        # 3. Emphasis (CAPS detection)
        words = text.split()
        caps_count = sum(1 for w in words if w.isupper() and len(w) > 1)
        if caps_count > 0:
            energy += 0.1 * caps_count
            speed -= 0.05 * caps_count # Slower, more deliberate
            
        return {
            "pitch_multi": float(np.clip(pitch, 0.5, 2.0)),
            "speed_multi": float(np.clip(speed, 0.5, 2.0)),
            "energy_multi": float(np.clip(energy, 0.5, 2.0))
        }

if __name__ == "__main__":
    engine = RealismEngine()
    
    # Test Mapping
    print("--- Test Mapping (V: 0.8, A: 0.2) ---")
    emotions = engine.map_valence_arousal(0.8, 0.2)
    for k, v in emotions.items():
        print(f"{k}: {v:.2f}")
        
    # Test Prosody
    print("\n--- Test Prosody ---")
    text = "Is this WORKING?"
    prosody = engine.predict_prosody(text, emotions)
    print(f"Text: {text}")
    print(prosody)
    
    # Test Embedding integration
    embedding = get_emotion_embedding(emotions)
    print(f"\nGenerated embedding from mapped emotions: {embedding.shape}")
