import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AmbientGrid } from "./components/AmbientGrid";
import { HeroIntroBurst } from "./components/HeroIntroBurst";
import { ScrollMood } from "./components/ScrollMood";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://victor-portfolio-chi.vercel.app"),
  title: "Victor Qi",
  description:
    "Victor Qi — Northeastern University Class of 2029, Business Administration with Supply Chain Management and Management concentrations.",
  openGraph: {
    title: "Victor Qi",
    description:
      "Northeastern University Class of 2029. Business Administration with Supply Chain Management and Management concentrations.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Victor Qi",
    description: "Northeastern University Class of 2029 · Business Administration.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body>
        <AmbientGrid />
        <HeroIntroBurst />
        <ScrollMood />
        {children}
      </body>
    </html>
  );
}
