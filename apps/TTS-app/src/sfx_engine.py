import numpy as np
import soundfile as sf
import os

def generate_bubble_pop(sr=44100, duration=0.08, pitch=600, output_path=None):
    """
    Generates a procedural bubble pop sound.
    """
    t = np.linspace(0, duration, int(sr * duration))
    # Exponential decay envelope
    env = np.exp(-30 * t)
    # Frequency glide (start high, drop slightly)
    freq = pitch * (1 - 0.6 * t)
    signal = np.sin(2 * np.pi * freq * t) * env
    
    if output_path:
        sf.write(output_path, signal, sr)
    return signal

def generate_click(sr=44100, output_path=None):
    """
    Generates a quick procedural click sound.
    """
    noise = np.random.randn(int(sr * 0.01))
    env = np.exp(-60 * np.linspace(0, 1, noise.size))
    signal = noise * env
    
    if output_path:
        sf.write(output_path, signal, sr)
    return signal

def generate_error_buzz(sr=44100, output_path=None):
    """
    Generates a procedural error buzz.
    """
    t = np.linspace(0, 0.2, int(sr * 0.2))
    # Modulated square-ish wave
    signal = 0.4 * np.sin(2 * np.pi * 120 * t) * np.sign(np.sin(2 * np.pi * 8 * t))
    
    if output_path:
        sf.write(output_path, signal, sr)
    return signal

def generate_breath(sr=44100, duration=0.3, intensity=0.1, output_path=None):
    """
    Generates a procedural 'breath' sound using filtered white noise.
    """
    length = int(sr * duration)
    noise = np.random.randn(length)
    
    # Very simple low-pass: averaging
    filtered = np.convolve(noise, np.ones(10)/10, mode='same')
    
    # Envelope: Rounded triangle/sine for natural air flow
    t = np.linspace(0, 1, length)
    env = np.sin(np.pi * t) * intensity
    
    signal = filtered * env
    
    if output_path:
        sf.write(output_path, signal, sr)
    return signal

def modulate_sfx(sound, emotion_dict):
    """
    Modulates SFX parameters based on the current emotion state.
    """
    energy = emotion_dict.get("energy", 0)
    anger = emotion_dict.get("anger", 0)
    
    # Increase amplitude and saturation based on intensity
    sound *= 1 + 0.3 * energy
    sound = np.tanh(sound * (1 + anger))
    return sound

if __name__ == "__main__":
    os.makedirs("output/sfx", exist_ok=True)
    generate_bubble_pop(output_path="output/sfx/bubble.wav")
    generate_breath(output_path="output/sfx/breath.wav")
    print("Generated test SFX: output/sfx/bubble.wav, output/sfx/breath.wav")
