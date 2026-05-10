import express from "express";
import cors from "cors";
import { getOllamaResponse } from "./providers/ollama";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3010;

app.post("/assistant/chat", async (req, res) => {
  const { mode, message, appKey } = req.body;

  console.log(`[Assistant] Received request - Mode: ${mode}, App: ${appKey}`);
  console.log(`[Assistant] Message: ${message}`);

  try {
    // Basic implementation connecting to Ollama
    // If Ollama is not available, return a mocked response
    const answer = await getOllamaResponse(mode, message);
    
    res.json({
      answer,
      sources: ["docs/company-context/assistant-behavior.md"],
      suggestedTasks: [],
      riskLevel: "low"
    });
  } catch (err) {
    console.error("[Assistant] Error processing request:", err);
    res.status(500).json({ error: "Failed to process chat request in local bridge." });
  }
});

app.listen(PORT, () => {
  console.log(`[NStep Assistant Bridge] Listening on http://localhost:${PORT}`);
  console.log(`[NStep Assistant Bridge] Make sure Ollama or LM Studio is running.`);
});
