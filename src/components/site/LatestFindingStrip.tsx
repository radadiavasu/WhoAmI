import Link from "next/link";
import type { Finding } from "@/content/findings";

type Props = {
  finding: Finding;
};

export function LatestFindingStrip({ finding }: Props) {
  return (
    <aside className="latest-finding" aria-label="Latest finding">
      <Link href={`/findings/${finding.slug}`} className="latest-finding-inner">
        <span className="latest-finding-kicker">Latest</span>
        <span className="latest-finding-title">{finding.title}</span>
      </Link>
    </aside>
  );
}
