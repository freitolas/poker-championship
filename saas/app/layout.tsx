import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokerHost — Professional Poker Tournament Management",
  description: "Run better poker nights. Timers, blinds, player tracking, smart home automation, and AI-generated chronicles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
