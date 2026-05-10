# Recovery Documentation

Recovery plans are generated automatically by the governance gate and stored in:

- `studioos/recovery/`

Recovery plans are non-destructive by default and must:

- identify affected branch and commit
- include a safe recovery sequence
- reference the exact snapshot artifact used for rollback analysis
- require reviewed pull-request-based rollback execution
