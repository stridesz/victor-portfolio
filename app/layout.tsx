import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoryPanelProvider } from "@/components/StoryPanelContext";
import StoryPanel from "@/components/StoryPanel";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Victor Qi · The Ledger",
  description: "A chronological ledger of work, 2024–2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-paper text-ink font-sans">
        <StoryPanelProvider>
          {children}
          <StoryPanel />
        </StoryPanelProvider>
      </body>
    </html>
  );
}
