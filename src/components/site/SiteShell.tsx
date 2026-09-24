import Link from "next/link";
import { WhoAmILockup } from "@/components/brand/WhoAmILockup";
import { SiteNav } from "@/components/site/SiteNav";

type Props = {
  children: React.ReactNode;
  title: string;
  lead: string;
};

export function SiteShell({ children, title, lead }: Props) {
  return (
    <div className="site-shell">
      <header className="site-shell-header">
        <div className="site-shell-brand">
          <Link href="/" className="site-shell-brand-link">
            <WhoAmILockup compact />
          </Link>
          <SiteNav />
        </div>
        <div className="site-shell-intro">
          <h1 className="site-shell-title">{title}</h1>
          <p className="site-shell-lead">{lead}</p>
        </div>
      </header>
      <main className="site-shell-main">{children}</main>
    </div>
  );
}
