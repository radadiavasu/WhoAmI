import type { ConceptNode } from "@/content/schema";

export const CHAPTER_ORDER = [
  "foundations",
  "models",
  "talking-to-models",
  "giving-models-knowledge",
  "building-with-models",
  "trust-and-quality",
] as const;

/** Canopy join — chapters grow above; AI spine grows below. */
export const CANOPY_TRUNK_ID = "generative-ai";

export type TreeRole = "trunk" | "branch" | "leaf" | "root";

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
  data?: { kind: "tree" | "neighbor" | "root"; weight: number };
};

const ROOT_W = 268;
const ROOT_H = 120;
const CHAPTER_W = 176;
const CHAPTER_H = 76;
const LEAF_W = 196;
const LEAF_H = 76;
/** Minimum center-to-center distance so oval leaves never visually merge. */
const LEAF_GAP = 268;
/** Keep chapter hubs apart so neighboring canopies don't tangle. */
const CHAPTER_GAP = 420;
const LEAF_CHAPTER_GAP = 250;
/** Vertical step between root knots on the tap. */
const ROOT_SPINE_STEP = 210;
/** Space reserved under the mound for the meadow / soil lip. */
export const FIELD_BAND_GAP = 280;
/** Flow-space origin — Generative AI mound sits here on the field line. */
export const CANOPY_ORIGIN = { x: 1600, y: 1400 } as const;

/**
 * Taproot under the mound — gentle organic sway on the main spine.
 * Side forks (CNN, RNN, RL) get placed after the spine walk.
 */
const ROOT_FAN = [
  { dx: 0, dy: 0.9 }, // llm
  { dx: -0.28, dy: 1.85 }, // transformer
  { dx: 0.22, dy: 2.8 }, // neural network
  { dx: -0.18, dy: 3.75 }, // deep learning
  { dx: 0.14, dy: 4.7 }, // machine learning
  { dx: 0, dy: 5.65 }, // artificial intelligence
] as const;

/** Horizontal sway scale for the main spine (not side forks). */
const ROOT_FAN_RADIUS = 200;
/** How far side-root arms reach left/right of their parent. */
const SIDE_ROOT_REACH = 520;

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
 * Narrower fan + farther rings = less bleed into neighboring chapters.
 */
function placeLeavesAroundBranch(
  hub: { x: number; y: number; angle: number },
  kids: ConceptNode[],
  centers: Map<string, { x: number; y: number }>,
  angles: Map<string, number>,
) {
  const remaining = [...kids];
  let radius = 360;
  const halfSpan = 38;
  const ringStep = 168;

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

    radius += ringStep;
  }
}

