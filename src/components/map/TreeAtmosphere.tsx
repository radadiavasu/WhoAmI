"use client";

/** Atmospheric layer — canopy light above; soil hush underground. */
export function TreeAtmosphere({ underground = false }: { underground?: boolean }) {
  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 overflow-hidden tree-atmosphere",
        underground ? "is-underground" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="canopy-wash" />
      <div className="soil-wash" />
      <div className="canopy-grain" />
      <div className="light-shaft shaft-a" />
      <div className="light-shaft shaft-b" />
      <div className="mote mote-1" />
      <div className="mote mote-2" />
      <div className="mote mote-3" />
      <div className="soil-mote soil-mote-1" />
      <div className="soil-mote soil-mote-2" />
      <div className="ground-glow" />
    </div>
  );
}
