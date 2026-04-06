import React, { useEffect, useRef, useState } from "react";

type MessageEntry = {
  id: string;
  type: "user" | "agent" | "system";
  text: string;
  timestamp: number;
};

const API_ORIGIN = import.meta.env.VITE_BRIDGE_ENDPOINT || "http://localhost:4173";

export default function App() {
  const [code, setCode] = useState("");
  const [history, setHistory] = useState<MessageEntry[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch(`${API_ORIGIN}/pairing`)
      .then((res) => res.json())
      .then((data) => setCode(data.code))
      .catch(() => setCode("Unable to fetch"));

    fetch(`${API_ORIGIN}/history`)
      .then((res) => res.json())
      .then(setHistory);

    const ws = new WebSocket(API_ORIGIN.replace("http", "ws") + "/ws");
    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.event === "history") {
        setHistory(payload.payload);
      } else if (payload.event === "update") {
        setHistory((prev) => [...prev, payload.payload]);
      }
    });
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "user", text: message, timestamp: Date.now() },
    ]);
    setInput("");
    await fetch(`${API_ORIGIN}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  };

  const pokeAgent = async () => {
    await fetch(`${API_ORIGIN}/poke`, { method: "POST" });
  };

  return (
    <div className="screen">
      <header>
        <p className="label">Pair with your AG Agent</p>
        <h1>AG Bridge</h1>
        <p className="pairing">Pairing code: {code}</p>
        <button className="poke" onClick={pokeAgent}>
          Wake Up Agent
        </button>
      </header>

      <section className="chat">
        {history.map((item) => (
          <article key={item.id} className={`bubble ${item.type}`}>
            <span className="timestamp">
              {new Date(item.timestamp).toLocaleTimeString()}
            </span>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <footer className="composer">
        <input
          placeholder="Ask your agent..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </footer>
    </div>
  );
}
