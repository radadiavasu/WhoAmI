import type { ConceptNode } from "@/content/schema";
import { CHAPTER_ORDER } from "@/lib/graph";
import { resolveChapterId } from "@/lib/chapters";

export type TourNext = {
  targetId: string;
  label: string;
  /** e.g. "Foundations 3/7" */
  progressLabel: string;
  kind: "same_chapter" | "next_chapter" | "wrap" | "done";
};

function childrenOf(
  parentId: string,
  nodes: ConceptNode[],
): ConceptNode[] {
  return nodes.filter((n) => n.parentId === parentId);
}

/**
 * Editorial order inside a chapter: follow authored nextStep while it stays
 * in-chapter, then append leftover leaves (stable by name).
 */
export function chapterTourOrder(
  chapterId: string,
  nodes: ConceptNode[],
  byId: Map<string, ConceptNode>,
): string[] {
  const leaves = childrenOf(chapterId, nodes);
  if (leaves.length === 0) return [];

  const leafIds = new Set(leaves.map((l) => l.id));
  const ordered: string[] = [];
  const seen = new Set<string>();

  const chapter = byId.get(chapterId);
  let cursor =
    chapter?.nextStep.targetId && leafIds.has(chapter.nextStep.targetId)
      ? chapter.nextStep.targetId
      : leaves.slice().sort((a, b) => a.name.localeCompare(b.name))[0]?.id;

  while (cursor && leafIds.has(cursor) && !seen.has(cursor)) {
    ordered.push(cursor);
    seen.add(cursor);
    const next = byId.get(cursor)?.nextStep.targetId;
    cursor = next && leafIds.has(next) && !seen.has(next) ? next : undefined;
  }

  const rest = leaves
    .filter((l) => !seen.has(l.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((l) => l.id);

  return [...ordered, ...rest];
}

export function buildFullTourOrder(
  nodes: ConceptNode[],
  byId: Map<string, ConceptNode>,
): string[] {
  const tour: string[] = [];
  for (const chapterId of CHAPTER_ORDER) {
    tour.push(...chapterTourOrder(chapterId, nodes, byId));
  }
  return tour;
}

export function chapterProgress(
  chapterId: string,
  nodes: ConceptNode[],
  visitedIds: Set<string>,
): { visited: number; total: number; name: string } {
  const leaves = childrenOf(chapterId, nodes);
  const visited = leaves.filter((l) => visitedIds.has(l.id)).length;
  const name = nodes.find((n) => n.id === chapterId)?.name ?? chapterId;
  return { visited, total: leaves.length, name };
}

/**
 * Prefer the hand-authored invitation voice ("See how meaning is stored")
 * over mechanical "Continue — Embedding" labels.
 */
export function invitationLabel(
  fromId: string,
  toId: string,
  kind: TourNext["kind"],
  byId: Map<string, ConceptNode>,
): string {
  const from = byId.get(fromId);
  if (from?.nextStep.targetId === toId && from.nextStep.label.trim()) {
    return from.nextStep.label;
  }

  // Reuse any authored nextStep that already invites people into this leaf.
  let chapterInvite: string | undefined;
  for (const n of byId.values()) {
    if (n.nextStep.targetId !== toId) continue;
    const label = n.nextStep.label.trim();
    if (!label) continue;
    const isChapter = (CHAPTER_ORDER as readonly string[]).includes(n.id);
    if (!isChapter) return label;
    chapterInvite ??= label;
  }
  if (chapterInvite) return chapterInvite;

  const target = byId.get(toId);
  const name = target?.name ?? toId;
  if (kind === "next_chapter") {
    const chapterId = target ? resolveChapterId(target, byId) : "";
    const chapter = byId.get(chapterId);
    return chapter?.name ? `Explore ${chapter.name}` : `Explore ${name}`;
  }
  if (kind === "wrap") {
    return `Still open: ${name}`;
  }
  return `See ${name}`;
}

/**
 * Adaptive next: unread in current chapter first, then later chapters,
 * then wrap to earlier unread. Recalculates after random jumps.
 */
export function getTourNext(
  focusedId: string,
  nodes: ConceptNode[],
  visitedIds: Set<string>,
): TourNext | null {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const focused = byId.get(focusedId);
  if (!focused) return null;

  const fullTour = buildFullTourOrder(nodes, byId);
  if (fullTour.length === 0) return null;

  const unread = fullTour.filter((id) => !visitedIds.has(id));
  // Current focus counts as read for "what's next" even if set just landed
  const unreadExcludingFocus = unread.filter((id) => id !== focusedId);

  if (unreadExcludingFocus.length === 0) {
    // Everything else visited — if focus isn't the last hole, nothing left
    const stillUnread = fullTour.filter((id) => !visitedIds.has(id) && id !== focusedId);
    if (stillUnread.length === 0) return null;
  }

  const chapterId = resolveChapterId(focused, byId);
  const progress = CHAPTER_ORDER.includes(
    chapterId as (typeof CHAPTER_ORDER)[number],
  )
    ? chapterProgress(chapterId, nodes, new Set([...visitedIds, focusedId]))
    : null;

  const progressLabel = progress
    ? `${progress.name} ${Math.min(progress.visited, progress.total)}/${progress.total}`
    : "Map tour";

  const chapterOrder =
    chapterId !== "generative-ai"
      ? chapterTourOrder(chapterId, nodes, byId)
      : [];

  // 1) Same chapter: next unread after current position, else any unread in chapter
  if (chapterOrder.length > 0) {
    const idx = chapterOrder.indexOf(focusedId);
    const after =
      idx >= 0 ? chapterOrder.slice(idx + 1) : chapterOrder;
    const sameChapterNext =
      after.find((id) => !visitedIds.has(id) && id !== focusedId) ??
      chapterOrder.find((id) => !visitedIds.has(id) && id !== focusedId);

    if (sameChapterNext) {
      return {
        targetId: sameChapterNext,
        label: invitationLabel(
          focusedId,
          sameChapterNext,
          "same_chapter",
          byId,
        ),
        progressLabel,
        kind: "same_chapter",
      };
    }
  }

  // 2) Later chapters in spine order
  const startChapterIdx =
    chapterId === "generative-ai"
      ? -1
      : CHAPTER_ORDER.indexOf(chapterId as (typeof CHAPTER_ORDER)[number]);

  for (let i = startChapterIdx + 1; i < CHAPTER_ORDER.length; i++) {
    const cid = CHAPTER_ORDER[i]!;
    const order = chapterTourOrder(cid, nodes, byId);
    const nextId = order.find((id) => !visitedIds.has(id));
    if (nextId) {
      return {
        targetId: nextId,
        label: invitationLabel(focusedId, nextId, "next_chapter", byId),
        progressLabel,
        kind: "next_chapter",
      };
    }
  }

  // 3) Wrap: earlier chapters still unread
  for (let i = 0; i <= startChapterIdx; i++) {
    const cid = CHAPTER_ORDER[i]!;
    const order = chapterTourOrder(cid, nodes, byId);
    const nextId = order.find((id) => !visitedIds.has(id) && id !== focusedId);
    if (nextId) {
      return {
        targetId: nextId,
        label: invitationLabel(focusedId, nextId, "wrap", byId),
        progressLabel,
        kind: "wrap",
      };
    }
  }

  return null;
}
