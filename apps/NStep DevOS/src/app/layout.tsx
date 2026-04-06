import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

const headline = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NSS DevOS",
  description:
    "Development Orchestration System for planning tasks, handing them to a coding agent, and verifying the result.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headline.variable} ${mono.variable} antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.22),_transparent_36%),linear-gradient(180deg,_#04131a_0%,_#08151d_48%,_#0f172a_100%)] text-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}
