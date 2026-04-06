import { useEffect, useState } from 'react';
import { ConnectionState, AiProviderStatus } from '../types';
import { baseUrl } from '../helpers';
import { StatusBadge } from './components';

interface SystemStatusProps {
  connection: ConnectionState;
  twilioReady: boolean;
  appId: string;
}

export function SystemStatus({ connection, twilioReady, appId }: SystemStatusProps) {
  const [gatewayStatus, setGatewayStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [aiStatus, setAiStatus] = useState<'ready' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const url = baseUrl(connection.gatewayUrl);
        if (!url) {
          setGatewayStatus('offline');
          setAiStatus('offline');
          return;
        }

        // Check Gateway health
        const healthRes = await fetch(`${url}/health`).catch(() => null);
        setGatewayStatus(healthRes?.ok ? 'online' : 'offline');

        // Check AI status
        const aiRes = await fetch(`${url}/v1/config/provider?app_id=${encodeURIComponent(appId)}`, {
          headers: { 
            'x-api-key': connection.apiKey,
            'content-type': 'application/json'
          }
        }).catch(() => null);

        if (aiRes?.ok) {
          const data = await aiRes.json() as { provider: AiProviderStatus };
          setAiStatus(data.provider.effective !== 'off' ? 'ready' : 'offline');
        } else {
          setAiStatus('offline');
        }
      } catch (error) {
        setGatewayStatus('offline');
        setAiStatus('offline');
      }
    };

    checkStatus();
    const id = setInterval(checkStatus, 15000);
    return () => clearInterval(id);
  }, [connection.gatewayUrl, connection.apiKey, appId]);

  return (
    <div className="system-status-container">
      <div className="status-pill-group">
        <div className="status-item">
          <span className="status-dot-label">Gateway</span>
          <StatusBadge 
            tone={gatewayStatus === 'online' ? 'success' : gatewayStatus === 'checking' ? 'neutral' : 'error'} 
          >
            {gatewayStatus}
          </StatusBadge>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <span className="status-dot-label">Twilio</span>
          <StatusBadge 
            tone={twilioReady ? 'success' : 'error'} 
          >
            {twilioReady ? 'online' : 'unconfigured'}
          </StatusBadge>
        </div>
        <div className="status-divider" />
        <div className="status-item">
          <span className="status-dot-label">Automation</span>
          <StatusBadge 
            tone={aiStatus === 'ready' ? 'success' : aiStatus === 'checking' ? 'neutral' : 'error'} 
          >
            {aiStatus}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}
