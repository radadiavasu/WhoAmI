import Image from "next/image";
import { youtubeIdFromUrl, type Finding } from "@/content/findings";

type Props = {
  finding: Finding;
  priority?: boolean;
};

export function FindingMedia({ finding, priority = false }: Props) {
  const youtubeId = finding.video
    ? youtubeIdFromUrl(finding.video.url)
    : undefined;

  if (!finding.image && !finding.video) return null;

  return (
    <div className="finding-media">
      {finding.image ? (
        <figure className="finding-media-image">
          <Image
            src={finding.image}
            alt={finding.title}
            width={1280}
            height={720}
            sizes="(max-width: 720px) 100vw, 42rem"
            priority={priority}
          />
        </figure>
      ) : null}
      {finding.video ? (
        youtubeId ? (
          <div className="finding-media-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title={finding.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="finding-media-video-link">
            <a href={finding.video.url} rel="noreferrer" target="_blank">
              {finding.video.title}
            </a>
          </p>
        )
      ) : null}
    </div>
  );
}
