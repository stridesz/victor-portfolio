import { ArrowUpRight } from "lucide-react";
import { socials } from "../data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="site-footer__eyebrow">Victor Qi</p>
        <p className="site-footer__quote">&ldquo;Choose for yourself, whichever decision you&rsquo;ll regret the least.&rdquo;</p>
      </div>
      <div className="site-footer__links" aria-label="Social links">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target={social.href.startsWith("http") ? "_blank" : undefined}
            rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {social.label} <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        ))}
      </div>
    </footer>
  );
}
