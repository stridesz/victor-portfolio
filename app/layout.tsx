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

const title = "Victor Qi · The Ledger";
const description =
  "Victor Qi. A running ledger of the things I've built and operated since fifth grade.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.victorqi.me"),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Victor Qi · The Ledger",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Victor Qi.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Victor Qi",
  url: "https://www.victorqi.me",
  sameAs: ["https://www.linkedin.com/in/victor-qi"],
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "Northeastern University",
  },
  knowsAbout: [
    "AI",
    "entrepreneurship",
    "operations",
    "supply chain management",
    "e-commerce",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-paper text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <StoryPanelProvider>
          {children}
          <StoryPanel />
        </StoryPanelProvider>
      </body>
    </html>
  );
}
