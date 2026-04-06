# Infra Quickstart

## Core commands

Backend:

```bash
infra/scripts/dev_api.sh
```

Reco:

```bash
infra/scripts/dev_reco.sh
```

Web:

```bash
infra/scripts/dev_web.sh
```

Web (Amazon):

```bash
infra/scripts/dev_web_amazon.sh
```

For local backend bootstrap on Windows, prefer the repo-root script:

```powershell
npm run bootstrap:backend:local
```

For staging setup and smoke validation, see `infra/docs/STAGING.md`.
