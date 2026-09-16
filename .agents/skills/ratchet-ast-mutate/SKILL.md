---
name: ratchet-ast-mutate
description: >-
  Guides Tree-sitter AST surgical code mutation for Ratchet instead of full-file
  rewrites. Use when implementing code.mutate.ast_splice, Merge Coordinator
  behavior, symbol targeting, or reviewing agent patches that rewrite whole files.
---

# Ratchet AST Mutation

## Rule

Mutate at symbol boundaries (function/class/method). Never replace an entire healthy file to change one block.

## Preferred RPC

`code.mutate.ast_splice` with:

- `filePath` (workspace-relative)
- `targetSymbol`
- `targetType` (`function` | `class` | `method`)
- `newCodeBlock`

## Implementation checklist

1. Resolve path through CanonicalPathGuard (no `../` escape, reject symlink jailbreaks).
2. Acquire workspace file lock before write; release after.
3. Parse with Tree-sitter TypeScript grammar.
4. Locate target node by symbol name + type.
5. Splice by `startIndex`/`endIndex`.
6. Re-parse; abort if `hasError()`.
7. Return `astNodeHash` / success metadata to the orchestrator.

## Anti-patterns

- Dumping a full regenerated file from the LLM
- String `replace()` on ambiguous substrings
- Editing without a lock when parallel agents can touch the same path
- Skipping syntax re-parse after splice

## When AST cannot locate the symbol

1. Report a structured error (do not silently fall back to full rewrite in v1).
2. Architect may create a new file only if the locked spec allows it.
3. Prefer smallest insert (new export adjacent to related symbols) over rewrite.
