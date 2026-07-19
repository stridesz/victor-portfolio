"use client";

import { entries } from "@/data/entries";
import SmoothScroll from "@/components/SmoothScroll";
import EntrySection from "@/components/EntrySection";
import StoryPanel from "@/components/StoryPanel";
import { StoryPanelProvider } from "@/components/StoryPanelContext";

export default function Page() {
  return (
    <StoryPanelProvider>
      <SmoothScroll>
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          {/* Header */}
          <header className="flex items-baseline justify-between pt-10 md:pt-14">
            <div className="flex items-baseline gap-4">
              <h1 className="text-[32px] font-medium leading-none md:text-[40px]">
                Victor Qi
              </h1>
              <span className="text-[13px] text-meta md:text-sm">2026</span>
            </div>
            <nav className="flex gap-6 text-[13px] md:text-sm">
              <a href="#about" className="hover:text-meta transition-colors">
                About
              </a>
              <a
                href="https://www.linkedin.com/in/victor-qi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-meta transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="mailto:victorqi0707@gmail.com"
                className="hover:text-meta transition-colors"
              >
                Email
              </a>
            </nav>
          </header>

          {/* Index — plain text list, title + year */}
          <section aria-label="Index" className="mt-16 md:mt-24">
            <ol className="space-y-4 md:space-y-5">
              {entries.map((entry, i) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="w-6 text-[13px] text-meta">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-medium group-hover:text-meta transition-colors md:text-xl">
                        {entry.title}
                      </span>
                    </span>
                    <span className="text-[13px] text-meta md:text-sm">
                      {entry.year}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {/* Entries */}
          <main className="mt-20 space-y-20 pb-32 md:mt-28 md:space-y-28">
            {entries.map((entry) => (
              <EntrySection key={entry.id} entry={entry} />
            ))}
          </main>

          <footer className="border-t border-placeholder py-10 text-[13px] text-meta">
            Victor Qi 2026
          </footer>
        </div>
        <StoryPanel />
      </SmoothScroll>
    </StoryPanelProvider>
  );
}
