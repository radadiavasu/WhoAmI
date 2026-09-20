# GenAI slice — content gap list

Current tree: **63 nodes** (1 root + 6 chapters + 56 concepts). Priority A filled; **two Priority B** leaves authored (`base-vs-instruct`, `bias`).

Target band for Phase 1: **~60–70 nodes** — we are inside it. Prefer quality + neighbor wiring over more leaves.

## How to use

1. Pick from **Priority B** only if overview zoom still feels scannable.
2. Author in `src/content/nodes.json` per `docs/content-authoring.md`.
3. Wire 2–4 `neighbors` + one `nextStep` into existing nodes.
4. `npm test` before shipping.

Skip anything that needs a new root (classic ML, diffusion-as-domain, speech-as-domain).

---

## Priority A — done (15)

| id | Name | Chapter |
|---|---|---|
| `tokenizer` | Tokenizer | foundations |
| `top-p` | Top-p | foundations |
| `moe` | Mixture of Experts | models |
| `multimodal` | Multimodal model | models |
| `reasoning-model` | Reasoning model | models |
| `quantization` | Quantization | models |
| `system-prompt` | System prompt | talking-to-models |
| `jailbreak` | Jailbreak | talking-to-models |
| `knowledge-cutoff` | Knowledge cutoff | giving-models-knowledge |
| `citations` | Citations | giving-models-knowledge |
| `hybrid-search` | Hybrid search | giving-models-knowledge |
| `workflows-vs-agents` | Workflows vs agents | building-with-models |
| `streaming` | Streaming | building-with-models |
| `red-teaming` | Red teaming | trust-and-quality |
| `pii-privacy` | PII and privacy | trust-and-quality |

## Priority B — shipped (2)

| id | Name | Chapter |
|---|---|---|
| `base-vs-instruct` | Base vs instruct model | models |
| `bias` | Bias | trust-and-quality |

## Priority B — still optional

| Proposed id | Name | Chapter | Notes |
|---|---|---|---|
| `kv-cache` | KV cache | foundations | Frontier; pairs with latency & cost |
| `distillation` | Distillation | models | Small model from big model |
| `graph-rag` | GraphRAG | giving-models-knowledge | Frontier; only if RAG neighbors stay clear |
| `eval-harness` | Eval harness | trust-and-quality | Links evaluation ↔ observability |
| `tool-calling-loop` | Tool-calling loop | building-with-models | Deepens tool-use without new chapter |
| `context-stuffing` | Context stuffing | giving-models-knowledge | Anti-pattern vs RAG / long context |
| `prompt-template` | Prompt template | talking-to-models | Product/builder term |
| `rate-limits` | Rate limits | trust-and-quality | Sibling of latency & cost |

## Explicitly not now

- Diffusion-as-whole-branch, speech-as-whole-branch
- Framework brands as first-class nodes (LangChain, LlamaIndex) — optional aliases later  
- Company/model brand nodes (GPT-5, Claude, Gemini) — too ephemeral for the spine  
- Accounts, courses, quizzes

## Side roots (shipped for underground sketch)

Thin orientation forks off the AI spine — not new GenAI canopy chapters:

| id | Name | Parent |
|---|---|---|
| `cnn` | CNN | deep-learning |
| `rnn` | RNN | neural-network |
| `reinforcement-learning` | Reinforcement learning | machine-learning |

Do not densify these into full domains yet.

## Pause rule

If leaves collide or chapters look crowded at overview zoom, stop adding and improve neighbors / next-steps / search aliases instead.
