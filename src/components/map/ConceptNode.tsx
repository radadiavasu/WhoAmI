"use client";

import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConceptNode } from "@/content/schema";
import type { TreeRole } from "@/lib/graph";

export type ConceptNodeData = {
  node: ConceptNode;
  role: TreeRole;
  angle: number;
  limbColor: string;
  focused?: boolean;
  neighbor?: boolean;
  dimmed?: boolean;
};

function ConceptNodeComponent({ data, id }: NodeProps) {
  const { node, role, angle, limbColor, focused, neighbor, dimmed } =
    data as ConceptNodeData;

  return (
    <div
      className={[
        "whoami-node relative",
        focused ? "is-focused" : "",
        neighbor ? "is-neighbor" : "",
        dimmed ? "is-dimmed" : "",
        role === "leaf" ? "is-leaf" : "",
      ].join(" ")}
      style={
        {
          ["--limb" as string]: limbColor,
          ["--tilt" as string]: `${Math.max(-30, Math.min(30, angle * 0.25))}deg`,
        } as CSSProperties
      }
    >
      <Handle type="target" position={Position.Bottom} className="!opacity-0" />

      {role === "trunk" ? (
        <div className="trunk-node px-7 py-5 text-center">
          <div className="font-display text-[1.45rem] leading-none tracking-tight text-[var(--ink)]">
            {node.name}
          </div>
          <div className="mt-1.5 text-[11px] tracking-wide text-[var(--ink-soft)]">
            start here
          </div>
        </div>
      ) : role === "branch" ? (
        <div
          className="branch-node px-4 py-3.5 text-center"
          style={{ background: limbColor }}
        >
          <div className="font-display text-[1.08rem] leading-tight text-[#06140f]">
            {node.name}
          </div>
        </div>
      ) : (
        <div className="leaf-node">
          <svg className="leaf-svg" viewBox="0 0 180 72" aria-hidden>
            <defs>
              <linearGradient id={`leaf-fill-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a2420" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--limb) 32%, #121a17)"
                />
              </linearGradient>
            </defs>
            <path
              d="M14,36 C18,12 52,6 90,8 C132,10 164,18 168,36 C164,54 128,64 90,64 C50,64 18,56 14,36 Z"
              fill={`url(#leaf-fill-${id})`}
              stroke="var(--limb)"
              strokeWidth="2.4"
              opacity="0.95"
            />
            <path
              d="M28,36 C60,28 110,28 155,36"
              fill="none"
              stroke="var(--limb)"
              strokeWidth="1"
              opacity="0.45"
            />
          </svg>
          <div className="leaf-label">
            <div className="text-[12.5px] font-semibold leading-snug text-[var(--ink)]">
              {node.name}
            </div>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Top} className="!opacity-0" />
    </div>
  );
}

export const ConceptNodeView = memo(ConceptNodeComponent);
