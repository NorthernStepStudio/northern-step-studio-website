import numpy as np
from scipy.signal import butter, lfilter
import random
import time

# ----------------------- BASIC TOOLS -----------------------

def trim_silence(audio, threshold=0.01):
    """Surgically removes AI hiss tails from start/end."""
    idx = np.where(np.abs(audio) > threshold)[0]
    if len(idx) == 0:
        return audio
    
    start, end = idx[0], idx[-1]
    # Pad with 50ms for natural decay
    pad = int(16000 * 0.05)
    start = max(0, start - pad)
    end = min(len(audio), end + pad)
    return audio[start:end]


def fade(audio, fade_in=0.01, fade_out=0.04, sr=16000):
    """Smooths edges to prevent clicks."""
    fi = int(fade_in * sr)
    fo = int(fade_out * sr)

    if len(audio) > fi:
        audio[:fi] *= np.linspace(0, 1, fi)
    if len(audio) > fo:
        audio[-fo:] *= np.linspace(1, 0, fo)

    return audio


def remove_dc(audio):
    """Removes DC offset to center the waveform."""
    return audio - np.mean(audio)


def rms_normalize(audio, target_rms=0.14):
    """Enforces target loudness (standard 0.14)."""
    rms = np.sqrt(np.mean(audio**2)) + 1e-9
    return audio * (target_rms / rms)


def soft_limit(audio):
    """Prevents digital clipping with warm saturation (Tanh)."""
    return np.tanh(audio)


def apply_noise_gate(audio, floor_db=-50):
    """Cuts low-level AI hiss below a certain threshold."""
    floor = 10 ** (floor_db / 20)
    return np.where(np.abs(audio) < floor, 0.0, audio)


def trim_tail(audio, max_samples):
    """Enforces duration caps by trimming the end."""
    return audio[:max_samples]


# ----------------------- AAA STUDIO TOOLS -----------------------

def pitch_shift(audio, semitones, sr=16000):
    """Shifts pitch by resampling (±2.5% style)."""
    if semitones == 0:
        return audio
    factor = 2 ** (semitones / 12.0)
    indices = np.arange(0, len(audio), factor)
    indices = indices[indices < len(audio)].astype(np.int32)
    return audio[indices]


def random_pitch(audio, category):
    """Randomizes pitch based on studio-grade ranges."""
    if category in ("ui", "event", "foley"):
        semitones = random.uniform(-0.5, 0.5) # ~±3%
    elif category == "ambient":
        semitones = random.uniform(-0.2, 0.2)
    else:
        semitones = random.uniform(-0.3, 0.3)
    
    return pitch_shift(audio, semitones)


def make_seamless_loop(audio, sr=16000, crossfade_time=0.25):
    """Creates a seamless loop using energy-matched crossfade."""
    fade_len = int(crossfade_time * sr)
    if len(audio) < fade_len * 2:
        return audio

    head = audio[:fade_len]
    tail = audio[-fade_len:]

    rms_head = np.nan_to_num(np.sqrt(np.mean(head ** 2)))
    rms_tail = np.nan_to_num(np.sqrt(np.mean(tail ** 2)))
    if rms_tail > 0:
        tail *= (rms_head / rms_tail)

    fade_out = np.linspace(1, 0, fade_len)
    fade_in = np.linspace(0, 1, fade_len)

    blended = (tail * fade_out) + (head * fade_in)
    return np.concatenate([audio[:-fade_len], blended])


# ----------------------- FILTERS -----------------------

def _butter_filter(audio, cutoff, sr, btype):
    nyq = 0.5 * sr
    safe_cutoff = min(cutoff, nyq - 100)
    norm = safe_cutoff / nyq
    b, a = butter(2, norm, btype=btype)
    return lfilter(b, a, audio)

def apply_preset(audio, preset, sr=16000):
    """Category-specific mastering presets."""
    if preset == "ui":
        # Aggressive noise removal for UI
        audio = _butter_filter(audio, 200, sr, "high")
        audio = _butter_filter(audio, 8000, sr, "low")
    elif preset == "event":
        audio = _butter_filter(audio, 60, sr, "high")
        audio = _butter_filter(audio, 7500, sr, "low")
    elif preset == "foley":
        audio = _butter_filter(audio, 120, sr, "high")
        audio = _butter_filter(audio, 7000, sr, "low")
    elif preset == "ambient":
        audio = _butter_filter(audio, 40, sr, "high")
        audio = _butter_filter(audio, 15000, sr, "low")
    elif preset == "voice":
        audio = _butter_filter(audio, 100, sr, "high")
        audio = _butter_filter(audio, 12000, sr, "low")
    return audio


