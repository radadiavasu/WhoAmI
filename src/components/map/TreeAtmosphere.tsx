"use client";

/** Atmospheric canopy layer — grain, light shafts, floating motes. */
export function TreeAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden tree-atmosphere"
    >
      <div className="canopy-wash" />
      <div className="canopy-grain" />
      <div className="light-shaft shaft-a" />
      <div className="light-shaft shaft-b" />
      <div className="mote mote-1" />
      <div className="mote mote-2" />
      <div className="mote mote-3" />
      <div className="ground-glow" />
    </div>
  );
}
