import type { ConceptNode } from "@/content/schema";

export const CHAPTER_ORDER = [
  "foundations",
  "models",
  "talking-to-models",
  "giving-models-knowledge",
  "building-with-models",
  "trust-and-quality",
] as const;

export type TreeRole = "trunk" | "branch" | "leaf";

export type FlowNode = {
  id: string;
  type: "concept";
  position: { x: number; y: number };
  data: {
    node: ConceptNode;
    role: TreeRole;
    angle: number;
  };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  data?: { kind: "tree" | "neighbor"; weight: number };
};

const ROOT_W = 240;
const ROOT_H = 96;
const CHAPTER_W = 176;
const CHAPTER_H = 76;
const LEAF_W = 158;
const LEAF_H = 62;
/** Minimum center-to-center distance so oval leaves never visually merge. */
const LEAF_GAP = 200;

function offsetFrom(
  origin: { x: number; y: number },
  angleDeg: number,
  radius: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: origin.x + radius * Math.cos(rad),
    y: origin.y + radius * Math.sin(rad),
  };
}

function spreadAnglesLinear(count: number, start: number, end: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(start + end) / 2];
  return Array.from(
    { length: count },
    (_, i) => start + ((end - start) * i) / (count - 1),
  );
}

function separateCenters(
  centers: Map<string, { x: number; y: number }>,
  ids: string[],
  minDist: number,
  iterations = 80,
) {
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = centers.get(ids[i]!)!;
        const b = centers.get(ids[j]!)!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= minDist) continue;
        const push = ((minDist - dist) / dist) * 0.55;
        dx *= push;
        dy *= push;
        a.x -= dx;
        a.y -= dy;
        b.x += dx;
        b.y += dy;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

/**
 * Pack leaves on multiple rings around a branch so chord length >= LEAF_GAP.
 */
function placeLeavesAroundBranch(
  hub: { x: number; y: number; angle: number },
  kids: ConceptNode[],
  centers: Map<string, { x: number; y: number }>,
  angles: Map<string, number>,
) {
  const remaining = [...kids];
  let radius = 270;
  const halfSpan = 48;

  while (remaining.length > 0) {
    const angleStepDeg = (LEAF_GAP / radius) * (180 / Math.PI);
    const maxOnRing = Math.max(
      1,
      Math.floor((2 * halfSpan) / angleStepDeg) + 1,
    );
    const batch = remaining.splice(0, maxOnRing);
    const start = hub.angle - ((batch.length - 1) * angleStepDeg) / 2;
    const end = hub.angle + ((batch.length - 1) * angleStepDeg) / 2;
    const leafAngles = spreadAnglesLinear(batch.length, start, end);

    batch.forEach((kid, i) => {
      const angle = leafAngles[i]!;
      centers.set(kid.id, offsetFrom(hub, angle, radius));
      angles.set(kid.id, angle);
    });

    radius += 120;
  }
}

/**
 * Living canopy: trunk at bottom, chapters fanned out, leaves on spaced multi-rings.
 */
export function buildFlowGraph(nodes: ConceptNode[]): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, ConceptNode[]>();

  for (const node of nodes) {
    if (node.parentId === null) continue;
    const list = children.get(node.parentId) ?? [];
    list.push(node);
    children.set(node.parentId, list);
  }

  const root = nodes.find((n) => n.parentId === null);
  const centers = new Map<string, { x: number; y: number }>();
  const angles = new Map<string, number>();
  const roles = new Map<string, TreeRole>();

  const origin = { x: 1200, y: 1100 };

  if (root) {
    centers.set(root.id, { ...origin });
    angles.set(root.id, 0);
    roles.set(root.id, "trunk");
  }

  const chapters = CHAPTER_ORDER.map((id) => byId.get(id)).filter(
    (n): n is ConceptNode => Boolean(n),
  );

  // Keep limbs in the upper half-plane (never below the trunk)
  const chapterAngles = spreadAnglesLinear(chapters.length, -72, 72);
  const chapterMeta = new Map<
    string,
    { x: number; y: number; angle: number }
  >();

  chapters.forEach((chapter, i) => {
    const angle = chapterAngles[i]!;
    const radius = 480 + (i % 2 === 0 ? 70 : 10) + Math.abs(angle) * 1.8;
    const center = offsetFrom(origin, angle, radius);
    chapterMeta.set(chapter.id, { ...center, angle });
    centers.set(chapter.id, center);
    angles.set(chapter.id, angle);
    roles.set(chapter.id, "branch");
  });

  const leafIds: string[] = [];

  for (const chapter of chapters) {
    const kids = children.get(chapter.id) ?? [];
    const hub = chapterMeta.get(chapter.id);
    if (!hub) continue;

    placeLeavesAroundBranch(hub, kids, centers, angles);
    for (const kid of kids) {
      roles.set(kid.id, "leaf");
      leafIds.push(kid.id);
    }
  }

  // Hard separation pass — leaves first, then against branches
  separateCenters(centers, leafIds, LEAF_GAP, 100);
  separateCenters(
    centers,
    [...chapters.map((c) => c.id), ...leafIds],
    190,
    60,
  );

  for (const id of leafIds) {
    const c = centers.get(id)!;
    if (c.y > origin.y - 160) c.y = origin.y - 160;
  }

  // Final leaf-only polish after y clamp
  separateCenters(centers, leafIds, LEAF_GAP, 40);

  const sizeFor = (role: TreeRole) => {
    if (role === "trunk") return { w: ROOT_W, h: ROOT_H };
    if (role === "branch") return { w: CHAPTER_W, h: CHAPTER_H };
    return { w: LEAF_W, h: LEAF_H };
  };

  const flowNodes: FlowNode[] = nodes.map((node) => {
    const role = roles.get(node.id) ?? "leaf";
    const center = centers.get(node.id) ?? { x: 40, y: 40 };
    const { w, h } = sizeFor(role);
    return {
      id: node.id,
      type: "concept",
      position: { x: center.x - w / 2, y: center.y - h / 2 },
      data: {
        node,
        role,
        angle: angles.get(node.id) ?? 0,
      },
    };
  });

  const edges: FlowEdge[] = [];
  for (const node of nodes) {
    if (node.parentId && byId.has(node.parentId)) {
      const parentRole = roles.get(node.parentId);
      edges.push({
        id: `tree-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        data: {
          kind: "tree",
          weight: parentRole === "trunk" ? 6 : 2.6,
        },
      });
    }
  }

  for (const node of nodes) {
    for (const neighbor of node.neighbors) {
      if (!byId.has(neighbor.id)) continue;
      if (
        node.parentId === neighbor.id ||
        byId.get(neighbor.id)?.parentId === node.id
      ) {
        continue;
      }
      const id = `neighbor-${node.id}-${neighbor.id}`;
      const reverse = `neighbor-${neighbor.id}-${node.id}`;
      if (edges.some((e) => e.id === id || e.id === reverse)) continue;
      edges.push({
        id,
        source: node.id,
        target: neighbor.id,
        data: { kind: "neighbor", weight: 1.2 },
      });
    }
  }

  return { nodes: flowNodes, edges };
}
