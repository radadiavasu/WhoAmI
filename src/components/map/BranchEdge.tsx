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
  );
}
