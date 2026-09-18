"use client";

type Props = {
  onOrient: () => void;
  onWander: () => void;
};

export function MapWelcome({ onOrient, onWander }: Props) {
  return (
    <div
      className="map-welcome"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-welcome-title"
      aria-describedby="map-welcome-desc"
    >
      {/* Full-screen catcher — RF nodes can re-enable pointer-events under a
          pointer-events:none parent, so we must own the hit target ourselves. */}
      <div className="map-welcome-scrim" aria-hidden />
      <div className="map-welcome-card">
        <p className="map-welcome-eyebrow">Generative AI map</p>
        <h2 id="map-welcome-title" className="map-welcome-title">
          How do you want to enter?
        </h2>
        <p id="map-welcome-desc" className="map-welcome-desc">
          The canopy stays free either way — this only picks your first step.
        </p>
        <div className="map-welcome-actions">
          <button
            type="button"
            className="map-welcome-primary"
            onClick={onOrient}
          >
            Start orientation
          </button>
          <button
            type="button"
            className="map-welcome-secondary"
            onClick={onWander}
          >
            I’ll wander
          </button>
        </div>
      </div>
    </div>
  );
}
