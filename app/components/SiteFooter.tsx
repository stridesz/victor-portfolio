import { ArrowUpRight } from "lucide-react";

const links = [{ label: "LinkedIn", href: "https://www.linkedin.com/in/victor-qi/" }, { label: "Email", href: "mailto:victorqi0707@gmail.com" }];
export function SiteFooter() { return <footer className="site-footer"><div className="site-footer__inner"><p>Victor Qi</p><div className="site-footer__links">{links.map(link=><a key={link.label} href={link.href}>{link.label}<ArrowUpRight aria-hidden="true" size={14}/></a>)}</div></div></footer>; }
