export type SocialLink = {
  label: string;
  href: string;
};

export type Project = {
  name: string;
  logo: string;
  logoAlt: string;
  href: string;
  status: string;
  description: string;
  tags: string[];
  tint: string;
};

export type ProofPoint = {
  label: string;
  metric: string;
  description: string;
};

export const socials: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/victor-qi/" },
  { label: "Instagram", href: "https://www.instagram.com/victor.qii/" },
  { label: "X", href: "https://x.com/stridesoles" },
  { label: "Email", href: "mailto:victorqi0707@gmail.com" },
];

export const projects: Project[] = [
  {
    name: "Tablr",
    logo: "/projects/tablr-logo.png",
    logoAlt: "Tablr logo",
    href: "https://jointablr.com",
    status: "Current",
    description:
      "A social dining concept for students, focused on turning meals into easier ways to meet people and build real campus connections.",
    tags: ["social dining", "student experiences", "consumer startup"],
    tint: "rgba(15, 223, 111, 0.06)",
  },
  {
    name: "The Fractional Few",
    logo: "/projects/fractional-few-logo.png",
    logoAlt: "The Fractional Few logo",
    href: "https://whop.com/the-fractional-few",
    status: "Current",
    description:
      "A market-research community focused on reverse stock splits and the information gaps around a niche public-markets setup.",
    tags: ["markets", "research", "community"],
    tint: "rgba(26, 92, 46, 0.06)",
  },
];

export const proofPoints: ProofPoint[] = [
  {
    label: "Stride Retail LLC",
    metric: "$300K peak yearly revenue",
    description: "Built and operated a sneaker resale business from sourcing through fulfillment.",
  },
  {
    label: "Swipe Signals",
    metric: "$300K ARR · 150+ 5★ reviews",
    description: "Co-founded a subscription product with real customers, support load, and retention pressure.",
  },
  {
    label: "Huaren Linen",
    metric: "AI/ERP internship · 100+ staff taught",
    description:
      "Worked on AI and ERP modernization inside the family linen/export business and taught AI fundamentals to staff.",
  },
  {
    label: "12 Pell",
    metric: "Intern · Event Management Team",
    description: "Supported operations and event execution for a culture-forward retail and community brand.",
  },
];
