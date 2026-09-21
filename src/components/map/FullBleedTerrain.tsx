"use client";

import { useStore } from "@xyflow/react";

type Props = {
  fieldFlowY: number;
  bedFlowY: number;
  trunkFlowX: number;
  /** Soil bed — only when roots are open (avoids mid-scroll brown flash). */
  showUnderground?: boolean;
};

function GrassClump({
  x,
  y,
  scale = 1,
  tone = "#2e4630",
}: {
  x: number;
  y: number;
  scale?: number;
  tone?: string;
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      className="ground-tufts"
    >
      <path
        d="M0,0 C-1.5,-10 -4,-18 -2.5,-26"
        fill="none"
        stroke={tone}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M0,0 C1,-9 3,-17 5,-24"
        fill="none"
        stroke={tone}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M0,0 C-3,-8 -7,-14 -8,-20"
        fill="none"
        stroke={tone}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M0,0 C2.5,-7 6,-13 9,-18"
        fill="none"
        stroke={tone}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.75"
      />
    </g>
  );
}

/** Near-black foreground blades — the depth frame in front of everything. */
function FringeClump({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path
        d="M0,0 C-3,-16 -8,-30 -5,-48 C-2,-30 -1,-14 0,0 Z"
        fill="#0b130d"
      />
      <path
        d="M4,0 C5,-14 10,-26 16,-40 C10,-24 7,-12 4,0 Z"
        fill="#0d160f"
      />
      <path
        d="M-6,0 C-9,-12 -15,-22 -20,-32 C-13,-20 -9,-10 -6,0 Z"
        fill="#091009"
      />
      <path
        d="M8,0 C11,-10 16,-18 23,-26 C16,-16 12,-8 8,0 Z"
        fill="#0b130d"
      />
    </g>
  );
}

function Hedge({
  x,
  y,
  w,
  h,
  tone = "#1e3222",
  rim = 0.3,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: string;
  rim?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="0" rx={w} ry={h} fill={tone} />
      <ellipse
        cx={-w * 0.35}
        cy={h * 0.15}
        rx={w * 0.55}
        ry={h * 0.7}
        fill={tone}
        opacity="0.8"
      />
      <path
        d={`M${-w * 0.7},${-h * 0.3} Q0,${-h * 1.15} ${w * 0.7},${-h * 0.25}`}
        fill="none"
        stroke="#8fa98a"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={rim}
      />
    </g>
  );
}

/**
 * Night meadow with jungle depth — stacked silhouette planes, a lantern
 * clearing at the trunk, near-black foreground fringe framing the scene.
 */
