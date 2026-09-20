"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

/** Soft S-curve so the tap reads as a living root, not a polyline. */
function organicRootPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): string {
  const dy = targetY - sourceY;
  const dx = targetX - sourceX;
  const side = dx === 0 ? (sourceY > targetY ? 1 : -1) : Math.sign(dx) || 1;
  const bulge = Math.max(56, Math.abs(dy) * 0.22) * side;
  const c1x = sourceX + dx * 0.18 + bulge * 0.6;
  const c1y = sourceY + dy * 0.3;
  const c2x = targetX - dx * 0.12 - bulge * 0.28;
  const c2y = targetY - dy * 0.26;
  return `M ${sourceX},${sourceY} C ${c1x},${c1y} ${c2x},${c2y} ${targetX},${targetY}`;
}

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
  const kind = (data as { kind?: string } | undefined)?.kind;
  const isRoot = kind === "root";

  const path = isRoot
    ? organicRootPath(sourceX, sourceY, targetX, targetY)
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.45,
      })[0];

  if (isRoot) {
    const requested =
      typeof style?.strokeWidth === "number" ? style.strokeWidth : weight;
    // Flow-space px — must read as bark against dark soil (not vanish into it).
    const thick = Math.max(requested, weight, 36);
    const stroke =
      (typeof style?.stroke === "string" && style.stroke) || "#c4a06a";
    const opacity =
      typeof style?.opacity === "number" ? style.opacity : 1;

    // Raw <path> attrs — bypass .react-flow__edge-path CSS that forces hairlines.
    return (
      <g className="root-edge-pair" opacity={opacity}>
        <path
          d={path}
          fill="none"
          stroke="#1a100a"
          strokeWidth={thick + 22}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
        <path
          d={path}
          fill="none"
          stroke="#5a3a24"
          strokeWidth={thick + 10}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        <path
          id={id}
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={thick}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="root-edge"
          markerEnd={markerEnd}
        />
        <path
          d={path}
          fill="none"
          stroke="#e8d4b0"
          strokeWidth={Math.max(4, thick * 0.18)}
          strokeLinecap="round"
          opacity={0.35}
        />
      </g>
    );
  }

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: weight,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    />
  );
}
