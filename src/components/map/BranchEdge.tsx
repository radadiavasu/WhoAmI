"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function BranchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const weight = (data as { weight?: number } | undefined)?.weight ?? 2.4;
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.45,
  });

  return (
    <>
      {/* Soft glow under the limb */}
      <BaseEdge
        id={`${id}-glow`}
        path={path}
        style={{
          ...style,
          strokeWidth: weight + 6,
          opacity: 0.12,
          stroke: style?.stroke,
          filter: "blur(4px)",
        }}
      />
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: weight,
          strokeLinecap: "round",
        }}
      />
    </>
  );
}
