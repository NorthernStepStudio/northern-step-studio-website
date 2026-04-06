import os
import json
import torch
import shutil
import random
import time
from voice_blender import VoiceBlender

SEED_GENDER_MAP = {
    "hero_vits": "male",
    "elder_vits": "male",
    "whisper_trail": "female",
    "young_vits": "female",
    "american_ljspeech": "female",
    "blended_hybrid": "neutral"
}

SEED_ACCENT_MAP = {
    "hero_vits": "Epic",
    "elder_vits": "Sophisticated",
    "whisper_trail": "Soft",
    "young_vits": "Friendly",
    "american_ljspeech": "Neutral",
    "blended_hybrid": "Neural"
}

class VoiceLibrary:
    """
    Manages a collection of voice identities, caching their embeddings for performance.
    """
    def __init__(self, seeds_dir="models/voices/seeds", cache_dir="models/voices/cache", gpu=None, blender=None):
        self.seeds_dir = seeds_dir
        self.cache_dir = cache_dir
        self.metadata_path = "models/voices/metadata.json"
        os.makedirs(self.cache_dir, exist_ok=True)
        os.makedirs(os.path.dirname(self.metadata_path), exist_ok=True)
        
        self.blender = blender if blender else VoiceBlender(gpu=gpu)
        self.voices = {}
        self.metadata = {}
        self.load_metadata()
        self.load_library()

    def load_metadata(self):
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)

    def save_metadata(self):
        with open(self.metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=4)

    def load_library(self):
        """
        Scans seeds directory and extracts embeddings for new voices.
        """
        if not os.path.exists(self.seeds_dir):
            print(f"Warning: Seeds directory {self.seeds_dir} not found.")
            return

        for filename in os.listdir(self.seeds_dir):
            if filename.endswith(".wav"):
                voice_name = os.path.splitext(filename)[0]
                self.process_voice(voice_name, os.path.join(self.seeds_dir, filename))

        # Also register the original hybrid if it exists
        hybrid_path = os.path.join("output", "blended_hybrid_voice.wav")
        if os.path.exists(hybrid_path):
            self.process_voice("blended_hybrid", hybrid_path)

        # CRITICAL: Load saved voices from cache that don't have seed wavs
        if os.path.exists(self.cache_dir):
            for filename in os.listdir(self.cache_dir):
                if filename.endswith(".pth"):
                    voice_name = os.path.splitext(filename)[0]
                    # If we haven't loaded it yet (not a seed), load it now
                    if voice_name not in self.voices:
                         self.load_from_cache(voice_name)

    def load_from_cache(self, name):
        cache_path = os.path.join(self.cache_dir, f"{name}.pth")
        try:
            embeddings = torch.load(cache_path)
            self.voices[name] = embeddings
            print(f"Loaded {name} from cache.")
            return True
        except Exception as e:
            print(f"Failed to load {name} from cache: {e}")
            return False

    def process_voice(self, name, wav_path):
        """
        Extracts and caches embeddings for a single voice.
        """
        # Try loading from cache first
        if self.load_from_cache(name):
             return
            
        cache_path = os.path.join(self.cache_dir, f"{name}.pth")

        # Extract
        print(f"Extracting embeddings for {name}...")
        try:
            gpt_latent, speaker_embedding = self.blender.get_embeddings(wav_path)
            embeddings = {
                "gpt_cond_latent": gpt_latent,
                "speaker_embedding": speaker_embedding
            }
            # Save to cache
            torch.save(embeddings, cache_path)
            self.voices[name] = embeddings
        except Exception as e:
            print(f"Failed to process voice {name}: {e}")

    def get_voice(self, name):
        return self.voices.get(name)

    def get_metadata(self, name):
        # Default stats for seed voices to avoid 0.00 everywhere
        SEED_STATS = {
            "elder_vits": {"v": -0.2, "a": -0.1},
            "hero_vits": {"v": 0.5, "a": 0.6},
            "whisper_vits": {"v": 0.1, "a": -0.7},
            "young_vits": {"v": 0.6, "a": 0.4},
            "blended_hybrid": {"v": 0.0, "a": 0.0},
            "american_ljspeech": {"v": 0.2, "a": 0.2}
        }
        
        default_stats = SEED_STATS.get(name, {"v": 0.0, "a": 0.0})
        
        return self.metadata.get(name, {
            "name": name.replace("_", " ").replace("vits", "").title().strip(),
            "parent_id": "seed",
            "valence": default_stats["v"],
            "arousal": default_stats["a"],
            "pitch": 1.0,
            "gender": SEED_GENDER_MAP.get(name, "neural"),
            "accent": SEED_ACCENT_MAP.get(name, "Neural")
        })

    def save_voice(self, name, parent_id, valence, arousal, pitch):
        """
        Creates a new neural identity derived from a parent, with fixed settings.
        """
        # Copy embeddings from parent
        parent_voice = self.get_voice(parent_id)
        if not parent_voice:
            return False
            
        self.voices[name] = parent_voice
        self.metadata[name] = {
            "name": name,
            "parent_id": parent_id,
            "valence": valence,
            "arousal": arousal,
            "pitch": pitch
        }
        self.save_metadata()
        
        # Also cache the "link" so it persists between restarts
        cache_path = os.path.join(self.cache_dir, f"{name}.pth")
        torch.save(parent_voice, cache_path)
        return True

    def delete_voice(self, name):
        if name in self.voices:
            del self.voices[name]
        if name in self.metadata:
            del self.metadata[name]
        self.save_metadata()
        
        cache_path = os.path.join(self.cache_dir, f"{name}.pth")
        if os.path.exists(cache_path):
            os.remove(cache_path)
        return True

    def list_voices(self):
        return [
            {**self.get_metadata(name), "id": name} 
            for name in self.voices.keys()
        ]

    def generate_random_voice(self, gender=None):
        """
        Generates a new random id by blending 2-3 random seeds (optionally matching gender).
        """
        candidates = list(SEED_GENDER_MAP.keys())
        # Filter to only existing voices
        candidates = [c for c in candidates if c in self.voices]
        
        # Filter by gender if requested
        if gender:
            candidates = [c for c in candidates if SEED_GENDER_MAP.get(c) == gender]
            
        # Fallback if filter leaves too few options
        if len(candidates) < 2:
            candidates = list(SEED_GENDER_MAP.keys())

        # Pick 2 or 3 voices
        num_mix = random.randint(2, min(3, len(candidates)))
        selected_seeds = random.sample(candidates, num_mix)
        
        # Generate random weights that sum to 1.0
        weights = [random.random() for _ in range(num_mix)]
        total_w = sum(weights)
        weights = [w / total_w for w in weights]
        
        print(f"Generating Random Voice: {selected_seeds} with weights {weights}")
        
        # Get embeddings
        embeddings = []
        for seed_id in selected_seeds:
            voice_data = self.get_voice(seed_id)
            if voice_data:
                embeddings.append((voice_data["gpt_cond_latent"], voice_data["speaker_embedding"]))
        
        if not embeddings:
            return None

        # Blend
        gpt_list = [e[0] for e in embeddings]
        spk_list = [e[1] for e in embeddings]
        
        # blend_embeddings returns (gpt, spk)
        # Note: VoiceBlender.blend_embeddings expects list of (gpt, spk) tuples
        blended_gpt, blended_spk = self.blender.blend_embeddings(
            list(zip(gpt_list, spk_list)), 
            weights
        )
        
        # Save
        new_id = f"random_{int(time.time())}"
        
        self.voices[new_id] = {
            "gpt_cond_latent": blended_gpt,
            "speaker_embedding": blended_spk
        }
        
        self.save_voice(new_id, "mixture", 0.0, 0.0, 1.0)
        
        # Update metadata to reflect it's a random mix
        self.metadata[new_id]["type"] = "random"
        self.metadata[new_id]["parents"] = selected_seeds
        self.save_metadata()
        
        return new_id

if __name__ == "__main__":
    # Test initialization
    lib = VoiceLibrary()
    print(f"\nVoices available: {lib.list_voices()}")