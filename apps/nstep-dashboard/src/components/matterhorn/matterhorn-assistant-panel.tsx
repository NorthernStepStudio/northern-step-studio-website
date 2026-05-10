"use client";

import { useState, useEffect, useRef } from "react";
import { matterhornClient, MatterhornMessage, MatterhornStatus } from "@/lib/matterhorn/matterhorn-client";

export function MatterhornAssistantPanel() {
  const [messages, setMessages] = useState<MatterhornMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<MatterhornStatus>({ online: false, provider: "Checking...", model: "..." });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    matterhornClient.getStatus().then(setStatus);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: MatterhornMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const assistantMsg = await matterhornClient.sendMessage(input);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Matterhorn error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="matterhorn-panel panel panel-strong">
      <div className="matterhorn-header">
        <div className="matterhorn-title-group">
          <h3 className="matterhorn-title">Matterhorn Assistant</h3>
          <div className="matterhorn-status-group">
            <span className={`status-dot ${status.online ? 'online' : 'offline'}`} />
            <span className="matterhorn-status-text">
              {status.online ? "Online" : "Offline"} • {status.provider} • {status.model}
            </span>
          </div>
        </div>
        <span className="pill status-warn">Advisory Only</span>
      </div>

      <div className="matterhorn-chat" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="matterhorn-empty">
            <div className="matterhorn-empty-content">
              <p>Ready for advisory queries. How can I help with Studio operations today?</p>
              <div className="matterhorn-suggestions">
                <button className="template-button" onClick={() => setInput("Propose build recovery procedure for NeuroMoves")}>Build Recovery</button>
                <button className="template-button" onClick={() => setInput("Analyze rollback impact for Synox snapshot")}>Rollback Analysis</button>
                <button className="template-button" onClick={() => setInput("Identify recurring failure patterns for NexusBuild")}>Pattern Analysis</button>
                <button className="template-button" onClick={() => setInput("Map downstream impact of Synox Bridge failure")}>Dependency Mapping</button>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`matterhorn-msg matterhorn-msg-${msg.role}`}>
            <div className="matterhorn-msg-content">{msg.content}</div>
            {msg.role === "assistant" && (
              <div className="matterhorn-msg-meta">
                {msg.sources && msg.sources.length > 0 && (
                  <div className="matterhorn-msg-sources">
                    <span className="label-tiny">Sources:</span> {msg.sources.join(", ")}
                  </div>
                )}
                <div className="matterhorn-msg-stats">
                  <div className="stat-pill">
                    <span className="label-tiny">Risk:</span>
                    <span className={`value-tiny ${msg.riskLevel === 'High' ? 'nsos-tone-danger' : 'nsos-tone-ok'}`}>
                      {msg.riskLevel || 'Low'}
                    </span>
                  </div>
                  <div className="stat-pill">
                    <span className="label-tiny">Confidence:</span>
                    <span className="value-tiny">{(msg.confidence ?? 0.90).toFixed(2)}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="label-tiny">Latency:</span>
                    <span className="value-tiny">{msg.latency ?? 0}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="matterhorn-msg matterhorn-msg-assistant loading">
            <span className="dot-pulse"></span> Thinking...
          </div>
        )}
      </div>

      <div className="matterhorn-controls">
        <form className="matterhorn-input-group" onSubmit={handleSend}>
          <input
            type="text"
            className="field"
            placeholder="Ask Matterhorn about studio state..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="button button-primary" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
        <div className="matterhorn-evidence-area">
          <span className="label-tiny">Active Evidence Context:</span>
          <div className="evidence-chips">
            <span className="pill status-info">Repo Snapshot</span>
            <span className="pill status-info">Health Telemetry</span>
            <span className="pill status-info">Action Queue</span>
            <span className="pill status-accent">Governance Audits</span>
            <span className="pill status-accent">Risk Register</span>
            <span className="pill status-danger">Incidents</span>
            <span className="pill status-warn">Operational Memory</span>
            <span className="pill status-accent">Execution Workflows</span>
            <span className="pill status-ok">Knowledge Graph</span>
            <span className="pill status-ok">Dependency Map</span>
            <span className="pill status-ok">Pattern Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

