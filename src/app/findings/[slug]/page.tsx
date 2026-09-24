import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorByline } from "@/components/site/AuthorByline";
import { FindingMedia } from "@/components/site/FindingMedia";
import { FindingCompare } from "@/components/site/FindingCompare";
import { FindingResources } from "@/components/site/FindingResources";
import { SiteShell } from "@/components/site/SiteShell";
import { SITE_AUTHOR } from "@/content/author";
import { formatFindingDate, getFinding, loadFindings } from "@/content/findings";
import { indexById, loadNodes } from "@/content/load";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return loadFindings().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const finding = getFinding(slug);
  if (!finding) return { title: "Finding" };
  return {
    title: finding.title,
    description: finding.excerpt,
    authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.href }],
    openGraph: finding.image
      ? { images: [{ url: finding.image, alt: finding.title }] }
      : undefined,
  };
}

export default async function FindingDetailPage({ params }: Props) {
  const { slug } = await params;
  const finding = getFinding(slug);
  if (!finding) notFound();

  const byId = indexById(loadNodes());
  const paragraphs = finding.body.split(/\n\n+/).filter(Boolean);
  const afterword = (finding.afterword ?? "").split(/\n\n+/).filter(Boolean);

  return (
    <SiteShell title={finding.title} lead={finding.excerpt}>
      <article className="finding-detail">
        <div className="finding-detail-meta">
          <time dateTime={finding.date}>{formatFindingDate(finding.date)}</time>
          <span aria-hidden>·</span>
          <span>{finding.kind}</span>
        </div>
        <AuthorByline />
        <FindingMedia finding={finding} priority />
        <div className="finding-detail-body">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        {finding.compare ? <FindingCompare compare={finding.compare} /> : null}
        {afterword.length > 0 ? (
          <div className="finding-detail-body">
            {afterword.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        ) : null}
        <section className="finding-detail-map" aria-labelledby="open-on-tree">
          <h2 id="open-on-tree">Open on the tree</h2>
          <p>Jump into the map at the concepts this note sits on.</p>
          <div className="finding-card-nodes">
            {finding.nodeIds.map((id) => {
              const node = byId.get(id);
              return (
                <Link key={id} href={`/c/${id}`} className="finding-node-chip is-large">
                  {node?.name ?? id}
                </Link>
              );
            })}
          </div>
        </section>
        <FindingResources resources={finding.resources ?? []} />
        <p className="finding-detail-back">
          <Link href="/findings">All findings</Link>
        </p>
      </article>
    </SiteShell>
  );
}
