import type { ConceptNode } from "@/content/schema";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Classic Levenshtein — fine at ~46 nodes × short strings. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j] ?? 0;
  }
  return prev[b.length] ?? b.length;
}

function fieldsFor(node: ConceptNode): string[] {
  return [
    node.id,
    node.name,
    node.alias ?? "",
    ...(node.aliases ?? []),
  ]
    .map(normalize)
    .filter(Boolean);
}

function scoreField(query: string, field: string): number {
  if (!field) return 0;
  if (field === query) return 100;
  if (field.startsWith(query)) return 90;
  if (field.includes(query)) return 75;

  // Token-level: "vector db" vs "vector database"
  const qTokens = query.split(" ");
  const fTokens = field.split(" ");
  let tokenHits = 0;
  for (const qt of qTokens) {
    if (
      fTokens.some(
        (ft) =>
          ft === qt ||
          ft.startsWith(qt) ||
          (qt.length >= 3 && editDistance(qt, ft) <= 1),
      )
    ) {
      tokenHits += 1;
    }
  }
  if (tokenHits === qTokens.length && qTokens.length > 0) return 70;
  if (tokenHits > 0) return 40 + tokenHits * 8;

  // Whole-string typo tolerance (e.g. "retreival" → "retrieval…")
  const maxDist =
    query.length <= 4 ? 1 : query.length <= 8 ? 2 : 3;
  if (query.length >= 3) {
    const dist = editDistance(query, field);
    if (dist <= maxDist) return 65 - dist * 8;

    // Compare against each token in the field (aliases are long)
    for (const ft of fTokens) {
      if (ft.length < 3) continue;
      const d = editDistance(query, ft);
      if (d <= maxDist) return 60 - d * 8;
    }
  }

  return 0;
}

function scoreNode(query: string, node: ConceptNode): number {
  let best = 0;
  for (const field of fieldsFor(node)) {
    best = Math.max(best, scoreField(query, field));
  }
  return best;
}

export function searchNodes(
  query: string,
  nodes: ConceptNode[],
): ConceptNode[] {
  const q = normalize(query);
  if (!q) return [];

  return nodes
    .map((node) => ({ node, score: scoreNode(q, node) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.node.name.localeCompare(b.node.name))
    .map((r) => r.node);
}
