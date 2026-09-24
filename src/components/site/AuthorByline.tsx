import Image from "next/image";
import Link from "next/link";
import { SITE_AUTHOR } from "@/content/author";

type Props = {
  compact?: boolean;
};

export function AuthorByline({ compact = false }: Props) {
  return (
    <Link href={SITE_AUTHOR.href} className="author-byline">
      <Image
        src={SITE_AUTHOR.photo}
        alt=""
        width={compact ? 32 : 40}
        height={compact ? 32 : 40}
        className="author-byline-photo"
      />
      <span className="author-byline-text">
        <span className="author-byline-name">{SITE_AUTHOR.name}</span>
        {compact ? null : (
          <span className="author-byline-hint">About the author</span>
        )}
      </span>
    </Link>
  );
}
