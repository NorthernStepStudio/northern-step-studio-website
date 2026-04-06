import torch
import torch.nn as nn
import numpy as np

class EmotionEncoder(nn.Module):
    """
    Converts 5-dimensional emotion values into a higher-dimensional 
    embedding vector for TTS conditioning.
    """
    def __init__(self, input_dim=5, output_dim=256):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, output_dim)
        )

    def forward(self, emotion_values):
        # emotion_values: [happiness, sadness, anger, calm, energy]
        return self.net(emotion_values)

def get_emotion_embedding(emotion_dict, encoder=None):
    """
    Simple mapping or learned encoder for emotion embeddings.
    """
    keys = ["happiness", "sadness", "anger", "calm", "energy"]
    values = [emotion_dict.get(k, 0.0) for k in keys]
    tensor_vals = torch.FloatTensor(values).unsqueeze(0)
    
    if encoder:
        with torch.no_grad():
            return encoder(tensor_vals)
    
    # Fallback to simple random-base mapping (Step 2.4 logic)
    dim = 256
    base = torch.zeros(dim)
    for i, val in enumerate(values):
        # Deterministic 'random' vector per emotion for consistency
        torch.manual_seed(i)
        vec = torch.randn(dim)
        base += vec * val
        
    return base / (torch.norm(base) + 1e-6)

def apply_prosody_heuristics(audio, text, emotion_dict):
    """
    Applies pitch and pacing shifts based on text and emotion.
    """
    # Placeholder for Phase 4/5 logic
    # pitch *= 1 + 0.15 * emotion_dict.get("energy", 0)
    return audio

if __name__ == "__main__":
    test_emotion = {"happiness": 0.8, "energy": 0.6}
    embedding = get_emotion_embedding(test_emotion)
    print(f"Generated embedding shape: {embedding.shape}")
    print(f"Embedding norm: {torch.norm(embedding)}")
