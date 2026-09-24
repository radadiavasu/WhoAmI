import Link from "next/link";
import type { FindingResource } from "@/content/findings";

const KIND_LABEL: Record<NonNullable<FindingResource["kind"]>, string> = {
  docs: "Docs",
  paper: "Paper",
  repo: "Repo",
  talk: "Talk",
  tool: "Tool",
  other: "Link",
};

type Props = {
  resources: FindingResource[];
};

export function FindingResources({ resources }: Props) {
  if (resources.length === 0) return null;

  return (
    <section className="finding-resources" aria-labelledby="finding-used">
      <h2 id="finding-used">What I used</h2>
      <p>The papers, docs, and talks behind this note — so you can follow the same path.</p>
      <ul>
        {resources.map((resource) => (
          <li key={resource.href}>
            {resource.kind ? (
              <span className="finding-resource-kind">
                {KIND_LABEL[resource.kind]}
              </span>
            ) : null}
            {resource.href.startsWith("/") ? (
              <Link href={resource.href}>{resource.label}</Link>
            ) : (
              <a href={resource.href} rel="noreferrer" target="_blank">
                {resource.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
