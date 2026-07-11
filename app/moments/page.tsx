import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import { StatusPill } from "../components/StatusPill";
import { moments } from "../data/moments";

export default function MomentsPage() {
  return (
    <main className="site-shell page-shell">
      <SiteNav />
      <section className="section-pad page-hero" aria-labelledby="moments-title">
        <div className="container section-stack">
          <Link className="back-link" href="/">
            <ArrowLeft aria-hidden="true" size={16} /> Home
          </Link>
          <StatusPill tone="muted">Photo journal</StatusPill>
          <h1 id="moments-title">Moments</h1>
          <p>A place for photographs and brief notes from places I have been.</p>
        </div>
      </section>
      <section className="section-pad section-pad--tight">
        <div className="container">
          {moments.length === 0 ? (
            <div className="moments-empty">
              <span>Nothing here yet</span>
              <p>Photographs will appear here when I have some I want to share.</p>
            </div>
          ) : (
            <div className="moments-grid">
              {moments.map((moment) => (
                <figure className="moment" key={moment.id}>
                  <Image src={moment.src} alt={moment.alt} width={1200} height={900} />
                  <figcaption>
                    <time dateTime={moment.date}>{moment.date}</time>
                    {moment.location && <span>{moment.location}</span>}
                    {moment.caption && <p>{moment.caption}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}