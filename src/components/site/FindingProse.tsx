import { classifyFindingParagraph } from "@/content/findings";

type Props = {
  text: string;
  tone?: "body" | "after";
};

export function FindingProse({ text, tone = "body" }: Props) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className={`finding-detail-body${tone === "after" ? " is-after" : ""}`}>
      {paragraphs.map((paragraph, index) => {
        const kind = classifyFindingParagraph(paragraph, index, tone);
        return (
          <p key={`${tone}-${index}`} className={`is-${kind}`}>
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
