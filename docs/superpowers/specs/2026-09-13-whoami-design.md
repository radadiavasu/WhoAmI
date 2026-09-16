# whoami — Product Design Spec

**Date:** 2026-09-13  
**Status:** Approved  
**Approved:** 2026-09-13  
**Plan:** `docs/superpowers/plans/2026-09-13-whoami.md`

---

## 1. Problem & success

**Problem:** People hear AI terms constantly and cannot place them — what sits where, what connects, what to look at next.

**Product job:** Confusion → Placement in ~3 minutes.

**Success (one session):** User can point at a node and state (1) where it sits, (2) what it is in one breath, (3) why it matters / boundaries, (4) what connects, (5) one next step.

**Non-goals (MVP):** Cover all of AI, courses, quizzes, accounts, user contributions, personalized paths, 3D, per-node explain-animations, backend APIs.

---

## 2. Brand

- **Name:** whoami / Who Am I  
- **Lockup:** In “Who **A**m **I**”, letters **A** and **I** are the accent — *who am I (in AI)?*  
- Brand is a **hero-level** signal on first load, not only nav chrome.  
- After engagement, brand may compact into a top bar while the map stays dominant.

---

## 3. Audience & tone

- **Audience:** Beginners → professionals via **one UX** and progressive disclosure.  
- **Tone:** Friendly teacher + precise official names (e.g. keep `Transformer`, `RAG`).

---

## 4. Information architecture

### 4.1 Site map

- Home / map — `/`
- Focused concept (same map + focus) — `/c/[id]`

No other MVP routes.

### 4.2 Navigation model

- **Primary:** The 2D map (pan, zoom, click nodes).  
- **Utility:** Search (“I’m confused about…”).  
- **Contextual:** Orientation card (neighbors, next step, breadcrumb).  
- **Mobile:** Same IA; card as bottom sheet.

### 4.3 Content hierarchy (map view)

1. Brand + search  
2. Map (dominant visual plane)  
3. Orientation card on selection  
4. Layer 2 / Layer 3 disclosure inside the card  

### 4.4 First-slice tree (Generative / LLM) — ~36 nodes

Story spine (left → right chapters):

```text
Generative AI
├── 1. Foundations
│   ├── Token
│   ├── Embedding
│   ├── Context window
│   ├── Probability / next-token
│   └── Temperature
├── 2. Models
│   ├── LLM
│   ├── Transformer
│   ├── Attention
│   ├── Pretraining
│   ├── Fine-tuning
│   ├── Instruction tuning
│   └── Alignment (RLHF / preference)
├── 3. Talking to models
│   ├── Prompt
│   ├── System vs user message
│   ├── Few-shot
│   ├── Chain-of-thought
│   ├── Structured output
│   └── Prompt injection
├── 4. Giving models knowledge
│   ├── Hallucination
│   ├── RAG
│   ├── Long context vs RAG
│   ├── Chunking
│   ├── Vector database
│   ├── Retrieval
│   └── Reranking
├── 5. Building with models
│   ├── Tool use / function calling
│   ├── Agent
│   ├── Agent harness
│   ├── Skill
│   ├── MCP
│   ├── Human-in-the-loop
│   ├── Multi-agent
│   ├── Memory
│   └── Orchestration
└── 6. Trust & quality
    ├── Evaluation
    ├── Observability / tracing
    ├── Guardrails
    ├── Latency & cost
    └── Safety / misuse
```

**Deferred branches:** classical ML, CNNs, diffusion/image, speech — later “roots / siblings.”

---

## 5. Node schema

Static content; one object per concept.

| Field | Required | Layer | Notes |
|---|---|---|---|
| `id` | yes | always | Stable slug |
| `name` | yes | always | Official name |
| `alias` | no | always | Everyday name |
| `parentId` | yes* | always | Chapter/parent; `null` only for root |
| `level` | yes | always | `intro` \| `core` \| `frontier` |
| `oneBreath` | yes | always | 1–2 sentences |
| `does` | yes | always | 1–2 bullets |
| `doesNot` | yes | always | 1–2 bullets |
| `neighbors` | yes | always | 2–4 `{ id, relation }` — `prereq` \| `sibling` \| `next` \| `usedIn` |
| `nextStep` | yes | always | One `{ kind, targetId?, label }` — `goDeeper` \| `seeRelated` \| `prereqFirst` |
| `analogy` | no | layer 2 | Short analogy |
| `example` | no | layer 2 | One real-world example |
| `aliases` | no | layer 3 | Other names |
| `year` | no | layer 3 | Optional |
| `relatedTechniques` | no | layer 3 | Related ids |
| `changing` | no | layer 3 | One line if fast-moving |

**Graph rules**

- Chapters (e.g. `foundations`, `models`) are nodes too — same schema; `oneBreath` describes the chapter.  
- Tree edges from `parentId`.  
- Cross-links from `neighbors` (concepts; chapters may use fewer).  
- Adding a concept = one JSON object under a chapter; no app rewrite.