export function FullBleedTerrain({
  fieldFlowY,
  bedFlowY,
  trunkFlowX,
  showUnderground = false,
}: Props) {
  const [tx, ty, zoom] = useStore((s) => s.transform);
  const fieldTop = fieldFlowY * zoom + ty;
  const fieldHeight = Math.max(200, 380 * zoom);
  const bedTop = bedFlowY * zoom + ty;
  const bedHeight = Math.max(640, 2000 * zoom);
  const trunkX = trunkFlowX * zoom + tx;

  return (
    <>
      <div
        className="soil-bleed"
        style={{
          height: bedHeight,
          transform: `translate3d(0, ${bedTop}px, 0)`,
          opacity: showUnderground ? 0.9 : 0,
          pointerEvents: "none",
        }}
        aria-hidden
      />

      <div
        className="ground-field-bleed"
        style={{
          height: fieldHeight,
          transform: `translate3d(0, ${fieldTop}px, 0)`,
          opacity: showUnderground ? 0 : 1,
          transition: "opacity 280ms ease",
        }}
        aria-hidden
      >
        {/* Wide soft halo behind the whole clearing */}
        <div className="ground-clearing-glow" style={{ left: `${trunkX}px` }} />

        <svg
          className="ground-field-svg"
          viewBox="0 0 2400 360"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gf-skyfade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1610" stopOpacity="0" />
              <stop offset="100%" stopColor="#142a1c" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="gf-ridge-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#223c28" />
              <stop offset="100%" stopColor="#16281a" />
            </linearGradient>
            <linearGradient id="gf-ridge-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c3221" />
              <stop offset="100%" stopColor="#122015" />
            </linearGradient>
            <linearGradient id="gf-ridge-c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28422c" />
              <stop offset="60%" stopColor="#1c3020" />
              <stop offset="100%" stopColor="#101c12" />
            </linearGradient>
            <linearGradient id="gf-ridge-d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2c1e" />
              <stop offset="100%" stopColor="#0d1710" />
            </linearGradient>
            <linearGradient id="gf-soil-soft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#33220f" stopOpacity="0" />
              <stop offset="40%" stopColor="#2c1d0e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#100b07" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="gf-soil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#42301e" />
              <stop offset="45%" stopColor="#281a0f" />
              <stop offset="100%" stopColor="#0c0805" />
            </linearGradient>
          </defs>

          {/* Sky settles into the meadow */}
          <rect x="0" y="0" width="2400" height="64" fill="url(#gf-skyfade)" />

          {/* Plane 1 — farthest ridge, brightest green (backlit by the clearing) */}
          <path
            d="M0,52 C220,26 440,68 680,40 C920,12 1140,64 1380,36 C1620,8 1840,60 2080,32 C2240,14 2340,44 2400,30 L2400,110 L0,110 Z"
            fill="url(#gf-ridge-a)"
          />
          <path
            d="M0,52 C220,26 440,68 680,40 C920,12 1140,64 1380,36 C1620,8 1840,60 2080,32 C2240,14 2340,44 2400,30"
            fill="none"
            stroke="#95b58c"
            strokeWidth="1.8"
            opacity="0.3"
          />

          <Hedge x={300} y={56} w={44} h={19} tone="#1c3020" rim={0.22} />
          <Hedge x={1060} y={46} w={52} h={23} tone="#1c3020" rim={0.25} />
          <Hedge x={1800} y={52} w={46} h={21} tone="#1c3020" rim={0.22} />

          {/* Plane 2 — mid ridge */}
          <path
            d="M0,80 C260,56 500,98 760,74 C1020,50 1260,104 1520,78 C1780,52 2040,100 2280,74 C2350,64 2385,80 2400,76 L2400,150 L0,150 Z"
            fill="url(#gf-ridge-b)"
          />
          <path
            d="M0,80 C260,56 500,98 760,74 C1020,50 1260,104 1520,78 C1780,52 2040,100 2280,74 C2350,64 2385,80 2400,76"
            fill="none"
            stroke="#8fa98a"
            strokeWidth="1.6"
            opacity="0.24"
          />

          <Hedge x={180} y={92} w={36} h={15} tone="#16281a" rim={0.2} />
          <Hedge x={560} y={84} w={48} h={18} tone="#16281a" rim={0.2} />
          <Hedge x={1340} y={88} w={42} h={17} tone="#16281a" rim={0.2} />
          <Hedge x={1910} y={90} w={44} h={17} tone="#16281a" rim={0.2} />

          {/* Plane 3 — lit bank the mound sits on (catches the lantern) */}
          <path
            d="M0,112 C240,92 460,130 700,110 C940,90 1160,136 1400,112 C1640,88 1880,138 2120,114 C2280,98 2360,118 2400,110 L2400,196 L0,196 Z"
            fill="url(#gf-ridge-c)"
          />
          <path
            d="M0,112 C240,92 460,130 700,110 C940,90 1160,136 1400,112 C1640,88 1880,138 2120,114 C2280,98 2360,118 2400,110"
            fill="none"
            stroke="#a8c49a"
            strokeWidth="2"
            opacity="0.35"
          />

          {/* Grass on the lit bank */}
          {[
            [70, 158, 0.9],
            [150, 162, 1],
            [240, 156, 0.9],
            [330, 164, 1.05],
            [430, 158, 0.8],
            [530, 166, 1],
            [630, 160, 0.95],
            [740, 168, 1.1],
            [850, 158, 0.85],
            [970, 164, 1],
            [1090, 160, 0.9],
            [1210, 168, 1.05],
            [1330, 158, 0.85],
            [1450, 166, 1],
            [1570, 162, 0.95],
            [1690, 170, 1.1],
            [1810, 160, 0.9],
            [1930, 166, 1],
            [2050, 158, 0.85],
            [2170, 164, 1.05],
            [2290, 160, 0.9],
            [2370, 168, 0.85],
          ].map(([x, y, scale], i) => (
            <GrassClump
              key={i}
              x={Number(x)}
              y={Number(y)}
              scale={Number(scale)}
              tone={i % 3 === 0 ? "#3d5a3a" : "#2e4630"}
            />
          ))}

          {/* Plane 4 — darker near roll in front of the bank */}
          <path
            d="M0,152 C300,136 560,172 860,152 C1160,132 1420,176 1720,154 C2020,132 2240,170 2400,152 L2400,230 L0,230 Z"
            fill="url(#gf-ridge-d)"
          />

          <Hedge x={230} y={158} w={34} h={15} tone="#122015" rim={0.14} />
          <Hedge x={480} y={152} w={28} h={12} tone="#122015" rim={0.12} />
          <Hedge x={2050} y={156} w={32} h={14} tone="#122015" rim={0.14} />
          <Hedge x={2290} y={150} w={30} h={13} tone="#122015" rim={0.12} />

          {/* Soil cut — layered, fading */}
          <path
            d="M0,196 C280,212 560,188 840,206 C1120,224 1400,192 1680,210 C1960,228 2200,196 2400,214 L2400,268 L0,268 Z"
            fill="#33220f"
            opacity="0.55"
          />
          <path
            d="M0,212 C360,232 720,202 1080,222 C1440,242 1800,204 2160,226 C2280,232 2360,220 2400,228 L2400,360 L0,360 Z"
            fill="url(#gf-soil-soft)"
          />
          <path
            d="M0,232 C400,248 800,226 1200,244 C1600,262 2000,232 2400,248 L2400,360 L0,360 Z"
            fill="url(#gf-soil)"
            opacity="0.96"
          />

          {/* Plane 5 — near-black foreground fringe, in front of the soil lip */}
          {[
            [40, 258, 1.1],
            [130, 252, 0.9],
            [230, 262, 1.3],
            [340, 254, 0.8],
            [450, 264, 1.15],
            [570, 256, 0.95],
            [700, 266, 1.25],
            [830, 256, 0.85],
            [960, 264, 1.05],
            [1100, 254, 0.9],
            [1240, 266, 1.2],
            [1390, 256, 0.85],
            [1530, 264, 1.1],
            [1670, 254, 0.95],
            [1810, 266, 1.3],
            [1950, 256, 0.9],
            [2090, 264, 1.15],
            [2220, 254, 0.85],
            [2330, 262, 1.05],
          ].map(([x, y, scale], i) => (
            <FringeClump
              key={i}
              x={Number(x)}
              y={Number(y)}
              scale={Number(scale)}
            />
          ))}
        </svg>

        {/* Warm lantern pool around the trunk — the scene's light source */}
        <div className="ground-warm-glow" style={{ left: `${trunkX}px` }} />

        {/* Edge vignette — the clearing falls into darkness at the sides */}
        <div className="ground-field-edges" />

        {/* Fireflies */}
        <div className="field-firefly ff-1" />
        <div className="field-firefly ff-2" />
        <div className="field-firefly ff-3" />
        <div className="field-firefly ff-4" />
        <div className="field-firefly ff-5" />
        <div className="field-firefly ff-6" />
      </div>
    </>
  );
}
