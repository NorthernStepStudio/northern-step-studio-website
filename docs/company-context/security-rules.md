# NStep Security Rules

## Data Protection
- **Zero Trust**: No internal service is trusted by default.
- **Encryption**: Sensitive data must be encrypted at rest and in transit.
- **Secrets Management**: Never commit secrets to the repository. Use `wrangler secret`.

## Access Control
- **RBAC**: Enforce Role-Based Access Control on all admin routes.
- **Least Privilege**: Users and services should only have the minimum permissions necessary.
- **Session Security**: Use `httpOnly`, `secure`, and `sameSite` cookies for session management.

## AI Security
- **No-Execute**: AI assistants must not have the ability to execute terminal commands or modify code directly.
- **Audit Logs**: All AI-driven operations must be logged for review.
- **Context Isolation**: AI should only have access to the context provided for the specific task.