/**
 * Living tree: GenAI canopy grows up; deeper AI roots hang below the trunk.
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

  const canopy =
    byId.get(CANOPY_TRUNK_ID) ?? nodes.find((n) => n.parentId === null);
  const centers = new Map<string, { x: number; y: number }>();
  const angles = new Map<string, number>();
  const roles = new Map<string, TreeRole>();

  const origin = { ...CANOPY_ORIGIN };

  if (canopy) {
    centers.set(canopy.id, { ...origin });
    angles.set(canopy.id, 0);
    roles.set(canopy.id, "trunk");

    // Roots fan wide under the field — sketch: thick L/R coverage, not a column.
    let child: ConceptNode = canopy;
    let depth = 1;
    while (child.parentId) {
      const parent = byId.get(child.parentId);
      if (!parent) break;
      const fan =
        ROOT_FAN[depth - 1] ?? {
          dx: depth % 2 === 0 ? -1 : 1,
          dy: 1 + depth * 0.85,
        };
      centers.set(parent.id, {
        x: origin.x + fan.dx * ROOT_FAN_RADIUS,
        y: origin.y + FIELD_BAND_GAP + fan.dy * ROOT_SPINE_STEP,
      });
      angles.set(parent.id, fan.dx * 18);
      roles.set(parent.id, "root");
      child = parent;
      depth += 1;
    }

    // Spine ids — used so nested domain kids cascade off the hub, not the trunk.
    const spineIds = new Set(centers.keys());

    // Side forks off the spine — nested domains (e.g. Vision) place in passes.
    const sidePrefs: Record<string, number> = {
      "computer-vision": -1,
      "sequence-models": 1,
      "reinforcement-learning": -1,
    };
    /** Preferred fan around a domain hub — 270 = left, 90 = right. */
    const nestedFan: Record<string, { angle: number; radius: number }> = {
      "object-detection": { angle: 292, radius: 460 },
      cnn: { angle: 270, radius: 430 },
      "image-classification": { angle: 248, radius: 460 },
      lstm: { angle: 68, radius: 460 },
      rnn: { angle: 90, radius: 430 },
      seq2seq: { angle: 112, radius: 460 },
    };
    /** Center-to-center gap so 280px root ovals never sit on top of each other. */
    const ROOT_SIDE_GAP = 320;
    let placedSide = true;
    while (placedSide) {
      placedSide = false;
      for (const [parentId, kids] of children) {
        if (roles.get(parentId) !== "root") continue;
        const hub = centers.get(parentId);
        if (!hub) continue;
        const unplaced = kids.filter((k) => !centers.has(k.id));
        if (unplaced.length === 0) continue;
        placedSide = true;
        const nested = !spineIds.has(parentId);
        let autoSide = -1;
        unplaced.forEach((kid, i) => {
          const side = sidePrefs[kid.id] ?? (autoSide *= -1);
          if (nested) {
            const fan = nestedFan[kid.id];
            if (fan) {
              const p = offsetFrom(hub, fan.angle, fan.radius);
              centers.set(kid.id, p);
              angles.set(kid.id, fan.angle - 270);
            } else {
              // Generic nest: fan on the parent's side, unique angles per kid.
              const base = side < 0 ? 270 : 90;
              const spread = 28;
              const mid = (unplaced.length - 1) / 2;
              const angle = base + (i - mid) * spread;
              centers.set(kid.id, offsetFrom(hub, angle, 420 + i * 20));
              angles.set(kid.id, angle - 270);
            }
          } else {
            centers.set(kid.id, {
              x: hub.x + side * SIDE_ROOT_REACH,
              y: hub.y + 80,
            });
            angles.set(kid.id, side * 28);
          }
          roles.set(kid.id, "root");
        });
      }
    }

    const sideRootIds = [...centers.keys()].filter(
      (id) => roles.get(id) === "root" && !spineIds.has(id),
    );
    separateCenters(centers, sideRootIds, ROOT_SIDE_GAP, 100);
    // Keep side roots from sliding into the main spine column.
    for (const id of sideRootIds) {
      const c = centers.get(id)!;
      const minLeft = origin.x - SIDE_ROOT_REACH * 0.35;
      const minRight = origin.x + SIDE_ROOT_REACH * 0.35;
      if (c.x < origin.x && c.x > minLeft) c.x = minLeft - 40;
      if (c.x > origin.x && c.x < minRight) c.x = minRight + 40;
    }
  }

  const chapters = CHAPTER_ORDER.map((id) => byId.get(id)).filter(
    (n): n is ConceptNode => Boolean(n),
  );

  // Wide enough for six chapters, but stay in the upper half-plane
  const chapterAngles = spreadAnglesLinear(chapters.length, -86, 86);
  const chapterMeta = new Map<
    string,
    { x: number; y: number; angle: number }
  >();
  const chapterIds = chapters.map((c) => c.id);

  chapters.forEach((chapter, i) => {
    const angle = chapterAngles[i]!;
    const radius = 720 + (i % 2 === 0 ? 130 : 40) + Math.abs(angle) * 3.2;
    const center = offsetFrom(origin, angle, radius);
    chapterMeta.set(chapter.id, { ...center, angle });
    centers.set(chapter.id, center);
    angles.set(chapter.id, angle);
    roles.set(chapter.id, "branch");
  });

  // Pull chapter hubs apart before hanging leaves on them
  separateCenters(centers, chapterIds, CHAPTER_GAP, 90);
  for (const chapter of chapters) {
    const c = centers.get(chapter.id)!;
    // Never let a chapter sink toward/below the trunk
    if (c.y > origin.y - 320) c.y = origin.y - 320;
    const meta = chapterMeta.get(chapter.id)!;
    chapterMeta.set(chapter.id, { ...meta, x: c.x, y: c.y });
  }

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
  separateCenters(centers, leafIds, LEAF_GAP, 120);
  separateCenters(
    centers,
    [...chapterIds, ...leafIds],
    LEAF_CHAPTER_GAP,
    80,
  );

  for (const id of leafIds) {
    const c = centers.get(id)!;
    if (c.y > origin.y - 200) c.y = origin.y - 200;
  }

  // Final leaf-only polish after y clamp
  separateCenters(centers, leafIds, LEAF_GAP, 50);

  const sizeFor = (role: TreeRole) => {
    if (role === "trunk") return { w: ROOT_W, h: ROOT_H };
    if (role === "root") return { w: 280, h: 100 };
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
      const childRole = roles.get(node.id);
      const underground =
        parentRole === "root" || childRole === "root";
      edges.push({
        id: `tree-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        data: {
          kind: underground ? "root" : "tree",
          weight:
            childRole === "trunk" || parentRole === "trunk"
              ? underground
                ? 14
                : 5.5
              : underground
                ? 11
                : 2.6,
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

/** True when the node is Generative AI or lives in its canopy (not the deep roots). */
export function isCanopyNode(
  id: string,
  byId: Map<string, ConceptNode>,
): boolean {
  let current: ConceptNode | undefined = byId.get(id);
  while (current) {
    if (current.id === CANOPY_TRUNK_ID) return true;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return false;
}

/** Meadow begins at the mound feet — grass is the ground GenAI sits on. */
export function groundFieldY(canopyCenterY = CANOPY_ORIGIN.y): number {
  return canopyCenterY + 28;
}

/** Deep soil wash only below the meadow face (avoids a hard seam under the canopy). */
export function rootBedTopY(canopyCenterY = CANOPY_ORIGIN.y): number {
  return canopyCenterY + 220;
}

/** Extra bottom padding so canopy fitView always shows meadow under the mound. */
export const CANOPY_FIT_PADDING = {
  top: 0.08,
  left: 0.12,
  right: 0.12,
  bottom: 0.34,
} as const;

/** Tighter frame for phones — trunk + chapter hubs only (leaves stay reachable by pinch/pan). */
export const CANOPY_FIT_PADDING_MOBILE = {
  top: 0.14,
  left: 0.06,
  right: 0.06,
  bottom: 0.16,
} as const;

/** Ids to frame on first paint — canopy only, roots stay below the fold. */
export function canopyOverviewIds(nodes: ConceptNode[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return nodes.filter((n) => isCanopyNode(n.id, byId)).map((n) => n.id);
}

/**
 * Mobile overview — GenAI mound + six chapter hubs.
 * Framing every leaf on a phone zooms out until the tree is unusable.
 */
export function canopyMobileOverviewIds(nodes: ConceptNode[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ids = [CANOPY_TRUNK_ID, ...CHAPTER_ORDER].filter((id) => byId.has(id));
  return ids;
}

/** Ids to frame when entering the underground — mound + root crown. */
export function rootOverviewIds(nodes: ConceptNode[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return nodes
    .filter(
      (n) => n.id === CANOPY_TRUNK_ID || !isCanopyNode(n.id, byId),
    )
    .map((n) => n.id);
}

