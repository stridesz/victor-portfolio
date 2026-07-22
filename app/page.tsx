import { entries } from "@/data/entries";
import EntrySection from "@/components/EntrySection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 md:px-10">
      <SiteHeader />

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
                  <span className="text-lg font-medium transition-colors group-hover:text-meta md:text-xl">
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
        {entries.map((entry, i) => (
          <EntrySection key={entry.id} entry={entry} priority={i === 0} />
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
