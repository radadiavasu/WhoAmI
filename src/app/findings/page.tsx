import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthorByline } from "@/components/site/AuthorByline";
import { SiteShell } from "@/components/site/SiteShell";
import { formatFindingDate, loadFindings } from "@/content/findings";
import { indexById, loadNodes } from "@/content/load";

export const metadata: Metadata = {
  title: "Findings",
  description:
    "Notes Vasu Radadiya writes after learning and trying ideas — linked back into the AI map.",
};

export default function FindingsPage() {
  const findings = loadFindings();
  const byId = indexById(loadNodes());

  return (
    <SiteShell
      title="Findings"
      lead="Notes I write after I learn something and try it myself — so I can share the insight, keep a public trail, help others place the idea, and reopen my own work later."
    >
      <ul className="findings-list">
        {findings.map((finding) => (
          <li key={finding.slug} className="finding-card">
            {finding.image ? (
              <Link href={`/findings/${finding.slug}`} className="finding-card-thumb">
                <Image
                  src={finding.image}
                  alt=""
                  width={640}
                  height={360}
                  sizes="(max-width: 720px) 100vw, 20rem"
                />
              </Link>
            ) : null}
            <div className="finding-card-body">
              <div className="finding-card-meta">
                <time dateTime={finding.date}>{formatFindingDate(finding.date)}</time>
                <span aria-hidden>·</span>
                <span>{finding.kind}</span>
              </div>
              <h2 className="finding-card-title">
                <Link href={`/findings/${finding.slug}`}>{finding.title}</Link>
              </h2>
              <p className="finding-card-excerpt">{finding.excerpt}</p>
              <AuthorByline compact />
              <div className="finding-card-nodes">
                {finding.nodeIds.map((id) => {
                  const node = byId.get(id);
                  return (
                    <Link key={id} href={`/c/${id}`} className="finding-node-chip">
                      {node?.name ?? id}
                    </Link>
                  );
                })}
              </div>
              <Link href={`/findings/${finding.slug}`} className="finding-card-more">
                Read finding
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </SiteShell>
  );
}
