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
  path?: boolean;
  visited?: boolean;
  dimmed?: boolean;
  invite?: boolean;
};

function ConceptNodeComponent({ data, id }: NodeProps) {
  const {
    node,
    role,
    angle,
    limbColor,
    focused,
    neighbor,
    path,
    visited,
    dimmed,
    invite,
  } = data as ConceptNodeData;

  return (
    <div
      className={[
        "whoami-node relative",
        focused ? "is-focused" : "",
        neighbor ? "is-neighbor" : "",
        path ? "is-path" : "",
        visited && !focused ? "is-visited" : "",
        dimmed ? "is-dimmed" : "",
        invite ? "is-invite" : "",
        role === "leaf" ? "is-leaf" : "",
        role === "root" ? "is-root" : "",
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
        <div className="trunk-mound">
          <svg className="trunk-mound-svg" viewBox="0 0 280 130" aria-hidden>
            <defs>
              <linearGradient id={`mound-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5a4030" />
                <stop offset="45%" stopColor="#3a281c" />
                <stop offset="100%" stopColor="#1a100a" />
              </linearGradient>
            </defs>
            <ellipse
              cx="140"
              cy="108"
              rx="128"
              ry="18"
              fill="color-mix(in oklab, #1a2a18 70%, black)"
              opacity="0.55"
            />
            <path
              d="M28,108 C40,48 90,18 140,16 C190,18 240,48 252,108 Z"
              fill={`url(#mound-${id})`}
              stroke="#c4a574"
              strokeWidth="2.2"
            />
            <path
              d="M70,100 C90,58 120,40 140,38 C160,40 190,58 210,100"
              fill="none"
              stroke="#d4b896"
              strokeWidth="1.4"
              opacity="0.35"
            />
          </svg>
          <div className="trunk-mound-label px-5 text-center">
            <div className="font-display text-[1.4rem] leading-none tracking-tight text-[#f5ecd8]">
              {node.name}
            </div>
            <div className="mt-1 text-[11px] tracking-wide text-[#d4b896]/opacity-90">
              start here
            </div>
          </div>
        </div>
      ) : role === "root" ? (
        <div className="root-node px-6 py-4 text-center">
          <div className="root-node-grain" aria-hidden />
          <div className="root-node-label font-display text-[1.35rem] leading-tight text-[#f5ecd8]">
            {node.name}
          </div>
          {node.parentId === null ? (
            <div className="mt-1.5 text-[11px] tracking-wide text-[#d4b896]/opacity-90">
              deepest root
            </div>
          ) : null}
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
          <svg className="leaf-svg" viewBox="0 0 220 84" aria-hidden>
            <defs>
              <linearGradient id={`leaf-fill-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a2420" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--limb) 32%, #121a17)"
                />
              </linearGradient>
              {visited ? (
                <linearGradient
                  id={`leaf-picked-${id}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#1e2a28" />
                  <stop offset="55%" stopColor="#243330" />
                  <stop
                    offset="100%"
                    stopColor="color-mix(in oklab, var(--limb) 18%, #2a3532)"
                  />
                </linearGradient>
              ) : null}
            </defs>
            <path
              className="leaf-body"
              d={
                visited && !focused
                  ? // Picked leaf — bite taken from the tip (you've been here).
                    "M16,42 C20,14 60,7 110,9 C150,11 178,18 192,30 C186,36 186,48 192,54 C178,66 150,73 110,75 C60,75 20,66 16,42 Z"
                  : "M16,42 C20,14 60,7 110,9 C155,11 196,20 204,42 C196,64 152,75 110,75 C60,75 20,66 16,42 Z"
              }
              fill={
                visited && !focused
                  ? `url(#leaf-picked-${id})`
                  : `url(#leaf-fill-${id})`
              }
              stroke="var(--limb)"
              strokeWidth="2.6"
              opacity="0.95"
            />
            <path
              className="leaf-vein"
              d="M32,42 C72,32 130,32 172,42"
              fill="none"
              stroke="var(--limb)"
              strokeWidth="1.1"
              opacity="0.45"
            />
            {visited && !focused ? (
              <path
                className="leaf-picked-edge"
                d="M192,30 C186,36 186,48 192,54"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ) : null}
          </svg>
          <div className="leaf-label">
            <div className="leaf-label-text text-[var(--ink)]">{node.name}</div>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Top} className="!opacity-0" />
    </div>
  );
}

export const ConceptNodeView = memo(ConceptNodeComponent);
