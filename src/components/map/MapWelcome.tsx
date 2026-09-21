"use client";

export const WELCOME_STARTERS = [
  { id: "prompt", label: "Prompt" },
  { id: "rag", label: "RAG" },
  { id: "agent", label: "Agent" },
  { id: "agent-harness", label: "Agent harness" },
] as const;

type Props = {
  onOrient: () => void;
  onWander: () => void;
  onStarter: (id: string) => void;
};

export function MapWelcome({ onOrient, onWander, onStarter }: Props) {
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
        <p className="map-welcome-eyebrow">Who Am I</p>
        <h2 id="map-welcome-title" className="map-welcome-title">
          How do you want to enter?
        </h2>
        <p id="map-welcome-desc" className="map-welcome-desc">
          Start in the Generative AI canopy. On a phone: drag to pan, pinch to
          zoom, drag down past the field for roots (or tap Enter roots). On a
          computer: scroll to zoom, hover the field and scroll down for roots.
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
        <div className="map-welcome-starters">
          <p className="map-welcome-starters-label">
            Or jump to a must-know word
          </p>
          <div className="map-welcome-chips">
            {WELCOME_STARTERS.map((starter) => (
              <button
                key={starter.id}
                type="button"
                className="map-welcome-chip"
                onClick={() => onStarter(starter.id)}
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
