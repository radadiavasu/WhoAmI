---
name: ratchet-sandbox-heal
description: >-
  Implements the Ratchet Docker sandbox build and self-heal loop that closes the
  70% problem gap. Use when running container builds, parsing compiler stderr
  into Problem objects, retrying patches, defining heal limits, or wiring
  Lab Tester behavior.
---

# Ratchet Sandbox Heal Loop

## Goal

Prove the last 30%: generate → build in isolation → structure failure → patch → rebuild.

## Vertical slice loop

```text
mutate (AST preferred)
  → sandbox.container.execute_build
  → exit 0? pass
  → else compress stderr → Problem
  → heal patch (max N)
  → rebuild
  → still failing? escalate (stop / ask human)
```

## Problem shape (minimum)

```json
{
  "exitCode": 1,
  "source": "typescript|eslint|runtime",
  "severity": "fatal|warning",
  "filePath": "src/...",
  "lineNodeIndex": 14,
  "compressedStderr": "..."
}
```

## Heal policy (v1 defaults)

| Rule | Value |
|---|---|
| Max heal retries | 3 |
| Compress stderr first | yes (caveman-compress / RTK-style) |
| Prefer AST splice over full-file rewrite | always |
| On max retries | escalate; do not infinite loop |
| Secrets in logs | scrub before model context |

## Sandbox constraints

- Network-restricted container when possible
- Workspace-mounted project root only
- Timeouts on build and test
- No host `npm` as the authority — container is the truth

## Do not confuse with

- Dyad host-process preview repair (reference only)
- Pixel-diff visual QA (post-v1)
- Cloud deploy verification (out of scope)
