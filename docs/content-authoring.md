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
