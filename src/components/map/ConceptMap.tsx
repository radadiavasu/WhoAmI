"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import type { ConceptNode } from "@/content/schema";
import {
  buildFlowGraph,
  canopyMobileOverviewIds,
  canopyOverviewIds,
  CANOPY_FIT_PADDING,
  CANOPY_FIT_PADDING_MOBILE,
  CANOPY_ORIGIN,
  CANOPY_TRUNK_ID,
  groundFieldY,
  isCanopyNode,
  rootBedTopY,
  rootOverviewIds,
} from "@/lib/graph";
import { getFocusSet } from "@/lib/focus";
import { chapterColor, resolveChapterId } from "@/lib/chapters";
import { ConceptNodeView, type ConceptNodeData } from "./ConceptNode";
import { BranchEdge } from "./BranchEdge";
import { FullBleedTerrain } from "./FullBleedTerrain";

const nodeTypes = { concept: ConceptNodeView };
const edgeTypes = { branch: BranchEdge };

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Phone-width or coarse pointer — touch-first map behavior. */
function useTouchMap() {
  return useSyncExternalStore(
    (onChange) => {
      const width = window.matchMedia("(max-width: 767px)");
      const coarse = window.matchMedia("(pointer: coarse)");
      width.addEventListener("change", onChange);
      coarse.addEventListener("change", onChange);
      return () => {
        width.removeEventListener("change", onChange);
        coarse.removeEventListener("change", onChange);
      };
    },
    () =>
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

/** Frames canopy on first load; frames a focused node when one is open. */
function FocusCamera({
  focusedId,
  contextIds,
  overviewIds,
  fitPadding,
  maxOverviewZoom,
}: {
  focusedId?: string;
  contextIds: string[];
  overviewIds: string[];
  fitPadding: typeof CANOPY_FIT_PADDING | typeof CANOPY_FIT_PADDING_MOBILE;
  maxOverviewZoom: number;
}) {
  const { fitView } = useReactFlow();
  const didInit = useRef(false);
  const contextKey = contextIds.slice().sort().join("|");
  const overviewKey = overviewIds.join("|");

  useEffect(() => {
    if (focusedId) {
      const ids = contextIds.length > 0 ? contextIds : [focusedId];
      fitView({
        nodes: ids.map((id) => ({ id })),
        padding: 0.28,
        duration: 340,
        maxZoom: 1.25,
        minZoom: 0.4,
      });
      return;
    }

    if (!didInit.current && overviewIds.length > 0) {
      didInit.current = true;
      const frameCanopy = () => {
        fitView({
          nodes: overviewIds.map((id) => ({ id })),
          padding: fitPadding,
          duration: 0,
          maxZoom: maxOverviewZoom,
        });
      };
      // Two frames: RF pane size is often 0 on the first paint.
      requestAnimationFrame(() => {
        requestAnimationFrame(frameCanopy);
      });
      window.setTimeout(frameCanopy, 120);
    }
  }, [
    focusedId,
    contextKey,
    contextIds,
    overviewIds,
    overviewKey,
    fitView,
    fitPadding,
    maxOverviewZoom,
  ]);

  return null;
}

/**
 * Keep atmosphere/hint in sync when the user pans (not only field-scroll).
 * Does not move the camera.
 */
function UndergroundSense({
  fieldFlowY,
  onUndergroundChange,
}: {
  fieldFlowY: number;
  onUndergroundChange?: (underground: boolean) => void;
}) {
  const transform = useStore((s) => s.transform);
  const last = useRef<boolean | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      armed.current = true;
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!onUndergroundChange || !armed.current) return;
    const [, ty, zoom] = transform;
    const fieldScreenY = fieldFlowY * zoom + ty;
    const underground = fieldScreenY < window.innerHeight * 0.35;
    if (last.current === underground) return;
    last.current = underground;
    onUndergroundChange(underground);
  }, [transform, fieldFlowY, onUndergroundChange]);

  return null;
}

type LayerNav = {
  goRoots: () => void;
  goCanopy: () => void;
};

