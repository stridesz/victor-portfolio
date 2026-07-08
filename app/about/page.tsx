import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { StatusPill } from "../components/StatusPill";

const personalNotes = [
  {
    label: "Where I came from",
    title: "Hong Kong to North Carolina",
    body: "I was born in Hong Kong and moved to Raleigh when I was a kid. That mix still shapes how I see things: part immigrant kid, part North Carolina, part always-looking-for-the-next-place.",
  },
  {
    label: "First year",
    title: "New York was a reset",
    body: "I spent my first year of college in NYC through Northeastern’s program. It was a good kind of uncomfortable. Different pace, different people, and a useful reminder that I like being around motion.",
  },
  {
    label: "What I keep exploring",
    title: "Agentic AI feels early",
    body: "I’ve spent a lot of time exploring agentic AI because the use cases already feel enormous: coding, research, operations, personal systems, all of it. The interesting part is how much more useful it can become once agents are reliable enough to trust with real work.",
  },
  {
    label: "Taste",
    title: "Kanye is the artist",
    body: "Kanye West is my favorite artist of all time. I’ve listened to every song countless times, and it honestly feels like I’ve lived another life through the music.",
  },
  {
    label: "Teams",
    title: "Sixers and Eagles",
    body: "I’m a big Sixers fan and an Eagles fan too, which means I’ve developed a very specific tolerance for hope, stress, and talking myself into next year.",
  },
  {
    label: "Right now",
    title: "Open-ended on purpose",
    body: "I’m excited to see what I get into next. That sounds vague, but it’s also true. The best things I’ve done usually started as curiosity before they became anything serious.",
  },
];

export default function AboutPage() {
  return (
    <main className="site-shell page-shell">
      <SiteNav />

      <section className="section-pad page-hero" aria-labelledby="about-title">
        <div className="container about-layout about-layout--personal">
          <div className="section-stack">
            <Link className="back-link" href="/">
              <ArrowLeft aria-hidden="true" size={16} /> Home
            </Link>
            <StatusPill tone="muted">About</StatusPill>
            <h1 id="about-title">A little less résumé. A little more me.</h1>
            <div className="about-prose">
              <p>
                I’m Victor. I study business at Northeastern, but this page is not really about making the cleanest
                possible pitch for myself. The home page already does enough of that.
              </p>
              <p>
                I like building things, following weird interests until they become useful, and noticing where systems
                feel clunky. Lately, a lot of that attention has gone toward agentic AI. It feels early in the best way:
                useful already, still rough, and obviously nowhere near its ceiling.
              </p>
              <p>
                Outside of that, I’m usually somewhere between music, sports, school, whatever I’m building, and trying
                to figure out what kind of work will still feel worth doing when the novelty wears off.
              </p>
            </div>
          </div>

          <aside className="about-photo-card" aria-label="New York courtyard photo">
            <Image
              src="/about-photo.jpg"
              alt="A New York courtyard framed by brick buildings, fire escapes, and a small outdoor setup."
              width={1200}
              height={1600}
              className="about-photo-card__image"
              priority
            />
            <div className="about-photo-card__caption">
              <span>currently</span>
              <p>Somewhere between Raleigh, New York, Hong Kong, and whatever comes next.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad section-pad--tight">
        <div className="container personal-grid">
          {personalNotes.map((note) => (
            <article className="personal-card" key={note.title}>
              <span>{note.label}</span>
              <h2>{note.title}</h2>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
