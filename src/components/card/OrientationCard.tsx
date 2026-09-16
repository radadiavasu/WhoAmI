"use client";

import type { ConceptNode } from "@/content/schema";

const relationLabel: Record<string, string> = {
  prereq: "Grows from",
  sibling: "Nearby leaf",
  next: "Grows toward",
  usedIn: "Feeds into",
};

type Props = {
  node: ConceptNode;
  breadcrumb: string[];
  neighborNames: Record<string, string>;
  accent?: string;
  onNavigate: (id: string) => void;
  onClose?: () => void;
};

export function OrientationCard({
  node,
  breadcrumb,
  neighborNames,
  accent = "var(--glow)",
  onNavigate,
  onClose,
}: Props) {
  return (
    <article className="flex h-full max-h-[min(80vh,42rem)] flex-col overflow-hidden rounded-[1.75rem] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[var(--panel)] shadow-[0_28px_70px_color-mix(in_oklab,black_55%,transparent)]">
      <div
        className="relative overflow-hidden px-5 py-4 text-[#07140f]"
        style={{ background: accent }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[color-mix(in_oklab,white_22%,transparent)]"
        />
        <p className="text-[12px] opacity-80">{breadcrumb.join(" · ")}</p>
        <h2 className="mt-1 font-display text-[1.85rem] leading-tight">
          {node.name}
        </h2>
        {node.alias ? (
          <p className="mt-1 text-sm opacity-85">{node.alias}</p>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-[color-mix(in_oklab,black_22%,transparent)] px-3 py-1 text-xs text-white"
            aria-label="Close"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm text-[var(--ink)]">
        <p className="text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {node.oneBreath}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[var(--panel-lift)] p-3">
            <h3 className="mb-2 font-display text-lg text-[var(--ink)]">
              Does
            </h3>
            <ul className="space-y-1.5 text-[var(--ink-soft)]">
              {node.does.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[var(--panel-lift)] p-3">
            <h3 className="mb-2 font-display text-lg text-[var(--ink)]">
              Doesn’t
            </h3>
            <ul className="space-y-1.5 text-[var(--ink-soft)]">
              {node.doesNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {node.neighbors.length > 0 ? (
          <div>
            <h3 className="mb-2 font-display text-lg">
              Connected leaves
            </h3>
            <ul className="flex flex-wrap gap-2">
              {node.neighbors.map((n) => (
                <li key={`${n.relation}-${n.id}`}>
                  <button
                    type="button"
                    onClick={() => onNavigate(n.id)}
                    className="rounded-full bg-[var(--panel-lift)] px-3 py-1.5 text-left text-xs transition hover:bg-[color-mix(in_oklab,var(--glow)_28%,var(--panel))]"
                  >
                    <span className="block text-[10px] text-[var(--ink-soft)]">
                      {relationLabel[n.relation] ?? n.relation}
                    </span>
                    <span className="font-semibold text-[var(--ink)]">
                      {neighborNames[n.id] ?? n.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          className="w-full rounded-full px-3 py-3 text-sm font-semibold text-[#07140f] shadow-[0_10px_28px_color-mix(in_oklab,black_40%,transparent)] disabled:opacity-40"
          style={{ background: accent }}
          onClick={() => {
            if (node.nextStep.targetId) onNavigate(node.nextStep.targetId);
          }}
          disabled={!node.nextStep.targetId}
        >
          {node.nextStep.label}
        </button>

        <details className="rounded-2xl bg-[var(--panel-lift)] px-3 py-2">
          <summary className="cursor-pointer font-medium text-[var(--ink)]">
            Go a little deeper
          </summary>
          <div className="mt-2 space-y-2 text-[var(--ink-soft)]">
            <p>
              <span className="font-medium text-[var(--ink)]">Level:</span>{" "}
              {node.level}
            </p>
            {node.analogy ? (
              <p>
                <span className="font-medium text-[var(--ink)]">Analogy:</span>{" "}
                {node.analogy}
              </p>
            ) : null}
            {node.example ? (
              <p>
                <span className="font-medium text-[var(--ink)]">Example:</span>{" "}
                {node.example}
              </p>
            ) : null}
          </div>
        </details>

        {(node.aliases?.length ||
          node.year ||
          node.relatedTechniques?.length ||
          node.changing) && (
          <details className="rounded-2xl bg-[var(--panel-lift)] px-3 py-2">
            <summary className="cursor-pointer font-medium text-[var(--ink)]">
              For the curious / pros
            </summary>
            <div className="mt-2 space-y-2 text-[var(--ink-soft)]">
              {node.aliases?.length ? (
                <p>Also known as: {node.aliases.join(", ")}</p>
              ) : null}
              {node.year ? <p>Year signal: {node.year}</p> : null}
              {node.relatedTechniques?.length ? (
                <p>Related: {node.relatedTechniques.join(", ")}</p>
              ) : null}
              {node.changing ? <p>What’s changing: {node.changing}</p> : null}
            </div>
          </details>
        )}
      </div>
    </article>
  );
}
