# NStep AI Credibility Gap Analysis and Artifact Roadmap

This is the internal roadmap for turning NStep AI into a credible, expert, and useful studio-wide Universal Knowledge Engine. The system architecture is already structurally sound. The remaining gap is documentation coverage, retrieval discipline, telemetry, evaluation, and governance.

The lane-specific truth set now lives under `docs/lanes/` so retrieval can target one lane at a time instead of relying on one oversized omnibus doc.

## Executive Summary

The current direction is correct: a supervisor-worker router, a strong general agent, specialist scaffolds, graph-based orchestration, Postgres-backed session history, federated RAG lanes, and generative UI are all viable building blocks.

The blocker is not model quality. The blocker is that the assistant does not yet have:

- A complete, versioned, lane-scoped documentation corpus.
- Deterministic chunking and provenance rules.
- A retrieval stack that returns the right evidence and can prove it.
- A reusable evaluation harness.
- Telemetry that makes failures visible.

The highest-impact work clusters into four buckets:

1. Lane-ready documentation.
2. Retrieval engineering artifacts.
3. Telemetry and failure visibility.
4. Evaluation harness and content governance.

## Architecture Baseline

The current architecture is a good base for a universal assistant:

- State is persisted through the runtime and session history.
- The graph runner can checkpoint and recover state.
- The general agent can handle broad requests.
- Specialist scaffolds can carry lane-specific behavior.
- Postgres can hold sessions, checkpoints, and retrieved evidence.
- Federated RAG lanes can keep domains isolated.
- Generative UI can expose lane selection, evidence, and next steps.

The credibility control points are:

- Routing correctness.
- Evidence quality and coverage.
- Retrieval precision.
- Grounded response behavior.
- UI transparency.

```mermaid
flowchart TD
  U[User] --> UI[Studio Website Chat UI]
  UI --> S[Server Handler]
  S --> G[Graph Runner\n(state + checkpoints)]
  G --> R[Supervisor Router]
  R --> RET[Lane Retrieval]
  RET --> RR[Optional Reranker]
  RR --> A[Worker Agent]
  A --> OUT[Agent Output\n(response + evidence + UI schema)]
  OUT --> UI2[Generative UI Renderer]
  G --> MEM[(Postgres\nsession + checkpoints)]
  RET --> VDB[(Vector Store / pgvector)]
```

## Lane Content Inventory

Federated RAG only becomes credible when each lane has a minimum viable truth set. The docs should be small, high-quality, operational, and explicit about limitations.

| Lane | MVP docs needed | Main credibility gap |
|---|---|---|
| Studio/Core | Positioning, product map, global scope, memory policy, privacy summary | Users need one canonical explanation of what NStep AI is and how it decides |
| NexusBuild | Build workflow, compatibility rules, budget rubric, glossary, known constraints | Users need reliable hardware guidance and clear handling of live pricing |
| ProvLy | Inventory onboarding, taxonomy, receipts/evidence guidance, export formats, security posture | Users need trustworthy claim-prep guidance and storage clarity |
| NooBS Investing | Learning path, glossary, simulation rules, "not advice" boundary, pitfalls | Users need education-only behavior and strong refusal patterns |
| Neuromove | Routine builder, caregiver workflow, safety limits, "not medical advice" boundary | Users need safe-use guidance and escalation behavior |
| PasoScore | Product intent, event model, scoring logic, integrations, transparency notes | Users need score meaning, interpretation, and fairness clarity |
| MCTB | Consent policy, opt-out flows, lead recovery playbooks, templates, webhook docs | Users need strict compliance, consent, and audit behavior |

## Prioritized Missing Artifacts

### P0

- Canonical product map and terminology.
- Lane-specific truth sets.
- A single source of truth for each capability claim.
- Refusal policy for missing evidence.
- Stable retrieval metadata.

### P1

- Transparency spec for lane selection and evidence display.
- Retrieval traces and chunk IDs in responses.
- Document versioning and deprecation tags.
- Reproducible ingestion pipeline.
- Evaluation datasets for routing and retrieval.

### P2

- Cross-product escalation playbooks.
- Curated reference builds and worked examples.
- More advanced analytics and cohort reporting.

## Retrieval and Data Artifacts

A credible RAG system is mostly data engineering discipline. The required artifacts are:

### Knowledge chunk schema

- `lane`
- `doc_id`
- `doc_title`
- `doc_version`
- `source_type`
- `source_path`
- `section_path`
- `chunk_id`
- `chunk_text`
- `hash`
- `created_at`
- `updated_at`
- `access_level`
- optional product flags and plan metadata

### Chunking rules

- Split by heading where possible.
- Use token-based hard limits and overlap.
- Keep one concept per chunk.
- Prefix title and heading in the chunk text.
- Remove nav chrome, duplicate footers, and boilerplate.
- Normalize formatting before embedding.

### Ingestion pipeline

- Pull from docs, repo markdown, and approved site pages.
- Normalize, chunk, embed, and upsert.
- Attach provenance and stable IDs.
- Record ingestion run IDs and diffs.
- Support both full backfills and incremental updates.

