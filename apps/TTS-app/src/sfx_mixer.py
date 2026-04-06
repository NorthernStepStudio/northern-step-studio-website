import numpy as np
import soundfile as sf
import os
import sys
from sfx_engine import generate_bubble_pop, generate_click, generate_error_buzz, generate_breath, modulate_sfx

class SFXMixer:
    """
    Manages procedural sound events and their interaction with the TTS stream.
    """
    def __init__(self, sample_rate=44100):
        self.sr = sample_rate
        self.event_map = {
            "ui_click": generate_click,
            "ui_error": generate_error_buzz,
            "bubble": generate_bubble_pop,
            "breath": generate_breath
        }

    def play_event(self, event_name, emotion_dict=None, is_tts_active=False, output_path=None):
        """
        Synthesizes and transforms a sound based on state.
        """
        if event_name not in self.event_map:
            print(f"Unknown event: {event_name}")
            return None
        
        generator = self.event_map[event_name]
        # Generate base signal at mixer sample rate
        signal = generator(sr=self.sr)
        
        # 1. Apply Emotion Modulation
        if emotion_dict:
            signal = modulate_sfx(signal, emotion_dict)
            
        # 2. Apply Auto-Ducking
        if is_tts_active:
            # Drop volume by 10dB (factor of ~0.3)
            signal *= 0.3
            
        # 3. Add subtle pitch variability (+/- 3%)
        # (This would technically require resampling, but for tiny clicks we skip it)
            
        if output_path:
            sf.write(output_path, signal, self.sr)
        
        return signal

if __name__ == "__main__":
    mixer = SFXMixer()
    out_dir = os.path.join("output", "sfx_mix")
    os.makedirs(out_dir, exist_ok=True)
    
    # Example 1: Angry Click while TTS is active (Ducked)
    angry_emotions = {"anger": 0.8, "energy": 0.9}
    mixer.play_event(
        "ui_click", 
        emotion_dict=angry_emotions, 
        is_tts_active=True, 
        output_path=os.path.join(out_dir, "angry_ducked_click.wav")
    )
    
    # Example 2: Calm Bubble during silence
    calm_emotions = {"calm": 0.9}
    mixer.play_event(
        "bubble", 
        emotion_dict=calm_emotions, 
        is_tts_active=False, 
        output_path=os.path.join(out_dir, "calm_clean_bubble.wav")
    )
    
    print(f"Mixer examples generated in {out_dir}")
