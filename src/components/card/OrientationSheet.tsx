"use client";

import type { ReactNode } from "react";

export function OrientationSheet({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 md:hidden">
      <div className="max-h-[72vh] overflow-hidden rounded-t-[1.75rem] border border-b-0 border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[var(--panel)] shadow-[0_-20px_50px_color-mix(in_oklab,black_55%,transparent)]">
        {children}
      </div>
    </div>
  );
}