/**
 * Field is the zoom boundary:
 * - desktop: wheel on the field band
 * - touch: swipe vertically on a thin grass strip, or pan past the field
 */
function FieldZoomGate({
  fieldFlowY,
  overviewIds,
  rootIds,
  fitPadding,
  touchMap,
  underground,
  onUndergroundChange,
  navRef,
}: {
  fieldFlowY: number;
  overviewIds: string[];
  rootIds: string[];
  fitPadding: typeof CANOPY_FIT_PADDING | typeof CANOPY_FIT_PADDING_MOBILE;
  touchMap: boolean;
  underground: boolean;
  onUndergroundChange?: (underground: boolean) => void;
  navRef: MutableRefObject<LayerNav | null>;
}) {
  const { fitView } = useReactFlow();
  const [, ty, zoom] = useStore((s) => s.transform);
  const fieldTop = fieldFlowY * zoom + ty;
  // Desktop: tall hover band. Touch: thin grass crest so the rest of the map still pans.
  const fieldHeight = touchMap
    ? Math.max(72, 110 * zoom)
    : Math.max(200, 380 * zoom);
  const coolDown = useRef(false);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const goRoots = () => {
    if (coolDown.current || rootIds.length === 0) return;
    coolDown.current = true;
    onUndergroundChange?.(true);
    fitView({
      nodes: rootIds.map((id) => ({ id })),
      padding: touchMap ? 0.18 : 0.14,
      duration: 560,
      maxZoom: touchMap ? 0.95 : 1.2,
      minZoom: 0.45,
    });
    window.setTimeout(() => {
      coolDown.current = false;
    }, 650);
  };

  const goCanopy = () => {
    if (coolDown.current || overviewIds.length === 0) return;
    coolDown.current = true;
    onUndergroundChange?.(false);
    fitView({
      nodes: overviewIds.map((id) => ({ id })),
      padding: fitPadding,
      duration: 560,
      maxZoom: touchMap ? 1.35 : 1.1,
    });
    window.setTimeout(() => {
      coolDown.current = false;
    }, 650);
  };

  useEffect(() => {
    navRef.current = { goRoots, goCanopy };
    return () => {
      navRef.current = null;
    };
  });

  // Mobile pan-past-field = PC wheel-on-field (scroll into / out of roots).
  const lastFieldY = useRef<number | null>(null);
  const panArmed = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      panArmed.current = true;
    }, 750);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!touchMap || !panArmed.current || coolDown.current) return;
    const fieldScreenY = fieldFlowY * zoom + ty;
    const h = window.innerHeight;
    const prev = lastFieldY.current;
    lastFieldY.current = fieldScreenY;
    if (prev == null) return;

    // Drag the world down → field rises on screen → enter roots
    if (!underground && prev > h * 0.48 && fieldScreenY < h * 0.34) {
      goRoots();
      return;
    }
    // Drag the world up → field drops → return to canopy
    if (underground && prev < h * 0.42 && fieldScreenY > h * 0.58) {
      goCanopy();
    }
  }, [ty, zoom, fieldFlowY, touchMap, underground]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && !touchMap) return;
    if (!touchMap) return;
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!touchMap || !pointerOrigin.current) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    pointerOrigin.current = null;
    // Finger moves down on the strip → roots (same direction as wheel down)
    if (dy > 40 && Math.abs(dy) > Math.abs(dx) * 1.1) goRoots();
    else if (dy < -40 && Math.abs(dy) > Math.abs(dx) * 1.1) goCanopy();
  };

  return (
    <div
      className={[
        "field-zoom-gate",
        touchMap ? "is-touch-map" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        height: fieldHeight,
        transform: `translate3d(0, ${fieldTop}px, 0)`,
      }}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 8) goRoots();
        else if (e.deltaY < -8) goCanopy();
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      role="presentation"
      title={
        touchMap
          ? "Swipe the field down for roots, up for canopy — or drag past the ground"
          : "Scroll here to enter or leave the roots"
      }
    />
  );
}

