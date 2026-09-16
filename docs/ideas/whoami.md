# whoami

## Problem Statement

How might we help anyone — beginner or professional — place a confusing AI concept in the field in under a minute, then leave with one clear next step?

## Brand

**Name:** whoami / Who Am I  
**Brand lockup idea:** In “Who **A**m **I**”, the letters **A** and **I** are the visual accent — the product is literally asking *who am I (in AI)?* while spelling **AI** inside the name.

That is a durable uniqueness signal: the brand *is* the product job (find where you are), not a generic “AI map” label.

## Recommended Direction

Build a **browse-first, zoomable field map** focused on orientation, not courses.

Users arrive with a term they’ve heard (“transformers”, “RAG”, “agents”). The map flies them to that node, dims the rest of the tree, and shows a short **orientation card**: where it sits, what it is in one breath, what it is / isn’t, 2–4 neighbors, and exactly one next step.

**Progressive disclosure** serves everyone with one product: beginners stay on the surface; professionals open a second layer (aliases, related techniques, what’s changing). Same layout for every node.

**First ship slice:** Generative / LLM world (hottest confusion). Classic ML → DL becomes a “roots” branch later.

**Tone:** friendly teacher with precise official names.

**Motion (MVP):** map focus, zoom, and neighbor highlight only — no per-node explain-animations yet.

Contribution / editing is **out of scope** for now (browse only).

## Key Assumptions to Validate

- [ ] People will use “I heard this term” search and stay for orientation — not demand a full course. *(Test: put a 30–40 node prototype in front of 3 confused people; watch whether they leave oriented.)*
- [ ] A small curated tree (~30–40 strong nodes) feels more useful than a huge sparse tree. *(Test: compare “dense useful slice” vs “broad empty map” reactions.)*
- [ ] One node card layout works from “Neural Network” to “Attention” via progressive disclosure. *(Test: write 5 sample cards at different depths; check comprehension time < ~30s.)*
- [ ] Map motion alone feels unique enough without explain-animations. *(Test: click 3 nodes; ask “did placement feel clear?”)*
- [ ] Highlighting **AI** inside Who Am I reads as clever, not gimmicky. *(Test: show the lockup to 3 people; ask what the product is about.)*

## MVP Scope

**In**
- Interactive tree for **Generative / LLM** slice only
- ~30–40 hand-authored nodes with the standard card layout
- Search / jump-to-concept (“I’m confused about…”)
- Focus + zoom + neighbor highlight on select
- Desktop + mobile readable
- Static content (JSON/MD) — easy for the solo author to add a node later
- Brand-first UI: **Who Am I** with **AI** accent as hero-level signal (not just nav text)

**Node card (always visible)**
1. Name (+ everyday alias if useful)
2. One breath (1–2 sentences)
3. Place in the tree (parent → this)
4. Does / Doesn’t (2 bullets)
5. Neighbors (2–4: prereq · sibling · next · used-in)
6. Exactly one next step

**Behind one click:** short analogy + one real-world example + level tag (Intro / Core / Frontier)  
**Behind second layer (pros):** aliases / year / related techniques / optional “what’s changing” line

## Not Doing (and Why)

- **Cover all of AI** — forever work; kills focus. Ship one dense slice.
- **User edit / contribute** — browse-first; authorship is yours until the model is proven.
- **Courses, quizzes, accounts** — orientation product, not LMS.
- **Per-node explain-animations** — expensive; validate map + cards first.
- **Personalized learning paths** — nice later; search + neighbors is enough for MVP.
- **Heavy 3D / game engine** — overbuilt for solo; 2D interactive map wins.
- **Agent backends (LangChain etc.)** — not needed for a curated browse map.

## Open Questions (deferred)

- Wordmark treatment details (color of A+I, type) — visual design phase
- Exact neighbor links per node — filled while authoring content

**Resolved in design spec:** tree chapters, node schema, routes, stack (Next.js + React Flow + static JSON), no backend MVP. See `docs/superpowers/specs/2026-09-13-whoami-design.md`.

## Locked Decisions

| Decision | Choice |
|---|---|
| Name | **whoami** / Who Am I (AI accent in Am I) |
| Audience | Everyone via progressive disclosure (one UX) |
| Success | Confusion → Placement in ~3 minutes |
| Mode | Browse only |
| Constraint | Solo side project → possible long-term product |
| First slice | Generative / LLM world |
| Tone | Friendly teacher + precise names |
| Animation | Map motion only (MVP) |