### Retrieval stack

- Always filter by lane.
- Retrieve topK candidates, then rerank to topN.
- Return evidence IDs and provenance to the agent and UI.
- Refuse or qualify answers when evidence is missing.

### Hybrid retrieval

- Pair vector search with keyword search when the corpus is mixed or exact terminology matters.
- In Postgres, keep the vector and text paths aligned so the assistant can recover from sparse or malformed queries.

## Telemetry and Analytics

The system needs enough telemetry to explain what happened when it fails.

### Required events

- `session_started`
- `route_selected`
- `retrieval_executed`
- `response_generated`
- `ui_rendered`
- `cta_clicked`
- `assistant_error`

### Required properties

- Session hash.
- Route and confidence.
- Lane and topK.
- Hit count and average score.
- Chunk IDs.
- Latency by stage.
- Evidence count.
- Refusal count.
- Error stage and retry count.

### Why it matters

- Route accuracy can drift without being obvious.
- Empty retrievals are a common silent failure.
- Latency needs stage-level breakdowns.
- UI usefulness is best measured by downstream actions.

## Evaluation System

The assistant needs both offline and online evaluation.

### Core metrics

- Routing accuracy.
- Retrieval context precision and recall.
- Evidence coverage rate.
- Empty retrieval rate.
- Grounding rate.
- Hallucination rate.
- Refusal appropriateness.
- End-to-end latency.

### Evaluation loop

- Build static datasets for routing and retrieval.
- Run repeatable offline experiments first.
- Measure reranker gains and lane isolation.
- Compare experiment runs over time.
- Use production telemetry to catch drift.

### Prompt template requirements

Responses should make the evidence path visible:

- Which lane was used.
- Which chunks were used.
- What is known.
- What is missing.
- What the user should do next.

## Privacy, Compliance, and Governance

The assistant spans domains that can trigger regulatory and ethical requirements. The goal is not legal advice. The goal is to keep the system honest and safe.

### Cross-cutting governance artifacts

- Data classification policy.
- Retention schedule for session history and traces.
- Export and deletion procedures.
- Prompt and doc change management.
- Canonical owner per lane.
- Deprecation and review cadence.

### Product-specific hot spots

- Neuromove: health-adjacent behavior, child privacy, and "not medical advice" boundaries.
- NooBS Investing: education-only boundaries and non-personalized guidance.
- MCTB: consent, opt-out, quiet hours, and audit logging.

### Content governance requirements

- Every doc used in retrieval should have an owner.
- Every capability claim should map to one canonical doc location.
- Versioning should be explicit.
- Deprecated content should be tagged and phased out.

## Tactical Plan

### Weeks 1 to 2: Foundation

- Define the knowledge schema and governance rules.
- Add telemetry for route, retrieve, generate, and UI.
- Establish the canonical product map.

### Weeks 3 to 5: Lane MVP Corpus

- Write 5 to 15 docs per lane.
- Add limitations and refusal boundaries.
- Ingest the corpus with deterministic chunking.

### Weeks 5 to 7: Federated Retrieval

- Add lane filtering.
- Add reranking.
- Return evidence IDs and provenance in responses.

### Weeks 7 to 9: Evaluation

- Build routing and RAG datasets.
- Run offline experiments.
- Track grounding and empty retrieval rates.

### Weeks 9 to 12: Generative UI and Hardening

- Render evidence cards and lane badges.
- Add safe transparency patterns.
- Tighten compliance, retries, and regression gates.

## Risks and Mitigations

| Risk | What it looks like | Mitigation |
|---|---|---|
| Doc scarcity | Retrieval returns vague or empty results | Write the lane MVP corpus before tuning retrieval |
| Contradictory docs | The assistant answers inconsistently | Enforce canonical claims and deprecation tags |
| Weak routing | The assistant picks the wrong lane | Build labeled routing datasets and test them |
| Silent failures | Users abandon the flow without an obvious error | Add stage-level telemetry and evidence tracing |
| Compliance drift | The assistant crosses a policy line | Keep lane-specific policy docs and refusal rules |

## Tooling Recommendations

- LangGraph for stateful orchestration and checkpoints.
- Postgres and pgvector for integrated storage and retrieval.
- Vercel AI SDK primitives for generation and streaming.
- assistant-ui style generative UI patterns for evidence cards and actions.
- LangSmith-style datasets and experiments for evaluation.
- RAGAS-style metrics for retrieval and faithfulness checks.

## Related Docs

- [NStepOS Architecture](./nstep-os-architecture.md)
- [NStepOS Agent Architecture Map](./nstep-os-agent-architecture-map.md)
- [NStepOS Stage 7 - NexusBuild](./nstep-os-stage-7-nexusbuild.md)
- [NStepOS Stage 8 - ProvLy](./nstep-os-stage-8-provly.md)
- [NStepOS Stage 9 - Governance](./nstep-os-stage-9-governance.md)