/** Explicit layer control — required on phones (no hover+wheel). */
function RootsToggle({
  underground,
  navRef,
}: {
  underground: boolean;
  navRef: MutableRefObject<LayerNav | null>;
}) {
  return (
    <button
      type="button"
      className="roots-toggle"
      onClick={() => {
        if (underground) navRef.current?.goCanopy();
        else navRef.current?.goRoots();
      }}
    >
      {underground ? "Back to canopy" : "Enter roots"}
    </button>
  );
}

type Props = {
  concepts: ConceptNode[];
  focusedId?: string;
  inviteId?: string;
  visitedIds: Set<string>;
  underground?: boolean;
  onSelect: (id: string) => void;
  onUndergroundChange?: (underground: boolean) => void;
};

export function ConceptMap({
  concepts,
  focusedId,
  inviteId,
  visitedIds,
  underground = false,
  onSelect,
  onUndergroundChange,
}: Props) {
  const mounted = useIsClient();
  const touchMap = useTouchMap();
  const layerNav = useRef<LayerNav | null>(null);

  const graph = useMemo(() => buildFlowGraph(concepts), [concepts]);
  const byId = useMemo(
    () => new Map(concepts.map((n) => [n.id, n])),
    [concepts],
  );
  const focus = useMemo(
    () => (focusedId ? getFocusSet(focusedId, concepts) : null),
    [focusedId, concepts],
  );

  const contextIds = useMemo(() => {
    if (!focusedId || !focus) return [] as string[];
    // On phones, framing the full spine+neighbors zooms out too far.
    if (touchMap) {
      const node = byId.get(focusedId);
      if (!node) return [focusedId];
      const ids = [focusedId];
      if (node.parentId) ids.push(node.parentId);
      if (isCanopyNode(focusedId, byId) && byId.has(CANOPY_TRUNK_ID)) {
        ids.push(CANOPY_TRUNK_ID);
      }
      return ids;
    }
    return [focusedId, ...focus.pathIds, ...focus.neighborIds];
  }, [focusedId, focus, touchMap, byId]);

  const overviewIds = useMemo(
    () =>
      touchMap
        ? canopyMobileOverviewIds(concepts)
        : canopyOverviewIds(concepts),
    [concepts, touchMap],
  );
  const rootIds = useMemo(() => rootOverviewIds(concepts), [concepts]);
  const fitPadding = touchMap
    ? CANOPY_FIT_PADDING_MOBILE
    : CANOPY_FIT_PADDING;

  const fieldY = groundFieldY(CANOPY_ORIGIN.y);
  const bedTop = rootBedTopY(CANOPY_ORIGIN.y);

  const draggedPositions = useRef(
    new Map<string, { x: number; y: number }>(),
  ) as MutableRefObject<Map<string, { x: number; y: number }>>;

  const layoutNodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        draggable: !touchMap,
        zIndex: n.data.role === "root" ? 4 : 5,
        data: {
          node: n.data.node,
          role: n.data.role,
          angle: n.data.angle,
          limbColor: chapterColor(resolveChapterId(n.data.node, byId)),
          focused: focusedId === n.id,
          neighbor: focus?.neighborIds.has(n.id) ?? false,
          path: focus?.pathIds.has(n.id) ?? false,
          visited: visitedIds.has(n.id),
          dimmed: focus?.dimmedIds.has(n.id) ?? false,
          invite: Boolean(inviteId) && inviteId === n.id && !focusedId,
        } satisfies ConceptNodeData,
      })),
    [graph.nodes, focusedId, focus, byId, visitedIds, inviteId, touchMap],
  );

  const layoutEdges: Edge[] = useMemo(() => {
    return graph.edges
      .filter((e) => {
        if (e.data?.kind === "neighbor") {
          if (!focusedId) return false;
          return (
            e.source === focusedId ||
            e.target === focusedId ||
            focus?.neighborIds.has(e.source) ||
            focus?.neighborIds.has(e.target)
          );
        }
        return true;
      })
      .map((e) => {
        const neighbor = e.data?.kind === "neighbor";
        const isRoot = e.data?.kind === "root";
        const onPath =
          Boolean(focusedId) &&
          ((e.source === focusedId && focus?.pathIds.has(e.target)) ||
            (e.target === focusedId && focus?.pathIds.has(e.source)) ||
            (focus?.pathIds.has(e.source) && focus?.pathIds.has(e.target)));
        const involved =
          focusedId &&
          (e.source === focusedId ||
            e.target === focusedId ||
            focus?.neighborIds.has(e.source) ||
            focus?.neighborIds.has(e.target) ||
            onPath);
        const dimmed = Boolean(focusedId) && !involved;
        const sourceNode = byId.get(e.source);
        const toTrunk =
          e.target === CANOPY_TRUNK_ID || e.source === CANOPY_TRUNK_ID;
        const stroke = isRoot
          ? onPath || involved
            ? "#e8c989"
            : toTrunk
              ? "#d4b07a"
              : "#c4a06a"
          : neighbor || onPath
            ? "var(--sun)"
            : involved
              ? "var(--sun)"
              : sourceNode
                ? chapterColor(resolveChapterId(sourceNode, byId))
                : "var(--glow)";
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "branch",
          data: e.data,
          animated: Boolean(involved && neighbor),
          style: {
            stroke,
            opacity: dimmed
              ? 0.08
              : isRoot
                ? 1
                : neighbor || onPath
                  ? 0.9
                  : 0.88,
            strokeWidth: isRoot
              ? toTrunk
                ? 52
                : onPath
                  ? 44
                  : 40
              : onPath
                ? 2.4
                : undefined,
            strokeDasharray: neighbor ? "6 8" : undefined,
          },
        };
      });
  }, [graph.edges, focusedId, focus, byId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    if (!mounted) return;
    setNodes((current) => {
      const byLayout = new Map(layoutNodes.map((n) => [n.id, n]));
      return current.map((node) => {
        const next = byLayout.get(node.id);
        if (!next) return node;
        const saved = draggedPositions.current.get(node.id);
        return {
          ...node,
          ...next,
          position: saved ?? node.position,
          data: next.data,
        };
      });
    });
    setEdges(layoutEdges);
  }, [mounted, layoutNodes, layoutEdges, setNodes, setEdges]);

  const onNodeDragStop: OnNodeDrag = (_event, node) => {
    draggedPositions.current.set(node.id, { ...node.position });
  };

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    onSelect(node.id);
  };

  if (!mounted) {
    return (
      <div
        className="h-full w-full"
        aria-busy="true"
        aria-label="Loading map"
      />
    );
  }

  return (
    <div className={["h-full w-full", touchMap ? "is-touch-map" : ""].join(" ")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.16}
        maxZoom={2.4}
        proOptions={{ hideAttribution: true }}
        onlyRenderVisibleElements
        nodesDraggable={!touchMap}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll={!touchMap}
        zoomOnPinch
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        nodeDragThreshold={touchMap ? 12 : 4}
        defaultViewport={{ x: 0, y: 0, zoom: touchMap ? 0.7 : 0.55 }}
      >
        <FocusCamera
          focusedId={focusedId}
          contextIds={contextIds}
          overviewIds={overviewIds}
          fitPadding={fitPadding}
          maxOverviewZoom={touchMap ? 1.4 : 1.05}
        />
        <FullBleedTerrain
          fieldFlowY={fieldY}
          bedFlowY={bedTop}
          trunkFlowX={CANOPY_ORIGIN.x}
          showHint={!underground}
        />
        <FieldZoomGate
          fieldFlowY={fieldY}
          overviewIds={overviewIds}
          rootIds={rootIds}
          fitPadding={fitPadding}
          touchMap={touchMap}
          underground={underground}
          onUndergroundChange={onUndergroundChange}
          navRef={layerNav}
        />
        <UndergroundSense
          fieldFlowY={fieldY}
          onUndergroundChange={onUndergroundChange}
        />
        {touchMap ? (
          <RootsToggle underground={underground} navRef={layerNav} />
        ) : null}
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
