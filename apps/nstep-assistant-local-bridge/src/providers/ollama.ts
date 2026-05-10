import { execSync } from "child_process";

export async function getOllamaResponse(mode: string, message: string): Promise<string> {
  const model = mode === "repo" ? "qwen2.5-coder:14b" : "llama3.1:8b";
  
  // Try calling Ollama CLI as a basic integration
  try {
    const prompt = `System: You are the NStep Company Assistant. Mode: ${mode}.
User: ${message}`;
    
    // NOTE: This uses child_process for simplicity in MVP. 
    // In production, use Ollama REST API or ollama JS client.
    return `[Mock Response] Connected to ${model} for mode ${mode}. 
I received your message: "${message}". 
This is a placeholder response from the NStep Assistant Local Bridge MVP.`;
  } catch (error) {
    return "Failed to connect to local model. Please ensure Ollama is running.";
  }
}
