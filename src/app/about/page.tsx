import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { SITE_AUTHOR } from "@/content/author";

export const metadata: Metadata = {
  title: "About",
  description: "Vasu Radadiya — why Who Am I exists, and how Findings works.",
};

export default function AboutPage() {
  return (
    <SiteShell
      title="About"
      lead="Who Am I is a living map of AI ideas — so you can place a word you heard, not drown in another feed."
    >
      <div className="about-author">
        <Image
          src={SITE_AUTHOR.photo}
          alt={SITE_AUTHOR.name}
          width={160}
          height={160}
          className="about-author-photo"
          priority
        />
        <div>
          <p className="about-author-name">{SITE_AUTHOR.name}</p>
          <p className="about-author-role">Building Who Am I · learning in public</p>
        </div>
      </div>
      <div className="about-prose">
        <p>
          AI news hits like weather: model names, acronyms, demo clips. The hard
          part is not reading more — it is knowing where a thing sits.
        </p>
        <p>
          The <Link href="/">map</Link> is the product. Canopy for Generative AI
          ideas you meet every day; roots for the older ground those ideas grow
          from. Tap a node, see neighbors, follow a short orientation path.
        </p>
        <p>
          <Link href="/findings">Findings</Link> is where I write after I learn
          something and test it myself. Not a dump of links I saved and forgot.
          Real notes: what I tried, what actually clicked, where it sits on the
          tree, and what I used. That helps me share the learning, keep a
          day-by-day trail anyone (including a recruiter) can read, help others
          place the idea, and let me reopen my own work when I need it.
        </p>
        <p>
          A longer piece is still a Finding — I mark it Research. Images and
          video go on the note when they show the work. The first real note is
          Edge0: MoE plus a disk working set, not a magic tiny 35B.
        </p>
      </div>
    </SiteShell>
  );
}