**Example shape**

```json
{
  "id": "rag",
  "name": "RAG",
  "alias": "Retrieval-Augmented Generation",
  "parentId": "giving-models-knowledge",
  "level": "core",
  "oneBreath": "Instead of only using what the model memorized, it looks up relevant text and then answers.",
  "does": ["Ground answers in your docs or the web", "Reduce some hallucinations"],
  "doesNot": ["Not the same as fine-tuning", "Not a guarantee of truth"],
  "neighbors": [
    { "id": "hallucination", "relation": "prereq" },
    { "id": "vector-database", "relation": "usedIn" },
    { "id": "fine-tuning", "relation": "sibling" },
    { "id": "agent", "relation": "next" }
  ],
  "nextStep": { "kind": "goDeeper", "targetId": "retrieval", "label": "See how retrieval works" },
  "analogy": "An open-book exam instead of closed-book.",
  "example": "A company chatbot that answers from the internal wiki."
}
```

---

## 6. User flows

### 6.1 Primary — Confusion → Placement

1. Land on `/` → brand + Generative slice overview.  
2. Search or select a known term.  
3. Map flies to node; dims others; highlights neighbors.  
4. Orientation card shows place, one breath, does/doesn’t, neighbors, one next step.  
5. Optional Layer 2 / Layer 3 expand.  
6. Neighbor or next step moves focus; URL → `/c/[id]`.  
7. User leaves oriented.

### 6.2 Secondary — Browse

1. Pan/zoom map.  
2. Click node → same focus + card.  
3. Breadcrumb: `Generative AI → Chapter → Concept`.

### 6.3 Mobile

Same flows; card as bottom sheet; search remains top-reachable.

---

## 7. Interaction & motion (MVP)

- Camera ease to selected node  
- Dim non-focused nodes  
- Highlight neighbor edges/nodes  
- Card enter/exit  

**Not in MVP:** per-concept explain animations, 3D/Three.js.

---

## 8. Technical architecture

### 8.1 Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) | Solo-friendly, static export capable, matches installed skills |
| Map | React Flow (`@xyflow/react`) | 2D nodes/edges, pan/zoom, focus |
| Motion | CSS + light Motion/Framer as needed | Map focus only |
| Content | Static JSON (or MD→JSON at build) | Easy authoring; no backend |
| Hosting | Static / Vercel-style | Cheap, simple |

### 8.2 No backend (MVP)

Client loads curated content. Search is client-side over ~36 nodes. Shareable URLs are static routes.

**Add a backend later when:** accounts, contributions, server AI, or heavy analytics are required.

### 8.3 Logical modules

| Module | Responsibility |
|---|---|
| `content` | Node JSON, chapters, validation of ids/links |
| `map` | React Flow graph build, layout, focus camera |
| `search` | Fuzzy/substring match → focus node |
| `card` | Orientation panel / bottom sheet + disclosure |
| `brand` | Who Am I lockup (AI accent) |

### 8.4 Data flow

```text
static JSON → content loader → map graph + search index
user select/search → focus state + URL /c/[id] → card reads node by id
```

---

## 9. Layout sketch

```text
┌─────────────────────────────────────────────┐
│  Who Am I   [ search: I’m confused about… ] │
├─────────────────────────────────────────────┤
│              2D MAP (full-bleed)            │
│         ┌─────────────────────┐             │
│         │  Orientation card   │             │
│         └─────────────────────┘             │
└─────────────────────────────────────────────┘
```

Map is the visual plane. Card is the only “panel” interaction container.

---

## 10. Acceptance criteria (MVP)

- [x] All first-slice nodes render on a pan/zoomable 2D map  
- [x] Search jumps to a node with focus + neighbor highlight  
- [x] Selecting a node shows the required card fields in under ~30s readable scan  
- [x] Layer 2/3 expand without leaving the map  
- [x] `/c/[id]` deep-links restore focus  
- [x] Mobile: bottom sheet card; usable search  
- [x] Brand lockup with AI accent visible on first load  
- [x] Adding a node requires only content file edits (documented)  
- [x] No auth, no API server, no Three.js  

---

## 11. Risks & assumptions

| Assumption | If wrong |
|---|---|
| People want orientation, not a course | Soften card; avoid curriculum tone |
| ~36 dense nodes beat a sparse “all AI” map | Resist scope creep |
| Map motion is unique enough | Polish focus/dim; still skip 3D |
| AI-in-Who-Am-I lockup reads as clever | Tone down accent if gimmicky in tests |

---

## 12. Out of scope (explicit)

Cover-all-AI, contrib/edit, LMS features, personalized paths, agent backends, Three.js, per-node explain videos/animations, user accounts.

---

## 13. Next step after approval

Create an implementation plan (`writing-plans`) broken into incremental tasks: scaffold → content schema → map shell → search/focus → card → content fill → polish.
