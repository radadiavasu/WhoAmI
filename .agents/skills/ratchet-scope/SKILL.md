---
name: ratchet-scope
description: >-
  Freezes Ratchet MVP product decisions and blocks out-of-scope work. Use when
  planning Ratchet, choosing Electron vs CLI vs PaaS, picking the generated app
  stack, defining autonomy policy, drafting milestones, or when a request would
  expand beyond the vertical slice (Pulumi, multi-cloud, 7-agent swarm, pixel QA).
---

# Ratchet Scope Freeze

## Goal

Keep Ratchet buildable. Vision docs are reference; `RATCHET_MVP_DECISION.md` is the execution fence.

## Locked decisions (LOCKED 2026-09-05 — change only with explicit user approval)

| Decision | v1 (locked) |
|---|---|
| Surface | Local CLI + Docker lab (no Electron packaging yet) |
| Generated stack | Next.js + TypeScript + SQLite |
| Control plane | SQLite + Drizzle |
| Orchestration | LangGraph (Python) talking to a TypeScript harness via JSON-RPC |
| Autonomy | Spec gaps and destructive ops interrupt/ask; build/heal auto-retries max 3, then escalate |
| First proof | Spec → mutate → Docker build → structured Problem → heal ≤3 → pass/fail |

## Explicitly out of scope for v1

- Electron Forge / desktop packaging
- Pulumi / multi-cloud provisioners
- Full 7-agent swarm (use 2–3 roles max in the slice)
- LanceDB / vector indexer
- Langfuse / LangSmith as hard dependencies
- Playwright pixel-diff visual QA
- OmniRoute production gateway
- n8n, GitLab, Qdrant, Postgres control plane, AWS SDK skills

## Agent behavior

1. Before implementing a feature, check it against the table above and `ratchet/docs/RATCHET_MVP_DECISION.md`.
2. If the request is out of scope, say so in one sentence and propose the in-scope alternative.
3. Prefer vertical-slice progress over architecture chapters.
4. When drafting plans, end with acceptance checks the sandbox can prove.
5. Next build target: Sprint 2 / M2 orchestrator (see `SPRINT.md`). M1 harness is complete.

## Related docs

- `ratchet/docs/RATCHET_MVP_DECISION.md` — **LOCKED execution source of truth**
- `ratchet/docs/SPRINT.md` — sprint board
- `ratchet/docs/ratchet_orchestrator_architecture.md` — vision
- `ratchet/docs/ratchet_vs_dyad_ecosystem_gaps.md` — Dyad gaps
- `ratchet/docs/ratchet_rpc_payload_contracts.md` — RPC sketches
- `ratchet/docs/RATCHET_SKILLS.md` — installed skills inventory
