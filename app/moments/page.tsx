import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";

import { moments } from "../data/moments";

export default function MomentsPage() {
  const photographCount = `${moments.length} ${moments.length === 1 ? "photograph" : "photographs"}`;

  return (
    <main className="site-shell page-shell">
      <SiteNav />
      <section className="section-pad page-hero" aria-labelledby="moments-title">
        <div className="container section-stack">
          <Link className="back-link" href="/">
            <ArrowLeft aria-hidden="true" size={16} /> Home
          </Link>
          <span className="editorial-label">Photo journal / {photographCount}</span>
          <h1 id="moments-title">Moments</h1>
          <p>A place for photographs and brief notes from places I have been.</p>
        </div>
      </section>
      <section className="section-pad section-pad--tight">
        <div className="container">
          {moments.length === 0 ? (
            <div className="moments-empty" aria-label="Empty photo journal">
              <span>Frame 00 / Nothing here yet</span>
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