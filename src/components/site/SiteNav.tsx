"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Map" },
  { href: "/findings", label: "Findings" },
  { href: "/about", label: "About" },
] as const;

type Props = {
  /** Compact overlay style for the map chrome. */
  overlay?: boolean;
};

export function SiteNav({ overlay = false }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={overlay ? "site-nav site-nav-overlay" : "site-nav"}
      aria-label="Site"
    >
      {LINKS.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/" || pathname.startsWith("/c/")
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={["site-nav-link", active ? "is-active" : ""]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
