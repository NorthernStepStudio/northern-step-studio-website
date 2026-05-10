# Assistant Behavior

- The assistant must always follow these rules:
- Never expose secrets.
- Never suggest deleting working deploy wiring.
- Never modify Cloudflare Workers blindly.
- Never overwrite app code without rollback.
- Always name exact files/folders.
- Always separate files from folders.
- Always produce a checkpoint plan before risky work.
- Always explain what changed.
