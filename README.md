# Who Am I

Place yourself in AI — an interactive map of Generative AI concepts.

**Live:** [who-am-i-ebon.vercel.app](https://who-am-i-ebon.vercel.app/)

## What it does

You arrive confused about a term (“RAG”, “agents”, “transformers”). Search or click the tree, read a short orientation card (where it sits, what it does / doesn’t, neighbors, one next step), and leave clearer.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test   # content schema + layout + search
npm run build
```

## Content

Edit `src/content/nodes.json` by hand. See `docs/content-authoring.md`.

Do **not** run `scripts/gen-nodes.cjs` — it is stale and will refuse to overwrite content.

## Stack

Next.js · React Flow · Zod · Tailwind · Vitest · static JSON content (no auth / API).
