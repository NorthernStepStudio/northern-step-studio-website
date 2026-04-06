const express = require("express");
const http = require("http");
const os = require("os");
const WebSocket = require("ws");

const PORT = process.env.PORT || 4173;
const AG_PORT = process.env.AG_PORT || 9000;

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
const chatHistory = [];

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const iface of Object.values(ifaces)) {
    if (!iface) continue;
    for (const { address, family, internal } of iface) {
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
  return "127.0.0.1";
}

async function pokeAgent() {
  try {
    const res = await fetch(`http://localhost:${AG_PORT}/poke`, {
      method: "POST",
    });
    return await res.text();
  } catch (err) {
    console.warn("pokeAgent failed", err);
    return "failed";
  }
}

async function sendMessageToAG(message) {
  try {
    const res = await fetch(`http://localhost:${AG_PORT}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return await res.text();
  } catch (err) {
    console.warn("sendMessageToAG failed", err);
    return "failed";
  }
}

app.get("/pairing", (req, res) => {
  res.json({
    code: pairingCode,
    ip: getLocalIp(),
    port: PORT,
  });
});

app.post("/poke", async (req, res) => {
  const status = await pokeAgent();
  chatHistory.push({ type: "system", text: "Poke sent", status });
  broadcast({ type: "system", text: "Poke sent", status });
  res.json({ result: "ok", status });
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message required" });
  }
  chatHistory.push({ type: "user", text: message, timestamp: Date.now() });
  const agentResponse = await sendMessageToAG(message);
  chatHistory.push({ type: "agent", text: agentResponse, timestamp: Date.now() });
  broadcast({ type: "agent", text: agentResponse });
  res.json({ result: "ok", reply: agentResponse });
});

app.get("/history", (req, res) => {
  res.json(chatHistory.slice(-50));
});

function broadcast(payload) {
  const stringified = JSON.stringify({ event: "update", payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stringified);
    }
  });
}

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ event: "history", payload: chatHistory }));
});

server.listen(PORT, () => {
  console.log(`AG Bridge listening on http://localhost:${PORT}`);
  console.log(`Pairing code: ${pairingCode}`);
});
