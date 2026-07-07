import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { StatusPill } from "../components/StatusPill";
import { proofPoints } from "../data/site";

const timeline = [
  "Northeastern business student focused on management, supply chain, AI, operations, and entrepreneurship.",
  "Built operator instincts through resale, subscription products, events, and campus-facing startup work.",
  "Long-term direction: help modernize the family linen/export business with stronger systems and sharper execution.",
];

export default function AboutPage() {
  return (
    <main className="site-shell page-shell">
      <SiteNav />

      <section className="section-pad page-hero" aria-labelledby="about-title">
        <div className="container about-layout">
          <div className="section-stack">
            <Link className="back-link" href="/">
              <ArrowLeft aria-hidden="true" size={16} /> Home
            </Link>
            <StatusPill tone="muted">About</StatusPill>
            <h1 id="about-title">A business student who likes when the system actually works.</h1>
            <p>
              I&apos;m Victor Qi, studying Business Administration at Northeastern and building toward the intersection
              of supply chain, AI, operations, and entrepreneurship. The thread is simple: understand how things move,
              then make them move better.
            </p>
          </div>
          <aside className="about-note">
            <span>operator note</span>
            <p>
              I care about polished products, clean handoffs, useful automation, and businesses where execution matters
              more than pitch-deck vocabulary.
            </p>
          </aside>
        </div>
      </section>

      <section className="section-pad section-pad--tight">
        <div className="container about-columns">
          <div className="timeline-card">
            <span>Background</span>
            {timeline.map((item, index) => (
              <div className="timeline-item" key={item}>
                <strong>0{index + 1}</strong>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="proof-grid proof-grid--stacked">
            {proofPoints.map((item) => (
              <article className="proof-card" key={item.label}>
                <p>{item.label}</p>
                <h3>{item.metric}</h3>
                <span>{item.description}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
