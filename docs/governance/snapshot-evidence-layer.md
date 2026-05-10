# Snapshot & Evidence Layer

Snapshot artifacts are generated before verdict:

- `studioos/snapshots/<run-id>.snapshot.json`

Snapshot fields include:

- git metadata (branch, commit, dirty state)
- changed file set
- risk matches
- file hash evidence (bounded set)
