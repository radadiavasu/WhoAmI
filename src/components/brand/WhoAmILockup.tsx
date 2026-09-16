export function WhoAmILockup({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label="Who Am I"
      className={["brand-lockup", compact ? "is-compact" : ""].filter(Boolean).join(" ")}
    >
      <span className="brand-mark" aria-hidden>
        whoami
      </span>
      <p className="brand-wordmark" aria-hidden>
        <span className="brand-line">Who</span>
        <span className="brand-line">
          <span className="brand-ai">A</span>
          m{" "}
          <span className="brand-ai">I</span>
        </span>
      </p>
    </div>
  );
}
