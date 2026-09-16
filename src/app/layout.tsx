import { Figtree, Fraunces } from "next/font/google";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Who Am I — place yourself in AI",
  description:
    "An interactive living tree of Generative AI concepts. Find where an idea sits and what to explore next.",
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
      </body>
    </html>
  );
}
