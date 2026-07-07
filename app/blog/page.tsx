import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { StatusPill } from "../components/StatusPill";

const categories = ["AI & operations", "entrepreneurship", "supply chain", "weird things worth writing down"];

export default function BlogPage() {
  return (
    <main className="site-shell page-shell">
      <SiteNav />

      <section className="section-pad page-hero" aria-labelledby="blog-title">
        <div className="container section-stack">
          <Link className="back-link" href="/">
            <ArrowLeft aria-hidden="true" size={16} /> Home
          </Link>
          <StatusPill tone="muted">Writing</StatusPill>
          <h1 id="blog-title">Notes</h1>
          <p>No notes published yet. The good ones take a minute.</p>
        </div>
      </section>

      <section className="section-pad section-pad--tight">
        <div className="container empty-state">
          <span>future index</span>
          <h2>The index is intentionally empty.</h2>
          <p>
            When there is something useful to say about AI, operations, entrepreneurship, supply chain, or whatever
            else refuses to leave my notes app, it can live here.
          </p>
          <div className="topic-list" aria-label="Future writing categories">
            {categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
          <Link className="inline-link" href="/#contact">
            Send a topic idea <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
