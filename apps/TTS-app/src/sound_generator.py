import os
import gc
import json
import torch
import soundfile as sf
import numpy as np
from typing import Optional, List
from diffusers import AudioLDMPipeline, DPMSolverMultistepScheduler
from contextlib import nullcontext

# Handle relative import for script-level vs module-level execution
try:
    from .sfx_editor import repair_sfx, trim_silence, analyze_audio, auto_repair
except ImportError:
    try:
        from sfx_editor import repair_sfx, trim_silence, analyze_audio, auto_repair
    except ImportError:
        def repair_sfx(audio, category, **kwargs): return audio
        def trim_silence(audio, **kwargs): return audio
        def analyze_audio(*args): return {}
        def auto_repair(audio, *args): return audio, []

ENGINE_VERSION = "SFX_ENGINE_v6_STUDIO_DASHBOARD"

class SoundGenerator:
    """
    Self-auditing, studio-grade Text-to-SFX engine.
    Implements a forensic Check -> Auto-Repair -> Re-Validate pipeline.
    """

    # ----------------------- INIT -----------------------

    def __init__(
        self,
        model_id: str = "cvssp/audioldm-s-full-v2",
        device: Optional[str] = None,
        sample_rate: int = 16000,
        enable_xformers: bool = True,
        save_metadata: bool = True,
    ):
        self.model_id = model_id
        self.sample_rate = sample_rate
        self.pipe = None
        self.save_metadata = save_metadata

        if device:
            self.device = device
        elif torch.cuda.is_available():
            self.device = "cuda"
        elif torch.backends.mps.is_available():
            self.device = "mps"
        else:
            self.device = "cpu"

        self.dtype = torch.float16 if self.device == "cuda" else torch.float32

        print(f"[BOOT] {ENGINE_VERSION}")
        print(f"[BOOT] Device={self.device} | dtype={self.dtype}")

    # ----------------------- MODEL -----------------------

    def _lazy_load(self):
        if self.pipe is not None:
            raise RuntimeError(
                "Pipeline already loaded. Process restart required "
                "to guarantee engine integrity."
            )

        print(f"[LOAD] Model: {self.model_id}")

        self.pipe = AudioLDMPipeline.from_pretrained(
            self.model_id,
            torch_dtype=self.dtype,
        )

        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
            self.pipe.scheduler.config
        )

        self.pipe.to(self.device)
        self.pipe.enable_attention_slicing()

        if self.device == "cuda":
            try:
                self.pipe.enable_xformers_memory_efficient_attention()
                print("[LOAD] xFormers enabled")
            except Exception:
                pass

        print("[LOAD] Model ready")

    def unload(self):
        if self.pipe is not None:
            del self.pipe
            self.pipe = None
            if self.device == "cuda":
                torch.cuda.empty_cache()
            gc.collect()
            print("[UNLOAD] VRAM cleared")

    # ----------------------- AUTO CLASSIFIER -----------------------

    def _classify(self, prompt: str):
        p = prompt.lower()
        if any(w in p for w in ["cat", "dog", "meow", "bark", "animal"]): return "animal"
        if any(w in p for w in ["click", "hit", "slam", "impact", "door", "footstep"]): return "event"
        if any(w in p for w in ["ui", "select", "menu", "confirm"]): return "ui"
        if any(w in p for w in ["magic", "spell", "portal", "energy"]): return "magic"
        if any(w in p for w in ["wind", "rain", "fire", "crowd", "ambience"]): return "ambient"
        return "unknown"

    # ----------------------- PROMPT LOGIC -----------------------

    def _refine_prompt(self, prompt: str, duration: float, manual_class: Optional[str] = None):
        category = manual_class if manual_class and manual_class != "auto" else self._classify(prompt)
        quality = "high fidelity, professional game sound effect, clean, no noise"

        # Duration caps by class
        if category in ("animal", "event", "ui"):
            duration = min(duration, 2.5)
            guidance, steps = 4.8, 22
            refined = f"{prompt}, {quality}, single isolated sound, sharp transient"
        elif category in ("ambient", "ambience"):
            category = "ambient" # normalize
            guidance, steps = 3.8, 28
            refined = f"{prompt}, {quality}, continuous loopable ambience"
        elif category == "magic":
            guidance, steps = 5.0, 26
            refined = f"{prompt}, {quality}, fantasy magic sound"
        elif category == "foley":
            duration = min(duration, 4.0)
            guidance, steps = 4.5, 24
            refined = f"{prompt}, {quality}, footsteps movements foley"
        else:
            guidance, steps, refined = 4.5, 25, f"{prompt}, {quality}"

        return refined, duration, guidance, steps, category

    # ----------------------- GENERATE -----------------------

    def generate(
        self,
        prompt: str,
        output_path: str,
        duration: float = 5.0,
        num_waveforms: int = 1,
        seed: Optional[int] = None,
        steps: Optional[int] = None,
        guidance_scale: Optional[float] = None,
        manual_class: Optional[str] = None,
        eq_preset: Optional[str] = None,
        pitch_randomize: bool = True,
    ) -> List[dict]:
        """
        Generates SFX and returns a list of result dictionaries with file paths and forensics.
        """

        self._lazy_load()
        refined, duration, auto_guidance, auto_steps, category = self._refine_prompt(prompt, duration, manual_class)
        
        final_steps = steps if steps is not None else auto_steps
        final_guidance = guidance_scale if guidance_scale is not None else auto_guidance

        print(f"[STAGE] Generate ({category.upper()}) | [ENGINE] {ENGINE_VERSION}")

        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)

        with torch.autocast("cuda") if self.device == "cuda" else nullcontext():
            result = self.pipe(
                refined,
                negative_prompt="music, melody, speech, voice, distorted, low quality, reverb wash",
                audio_length_in_s=duration,
                num_inference_steps=final_steps,
                guidance_scale=final_guidance,
                num_waveforms_per_prompt=num_waveforms,
                generator=generator,
            )

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        base, ext = os.path.splitext(output_path)
        output_data = []

        for i, audio in enumerate(result.audios):
            # 1. INITIAL FORENSIC SCAN
            report = analyze_audio(audio, self.sample_rate, category, duration)
            
            # 2. AUTO-REPAIR (if needed)
            repairs = []
            if report["actions"]["repair_available"]:
                audio, repairs = auto_repair(audio, report, self.sample_rate)

            # 3. STUDIO STYLE CHAIN (Mastering Pass)
            is_var = num_waveforms > 1 and pitch_randomize
            audio = repair_sfx(audio, category, self.sample_rate, is_variation=is_var, manual_eq=eq_preset)

            # 4. FINAL VALIDATION (Audit)
            final_report = analyze_audio(audio, self.sample_rate, category, duration)
            final_report["repairs_applied"] = repairs

            path = f"{base}_{i+1}{ext}" if num_waveforms > 1 else output_path
            sf.write(path, audio, self.sample_rate, subtype="PCM_16")
            
            result_item = {
                "path": path,
                "url": f"/output/api/{os.path.basename(path)}",
                "diagnostics": final_report
            }
            output_data.append(result_item)

            if self.save_metadata:
                meta = {
                    "engine": ENGINE_VERSION, 
                    "category": category, 
                    "prompt": prompt, 
                    "seed": seed,
                    "diagnostics": final_report
                }
                with open(path.replace(".wav", ".json"), "w") as f: json.dump(meta, f)

        print(f"[SUCCESS] {len(output_data)} Studio-Grade assets ready.")
        return output_data

if __name__ == "__main__":
    gen = SoundGenerator()
    gen.generate("Magic arcane portal opening", "output/test/magic.wav", duration=2.5)
    gen.unload()
