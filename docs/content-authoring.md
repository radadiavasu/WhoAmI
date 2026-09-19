# Adding a concept node

MVP content lives in one file. No backend or migrations.

## Steps

1. Open `src/content/nodes.json`.
2. Copy an existing leaf object near its chapter (same `parentId`).
3. Set a unique kebab-case `id` (also becomes the URL `/c/[id]`).
4. Fill required fields: `name`, `parentId`, `level`, `oneBreath`, `does` (1–2), `doesNot` (1–2), `neighbors` (0–4), `nextStep`.
5. Optional layer-2/3 fields: `alias`, `analogy`, `example`, `aliases`, `year`, `relatedTechniques`, `changing`.
6. Point neighbors / `nextStep.targetId` only at ids that already exist (or add those nodes too).
7. Run `npm test` — validation catches bad ids and broken links.

The map layout is computed from `parentId`; you do not edit positions by hand.

## Plain-language bar

Write for a smart person who is new to the term — not for an AI engineer.

- **oneBreath:** one idea, ~15–30 words. Everyday verbs. Keep the term name; explain it like a sharp friend.
- **does / doesNot:** short bullets. Prefer “help / stop / show / pick” over “surface / steer / underpin / route.”
- Avoid stacked clauses and insider shorthand (`happy-path QA`, `app-level`, `know-how packs`) unless you unpack them.
- Accuracy stays; jargon goes only when the name itself is the jargon (then decode it once).

Good: “How much text the AI can see at once in this chat — like a limited desk size.”  
Too dense: “Standing instructions that shape the assistant’s role, tone, and rules across the chat — usually hidden from the end user.”

## Do not regenerate from script

`scripts/gen-nodes.cjs` is **stale** and will refuse to run. It must not overwrite `nodes.json`.

