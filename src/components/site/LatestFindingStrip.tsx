import Link from "next/link";
import type { Finding } from "@/content/findings";

type Props = {
  finding: Finding;
};

export function LatestFindingStrip({ finding }: Props) {
  return (
    <aside className="latest-finding" aria-label="Latest finding">
      <div className="latest-finding-inner">
        <p className="latest-finding-kicker">Latest finding</p>
        <p className="latest-finding-title">
          <Link href={`/findings/${finding.slug}`}>{finding.title}</Link>
        </p>
        <Link href={`/findings/${finding.slug}`} className="latest-finding-link">
          Read finding
        </Link>
      </div>
    </aside>
  );
}
