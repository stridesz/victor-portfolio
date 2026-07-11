import Link from "next/link";

const navLinks = [
  { label: "Moments", href: "/moments" },
  { label: "Contact", href: "mailto:victorqi0707@gmail.com" },
];

export function SiteNav() {
  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="site-nav__wordmark" href="/" aria-label="Victor Qi home">
          Victor Qi
        </Link>
        <div className="site-nav__links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
