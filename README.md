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

<<<<<<< Updated upstream
`dev` is only a local convenience wrapper. Keep server, worker, and dashboard as separate processes in staging and production.
=======
Generated output:

- `docs/repository-layout.md`
- `docs/roadmap.md`

That inventory is the source of truth for which top-level folders are:

- active workspace paths
- tracked standalone projects
- container folders with nested apps
- local/untracked incubators

## Cleanup rules

- Keep local logs, temp files, and dev-session files out of git.
- Treat `.nstep-workspace-ai-server-port.json` as local runtime state.
- Avoid moving top-level app folders unless the paths are audited first; several projects still reference absolute or repo-relative locations.

## Maintenance and quality gate

- CI quality gate runs on pull requests and `main`/`master` pushes: `.github/workflows/ci.yml`.
- CI blocks merge flow when `npm run check` or `npm run test` fails.
- Current maintenance plan, dependency status, and next milestone:
  - `docs/roadmap.md`
>>>>>>> Stashed changes
