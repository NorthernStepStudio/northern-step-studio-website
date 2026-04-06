# NStep Workspace

## Runtime Commands

### Production / Staging

Run the services as three explicit processes:

```bash
npm run dev:server
npm run dev:worker
npm run dev:dashboard
```

### Local Development

Use the one-command local orchestrator:

```bash
npm run dev
```

`dev` is only a local convenience wrapper. Keep server, worker, and dashboard as separate processes in staging and production.
