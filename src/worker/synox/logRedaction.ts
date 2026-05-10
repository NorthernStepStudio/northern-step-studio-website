/**
 * Synox: Log Redaction Utility
 * Redacts sensitive patterns from build and deployment logs before storage in D1.
 */

const REDACTION_PATTERNS = [
  // API Keys and Tokens
  /(xox[pb]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})/gi, // Slack
  /(SG\.[a-z0-9_-]{22}\.[a-z0-9_-]{43})/gi, // SendGrid
  /(AIza[0-9A-Za-z-_]{35})/gi, // Google AIza
  /([a-z0-9]{32})/gi, // General 32-char hex (often keys)
  /(sk_live_[0-9a-zA-Z]{24})/gi, // Stripe Live
  /(sk_test_[0-9a-zA-Z]{24})/gi, // Stripe Test
  /(pk_live_[0-9a-zA-Z]{24})/gi, // Stripe Publishable
  /(pk_test_[0-9a-zA-Z]{24})/gi, // Stripe Publishable Test
  /(Bearer\s+[a-zA-Z0-9\-._~+/]+)/gi, // Bearer Tokens
  
  // Credentials
  /(password|passwd|pwd|secret|key|token|auth|credential|signing_key|keystore_password)\s*[:=]\s*([^\s,;]+)/gi,
  
  // Environment Variables
  /([A-Z0-9_]+)\s*=\s*([^\s,;]+)/g, // Only if it looks like a secret? Dangerous to over-redact.
];

export interface RedactionResult {
  redactedMessage: string;
  redactionCount: number;
  detectedRisks: string[];
}

export const redactLogMessage = (message: string): RedactionResult => {
  let redacted = message;
  let count = 0;
  const risks = new Set<string>();

  // Specific key detection for risk labeling
  if (message.toLowerCase().includes('stripe')) risks.add('FINANCIAL_SECRET');
  if (message.toLowerCase().includes('google') || message.toLowerCase().includes('aiza')) risks.add('CLOUD_CREDENTIAL');
  if (message.toLowerCase().includes('keystore') || message.toLowerCase().includes('signing')) risks.add('SIGNING_SECRET');
  if (message.toLowerCase().includes('supabase') || message.toLowerCase().includes('postgres')) risks.add('DATABASE_SECRET');

  REDACTION_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, (match, p1, p2) => {
      count++;
      if (p2) {
        // If it's a key-value pair like password=...
        return `${p1}=[REDACTED]`;
      }
      return '[REDACTED]';
    });
  });

  return {
    redactedMessage: redacted,
    redactionCount: count,
    detectedRisks: Array.from(risks)
  };
};
