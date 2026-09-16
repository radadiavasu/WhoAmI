"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function FocusCamera({ focusedId }: { focusedId?: string }) {
  const { setCenter, getNode, fitView } = useReactFlow();
  const didFitEmpty = useRef(false);

  useEffect(() => {
    if (!focusedId) {
      if (!didFitEmpty.current) {
        fitView({ padding: 0.16, duration: 550 });
        didFitEmpty.current = true;
      }
      return;
    }
    didFitEmpty.current = false;
    const node = getNode(focusedId);
    if (!node) return;
    const x = node.position.x + (node.measured?.width ?? 150) / 2;
    const y = node.position.y + (node.measured?.height ?? 56) / 2;
    setCenter(x, y, { zoom: 1.05, duration: 580 });
  }, [focusedId, getNode, setCenter, fitView]);

  return null;
}

type Props = {
  concepts: ConceptNode[];
  focusedId?: string;
  onSelect: (id: string) => void;
};

export function ConceptMap({ concepts, focusedId, onSelect }: Props) {
  // React Flow measures the viewport on the client; SSR HTML never matches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const graph = useMemo(() => buildFlowGraph(concepts), [concepts]);
  const byId = useMemo(
    () => new Map(concepts.map((n) => [n.id, n])),
    [concepts],
  );
  const focus = useMemo(
    () => (focusedId ? getFocusSet(focusedId, concepts) : null),
    [focusedId, concepts],
  );

  /** User-moved node positions survive focus updates. */
  const draggedPositions = useRef(
    new Map<string, { x: number; y: number }>(),
  );

  const layoutNodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => {
        const saved = draggedPositions.current.get(n.id);
        return {
          id: n.id,
          type: n.type,
          position: saved ?? n.position,
          draggable: true,
          data: {
            node: n.data.node,
            role: n.data.role,
            angle: n.data.angle,
            limbColor: chapterColor(resolveChapterId(n.data.node, byId)),
            focused: focusedId === n.id,
            neighbor: focus?.neighborIds.has(n.id) ?? false,
            dimmed: focus?.dimmedIds.has(n.id) ?? false,
          } satisfies ConceptNodeData,
        };
      }),
    [graph.nodes, focusedId, focus, byId],
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
        const involved =
          focusedId &&
          (e.source === focusedId ||
            e.target === focusedId ||
            focus?.neighborIds.has(e.source) ||
            focus?.neighborIds.has(e.target));
        const dimmed = Boolean(focusedId) && !involved;
        const sourceNode = byId.get(e.source);
        const stroke = involved
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
            stroke: neighbor ? "var(--sun)" : stroke,
            opacity: dimmed ? 0.08 : neighbor ? 0.8 : 0.88,
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
        fitViewOptions={{ padding: 0.14 }}
        minZoom={0.18}
        maxZoom={2.4}
        proOptions={{ hideAttribution: true }}
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
        <FocusCamera focusedId={focusedId} />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  );
}
