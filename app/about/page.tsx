import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AboutPhotos from "@/components/AboutPhotos";
import AboutPlayer from "@/components/AboutPlayer";
import { introSections, education } from "@/data/about";

export const metadata: Metadata = {
  title: "About · Victor Qi",
  description:
    "Where Victor Qi is from, what he does now, and what he is looking for.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 md:px-10">
      <SiteHeader />

      <main className="mt-16 pb-32 md:mt-24">
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

        {/* Education — ledger-style metadata rows */}
        <section
          aria-label="Education"
          className="mt-16 border-t border-placeholder pt-10 md:mt-20"
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
          </dl>
        </section>

        {/* Photos */}
        <section
          aria-label="Photos"
          className="mt-16 border-t border-placeholder pt-10 md:mt-20"
        >
          <h2 className="text-[12px] uppercase tracking-wide text-meta">
            Photos
          </h2>
          <div className="mt-4 max-w-3xl">
            <AboutPhotos />
          </div>
        </section>

        {/* On repeat */}
        <section
          aria-label="On repeat"
          className="mt-16 border-t border-placeholder pt-10 md:mt-20"
        >
          <h2 className="text-[12px] uppercase tracking-wide text-meta">
            On repeat
          </h2>
          <div className="mt-4 max-w-xl">
            <AboutPlayer />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
