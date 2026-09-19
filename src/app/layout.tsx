import { Figtree, Fraunces } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const siteUrl = "https://who-am-i-ebon.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Who Am I",
    template: "%s · Who Am I",
  },
  description: "Place yourself in AI.",
  applicationName: "Who Am I",
  openGraph: {
    title: "Who Am I",
    description: "Place yourself in AI.",
    url: siteUrl,
    siteName: "Who Am I",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Who Am I",
    description: "Place yourself in AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="font-body min-h-full antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
