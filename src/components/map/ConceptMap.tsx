"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import {
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import type { ConceptNode } from "@/content/schema";
import { buildFlowGraph } from "@/lib/graph";
import { getFocusSet } from "@/lib/focus";
import { chapterColor, resolveChapterId } from "@/lib/chapters";
import { ConceptNodeView, type ConceptNodeData } from "./ConceptNode";
import { BranchEdge } from "./BranchEdge";

const nodeTypes = { concept: ConceptNodeView };
const edgeTypes = { branch: BranchEdge };

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function FocusCamera({
  focusedId,
  contextIds,
}: {
  focusedId?: string;
  contextIds: string[];
}) {
  const { fitView } = useReactFlow();
  const contextKey = contextIds.slice().sort().join("|");

  useEffect(() => {
    if (!focusedId) {
      fitView({ padding: 0.1, duration: 280 });
      return;
    }
    const ids = contextIds.length > 0 ? contextIds : [focusedId];
    // Frame the leaf with its chapter path so placement stays visible.
    fitView({
      nodes: ids.map((id) => ({ id })),
      padding: 0.28,
      duration: 340,
      maxZoom: 1.15,
      minZoom: 0.45,
    });
  }, [focusedId, contextKey, contextIds, fitView]);

  return null;
}

type Props = {
  concepts: ConceptNode[];
  focusedId?: string;
  /** Soft pulse on this node when the map is empty (first-visit hint). */
  inviteId?: string;
  visitedIds: Set<string>;
  onSelect: (id: string) => void;
};

export function ConceptMap({
  concepts,
  focusedId,
  inviteId,
  visitedIds,
  onSelect,
}: Props) {
  // React Flow measures the viewport on the client; SSR HTML never matches.
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
    return [
      focusedId,
      ...focus.pathIds,
      ...focus.neighborIds,
    ];
  }, [focusedId, focus]);

  /** User-moved node positions survive focus updates. */
  const draggedPositions = useRef(
    new Map<string, { x: number; y: number }>(),
  );

  const layoutNodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        draggable: true,
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
        const stroke =
          neighbor || onPath
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
            opacity: dimmed ? 0.08 : neighbor || onPath ? 0.9 : 0.88,
            strokeWidth: onPath ? 2.4 : undefined,
            strokeDasharray: neighbor ? "6 8" : undefined,
          },
        };
      });
  }, [graph.edges, focusedId, focus, byId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Sync focus/dim styling without wiping dragged positions
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
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.18}
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
      >
        <FocusCamera focusedId={focusedId} contextIds={contextIds} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