# ----------------------- FORENSIC ENGINE -----------------------

def analyze_audio(audio, sr, sound_type, expected_max):
    """Generates the Forensic Diagnostic Report JSON."""
    duration = len(audio) / sr
    
    rms = np.sqrt(np.mean(audio**2))
    rms_db = 20 * np.log10(rms + 1e-9)

    peak = np.max(np.abs(audio))
    peak_dbfs = 20 * np.log10(peak + 1e-9)

    # Noise floor: 10th percentile of magnitude
    noise_floor = np.percentile(np.abs(audio), 10)
    noise_floor_db = 20 * np.log10(noise_floor + 1e-9)

    # DC Offset
    dc_offset = np.mean(audio)
    
    warnings = []
    if noise_floor_db > -45:
        warnings.append({"code": "NOISE_FLOOR", "severity": "warning", "message": f"Noise floor elevated ({noise_floor_db:.1f} dB)"})
    if peak >= 0.99:
        warnings.append({"code": "CLIPPING", "severity": "error", "message": "Clipping detected (peak at ceiling)"})
    if duration > expected_max + 0.1:
        warnings.append({"code": "DURATION", "severity": "warning", "message": "Asset exceeds requested duration"})

    return {
        "version": "1.1",
        "timestamp": int(time.time()),
        "classification": {
            "sound_type": sound_type,
            "confidence": 1.0, # Manual override assumed 1.0
            "expected_max_duration": expected_max,
            "actual_duration": round(duration, 2)
        },
        "audio_health": {
            "rms_db": round(rms_db, 2),
            "rms_target_db": -14.0,
            "peak_dbfs": round(peak_dbfs, 2),
            "dc_offset_removed": abs(dc_offset) < 1e-4,
            "noise_floor_db": round(noise_floor_db, 2)
        },
        "engine_compatibility": {
            "sample_rate": sr,
            "bit_depth": 16,
            "format": "PCM",
            "clipping_detected": peak >= 1.0,
            "engine_safe": peak < 1.0
        },
        "warnings": warnings,
        "actions": {
            "repair_available": len(warnings) > 0,
            "auto_fix_loop": sound_type == "ambient"
        }
    }


def auto_repair(audio, report, sr):
    """Deterministic repair pass based on diagnostics."""
    repairs = []

    # 1. DC Offset
    if not report["audio_health"]["dc_offset_removed"]:
        audio = remove_dc(audio)
        repairs.append("dc_offset_removed")

    # 2. Noise Gate
    if report["audio_health"]["noise_floor_db"] > -45:
        audio = apply_noise_gate(audio)
        repairs.append("noise_gate")

    # 3. Normalization (if way off)
    rms_db = report["audio_health"]["rms_db"]
    if rms_db < -20 or rms_db > -10:
        audio = rms_normalize(audio)
        repairs.append("rms_normalized")

    # 4. Clipping
    if report["engine_compatibility"]["clipping_detected"]:
        audio = soft_limit(audio)
        repairs.append("soft_limiter")

    # 5. Tail Trim
    max_dur = report["classification"]["expected_max_duration"]
    actual = report["classification"]["actual_duration"]
    if actual > max_dur:
        audio = trim_tail(audio, int(max_dur * sr))
        repairs.append("duration_trim")

    # 6. Silence Cleanup (Always)
    audio = trim_silence(audio)
    repairs.append("silence_trim")

    return audio, repairs


# ----------------------- MASTER CHAIN -----------------------

def repair_sfx(audio, category, sr=16000, is_variation=False, manual_eq=None):
    """Exposes the full Studio mastering chain."""
    
    # AI Presets
    preset = manual_eq if manual_eq else category
    audio = apply_preset(audio, preset, sr)

    # Dynamics (Soft limit always)
    audio = soft_limit(audio)

    # Ambient looping
    if category == "ambient":
        audio = make_seamless_loop(audio, sr, crossfade_time=0.5)

    # Microfade
    audio = fade(audio, 0.005, 0.02, sr)

    # Variation
    if is_variation:
        audio = random_pitch(audio, category)

    return audio.astype(np.float32)
