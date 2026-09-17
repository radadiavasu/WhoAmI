# GenAI slice — content gap list

Current tree: **46 nodes** (1 root + 6 chapters + 39 concepts). The original design-spec spine is fully filled. Next growth should close **real confusion gaps**, not invent a second map.

Target for Phase 1: **~60–70 nodes** (~15–25 new leaves). Prefer concepts people hear in product/news and cannot place.

## How to use

1. Pick from **Priority A** first (highest confusion × fits existing chapters).
2. Author in `src/content/nodes.json` per `docs/content-authoring.md`.
3. Wire 2–4 `neighbors` + one `nextStep` into existing nodes.
4. `npm test` before shipping.

Skip anything that needs a new root (classic ML, diffusion-as-domain, speech-as-domain).

---

## Priority A — add next (~15)

| Proposed id | Name | Chapter | Why it belongs |
|---|---|---|---|
| `top-p` | Top-p / nucleus sampling | foundations | Pair with Temperature; people hear both, confuse both |
| `tokenizer` | Tokenizer | foundations | “Why is my context count weird?” |
| `moe` | Mixture of Experts (MoE) | models | Common in model cards; opaque to beginners |
| `multimodal` | Multimodal model | models | Vision/audio LLMs — where does “GPT can see” sit? |
| `reasoning-model` | Reasoning model | models | o1-style / “thinking” models vs normal chat |
| `quantization` | Quantization | models | Local/open models; GGUF / 4-bit talk |
| `knowledge-cutoff` | Knowledge cutoff | giving-models-knowledge | Explains “why doesn’t it know today?” before RAG |
| `citations` | Citations / grounding | giving-models-knowledge | Next step after RAG for trust |
| `hybrid-search` | Hybrid search | giving-models-knowledge | Keyword + vector; frequent RAG follow-up |
| `workflows-vs-agents` | Workflows vs agents | building-with-models | Hottest builder confusion right now |
| `streaming` | Streaming | building-with-models | UX/API reality; links latency & cost |
| `jailbreak` | Jailbreak | talking-to-models | Sibling of prompt injection; different intent |
| `system-prompt` | System prompt | talking-to-models | Sharper than system-vs-user for search hits |
| `red-teaming` | Red teaming | trust-and-quality | How safety gets tested |
| `pii-privacy` | PII & privacy | trust-and-quality | Enterprise “can we paste this?” fear |

## Priority B — after A (~10)

| Proposed id | Name | Chapter | Notes |
|---|---|---|---|
| `kv-cache` | KV cache | foundations | Frontier; pairs with latency & cost |
| `distillation` | Distillation | models | Small model from big model |
| `base-vs-instruct` | Base vs instruct model | models | Clarifies fine-tuning / instruction tuning |
| `graph-rag` | GraphRAG | giving-models-knowledge | Frontier; only if RAG neighbors stay clear |
| `eval-harness` | Eval harness | trust-and-quality | Links evaluation ↔ observability |
| `bias` | Bias | trust-and-quality | Keep one-breath honest, not a lecture |
| `tool-calling-loop` | Tool-calling loop | building-with-models | Deepens tool-use without new chapter |
| `context-stuffing` | Context stuffing | giving-models-knowledge | Anti-pattern vs RAG / long context |
| `prompt-template` | Prompt template | talking-to-models | Product/builder term |
| `rate-limits` | Rate limits | trust-and-quality | Sibling of latency & cost |

## Explicitly not now

- Classical ML / DL roots, CNNs, diffusion-as-whole-branch, speech-as-whole-branch  
- Framework brands as first-class nodes (LangChain, LlamaIndex) — optional aliases later  
- Company/model brand nodes (GPT-5, Claude, Gemini) — too ephemeral for the spine  
- Accounts, courses, quizzes

## Suggested authoring order

1. `top-p` + `tokenizer` (foundations denser)  
2. `reasoning-model` + `multimodal` + `moe` (models news literacy)  
3. `workflows-vs-agents` + `streaming` (builders)  
4. `knowledge-cutoff` + `citations` + `hybrid-search` (RAG story complete)  
5. `jailbreak` + `system-prompt` + `red-teaming` + `pii-privacy` (trust/talk)

Stop when the tree still feels scannable in one overview zoom. If leaves collide or chapters look crowded, pause and improve neighbors/next-steps instead of adding more.
