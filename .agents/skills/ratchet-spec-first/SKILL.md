---
name: ratchet-spec-first
description: >-
  Enforces Ratchet Spec-First gate before code mutation. Use when turning user
  prompts into PRDs, classifying task complexity, running gap analysis, locking
  workspace specifications, or when an agent is about to write files without an
  approved spec.
---

# Ratchet Spec-First Gate

## Rule

No side-effect code generation until a workspace specification is classified and either locked or explicitly gap-halted.

## Workflow

1. **Decompose** user intent into functional constraints (entities, APIs, auth, UX flows).
2. **Classify complexity**
   - `low` — presentation/styling only → lint optional; sandbox optional
   - `medium` — API + simple tables → compile required
   - `high` — migrations, multi-tenant, webhooks, RLS → full lab + heal loop
3. **Gap analysis** — halt if missing: auth boundaries, data ownership, error contracts, or deployment assumptions.
4. **Lock** — set `isLocked=true` only when gaps are empty or user accepted mitigations.
5. **Hand off** — pass only the locked slice into coding agents (not the raw chat history dump).

## Output template

```markdown
## Spec Gate
- Complexity: low | medium | high
- Locked: yes | no
- Gaps:
  - [domain]: [missing] → [mitigation]
- Allowed mutations: [files/symbols]
- Acceptance checks: [build/test commands]
```

## Invariants

- Mid-run requirement changes re-open the gate and freeze mutators.
- Coding agents receive bounded context (spec + target symbols), not whole-repo dumps.
- Security-sensitive domains (payments, auth, PII) default to `high` until proven otherwise.
