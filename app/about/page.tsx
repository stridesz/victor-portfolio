import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AboutPhotos from "@/components/AboutPhotos";
import AboutPlayer from "@/components/AboutPlayer";
import { introSections, education, scent, currentlyUpdated } from "@/data/about";

export const metadata: Metadata = {
  title: "About · Victor Qi",
  description:
    "Victor Qi. A running ledger of the things I've built and operated since fifth grade.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Victor Qi · The Ledger",
    description:
      "Victor Qi. A running ledger of the things I've built and operated since fifth grade.",
    url: "/about",
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
    title: "Victor Qi · The Ledger",
    description:
      "Victor Qi. A running ledger of the things I've built and operated since fifth grade.",
    images: ["/opengraph-image"],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 md:px-10">
      <SiteHeader />

      <main className="mt-16 pb-32 md:mt-24">
        {/* Top — intro blocks left, photos right on large screens */}
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h1 className="text-[32px] font-medium leading-none md:text-[40px]">
              What I&apos;m bout.
            </h1>

            {/* Intro — labeled blocks */}
            <div className="mt-12 space-y-10 md:mt-16 md:space-y-12">
              {introSections.map((section) => (
                <section
                  key={section.label}
                  aria-label={section.label}
                  className="border-t border-placeholder pt-6"
                >
                  <h2 className="text-[12px] uppercase tracking-wide text-meta">
                    {section.label}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>

          {/* Right rail — photos, then education */}
          <div>
            <section
              aria-label="Photos"
              className="border-t border-placeholder pt-10 lg:border-t-0 lg:pt-0"
            >
              <h2 className="text-[12px] uppercase tracking-wide text-meta">
                Photos
              </h2>
              <div className="mt-4">
                <AboutPhotos />
              </div>
            </section>

            {/* Education — ledger-style metadata rows */}
            <section
              aria-label="Education"
              className="mt-16 border-t border-placeholder pt-10"
            >
              <h2 className="text-[12px] uppercase tracking-wide text-meta">
                Education
              </h2>
              <dl className="mt-4 space-y-1 text-[13px] leading-relaxed md:text-sm">
                <div className="flex gap-2">
                  <dt className="text-meta">School</dt>
                  <dd>{education.school}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-meta">Major</dt>
                  <dd>{education.major}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-meta">Concentrations</dt>
                  <dd>{education.concentrations}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-meta">GPA</dt>
                  <dd>{education.gpa}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        {/* Currently — one section holding on-repeat, scent, and any future
            "current" slots; add a new grid cell rather than a new section. */}
        <section
          aria-label="Currently"
          className="mt-16 border-t border-placeholder pt-10 md:mt-20"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[12px] uppercase tracking-wide text-meta">
              Currently
            </h2>
            <span className="shrink-0 text-[12px] text-meta">
              Updated {currentlyUpdated}
            </span>
          </div>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
            <section aria-label="On repeat">
              <h3 className="text-[12px] uppercase tracking-wide text-meta">
                On repeat
              </h3>
              <div className="mt-5">
                <AboutPlayer />
              </div>
            </section>
            <section aria-label="Scent">
              <h3 className="text-[12px] uppercase tracking-wide text-meta">
                Scent
              </h3>
              <div className="mt-5 flex flex-col items-start gap-4">
                {scent.photo ? (
                  <span className="relative block h-40 w-40 shrink-0 overflow-hidden lg:h-56 lg:w-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scent.photo}
                      alt={scent.name}
                      className="h-full w-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="block h-40 w-40 shrink-0 bg-placeholder lg:h-56 lg:w-56" />
                )}
                <div className="text-[13px] leading-relaxed md:text-sm">
                  {scent.name ? (
                    <>
                      <p>{scent.name}</p>
                      {scent.house ? (
                        <p className="text-meta">{scent.house}</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-meta">Coming soon.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
