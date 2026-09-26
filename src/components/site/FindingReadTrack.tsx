"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function FindingReadTrack({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const update = () => {
      const rect = root.getBoundingClientRect();
      const travel = root.offsetHeight - window.innerHeight * 0.42;
      const next = travel <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / travel));
      setProgress(next);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="finding-read">
      <div
        className="finding-read-rail"
        aria-hidden
        style={{ ["--read" as string]: String(progress) }}
      >
        <div className="finding-read-rail-fill" />
      </div>
      {children}
    </div>
  );
}
