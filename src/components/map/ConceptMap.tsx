"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
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
  canopyOverviewIds,
  CANOPY_FIT_PADDING,
  CANOPY_ORIGIN,
  CANOPY_TRUNK_ID,
  groundFieldY,
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

/** Frames canopy on first load; frames a focused node when one is open. */
function FocusCamera({
  focusedId,
  contextIds,
  overviewIds,
}: {
  focusedId?: string;
  contextIds: string[];
  overviewIds: string[];
}) {
  const { fitView } = useReactFlow();
  const didInit = useRef(false);
  const contextKey = contextIds.slice().sort().join("|");

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
          padding: CANOPY_FIT_PADDING,
          duration: 0,
          maxZoom: 1.05,
        });
      };
      // Two frames: RF pane size is often 0 on the first paint.
      requestAnimationFrame(() => {
        requestAnimationFrame(frameCanopy);
      });
      window.setTimeout(frameCanopy, 120);
    }
  }, [focusedId, contextKey, contextIds, overviewIds, fitView]);

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

/**
 * Field is the zoom boundary:
 * - cursor on canopy → normal scroll zoom
 * - cursor on field + scroll down → reveal roots
 * - cursor on field + scroll up → return to canopy
 */
function FieldZoomGate({
  fieldFlowY,
  overviewIds,
  rootIds,
  onUndergroundChange,
}: {
  fieldFlowY: number;
  overviewIds: string[];
  rootIds: string[];
  onUndergroundChange?: (underground: boolean) => void;
}) {
  const { fitView } = useReactFlow();
  const [, ty, zoom] = useStore((s) => s.transform);
  const fieldTop = fieldFlowY * zoom + ty;
  const fieldHeight = Math.max(200, 380 * zoom);
  const coolDown = useRef(false);

  const goRoots = () => {
    if (coolDown.current || rootIds.length === 0) return;
    coolDown.current = true;
    onUndergroundChange?.(true);
    fitView({
      nodes: rootIds.map((id) => ({ id })),
      padding: 0.14,
      duration: 560,
      maxZoom: 1.2,
      minZoom: 0.55,
    });
    window.setTimeout(() => {
      coolDown.current = false;
    }, 600);
  };

  const goCanopy = () => {
    if (coolDown.current || overviewIds.length === 0) return;
    coolDown.current = true;
    onUndergroundChange?.(false);
    fitView({
      nodes: overviewIds.map((id) => ({ id })),
      padding: CANOPY_FIT_PADDING,
      duration: 560,
      maxZoom: 1.1,
    });
    window.setTimeout(() => {
      coolDown.current = false;
    }, 600);
  };

  return (
    <div
      className="field-zoom-gate"
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
      role="presentation"
      title="Scroll here to enter or leave the roots"
    />
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
    return [focusedId, ...focus.pathIds, ...focus.neighborIds];
  }, [focusedId, focus]);

  const overviewIds = useMemo(
    () => canopyOverviewIds(concepts),
    [concepts],
  );
  const rootIds = useMemo(() => rootOverviewIds(concepts), [concepts]);

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
        draggable: true,
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
    [graph.nodes, focusedId, focus, byId, visitedIds, inviteId],
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
    <div className="h-full w-full">
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
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        selectionOnDrag={false}
        nodeDragThreshold={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.55 }}
      >
        <FocusCamera
          focusedId={focusedId}
          contextIds={contextIds}
          overviewIds={overviewIds}
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
          onUndergroundChange={onUndergroundChange}
        />
        <UndergroundSense
          fieldFlowY={fieldY}
          onUndergroundChange={onUndergroundChange}
        />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
