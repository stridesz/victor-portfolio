export type MediaSlot = {
  label: string;
  kind: "photo" | "video";
  /** Tailwind aspect utility or explicit size classes for varied, honest placeholder shapes */
  sizeClass: string;
};

export type LedgerEntry = {
  id: string;
  title: string;
  role: string;
  year: string;
  note: string;
  link?: string;
  mediaPlaceholders: MediaSlot[];
  specialThanks?: string;
};

export const entries: LedgerEntry[] = [
  {
    id: "fractional-few",
    title: "The Fractional Few",
    role: "Co-founder",
    year: "2026",
    note: "Paid membership community watching reverse-split stocks. Built the automation that tracks and analyzes SEC filings for it.",
    link: "https://whop.com/the-fractional-few",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10] max-h-[50vh]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[4/3] max-h-[50vh]" },
    ],
  },
  {
    id: "tablr",
    title: "Tablr",
    role: "Co-founder",
    year: "2026",
    note: "Matches you with college students who share your interests, major, and vibe — then gives you a reason to actually show up.",
    link: "https://jointablr.com",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10] max-h-[50vh]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[1/1] max-h-[50vh]" },
    ],
  },
  {
    id: "huaren-linen",
    title: "Huaren Linen",
    role: "Intern · Shenzhen",
    year: "Summer 2026",
    note: "Top U.S.-exporting linen company. Learned the business end to end — how an order becomes fabric becomes payment — taught 100+ employees an AI fundamentals & agentic AI class, and attended Alibaba's AI Business Architecture program.",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[3/4] max-h-[50vh]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[16/9] max-h-[50vh]" },
    ],
  },
  {
    id: "12-pell",
    title: "12 Pell",
    role: "Intern",
    year: "2025",
    note: "Intern & event management for a barbershop/community spot with 2M+ TikTok followers. Ask about the Ginger Fringe Incident.",
    link: "https://www.tiktok.com/@12pell",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/9] max-h-[50vh]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[4/5] max-h-[50vh]" },
    ],
  },
  {
    id: "swipe-signals",
    title: "Swipe Signals",
    role: "Co-founder",
    year: "2024",
    note: "Bot reselling group turned ticket reselling group. First 100 memberships sold out in 3 minutes. 150+ five-star reviews. $35K peak MRR.",
    link: "https://whop.com/swipesignals",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[4/3] max-h-[50vh]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[3/4] max-h-[50vh]" },
    ],
  },
  {
    id: "deca",
    title: "DECA",
    role: "Founder & President",
    year: "2024",
    note: "Founded my high school's DECA chapter after being underwhelmed by the school's business offerings. 30% of the class signed up in the first week; sent 3 people to ICDC in year one.",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10] max-h-[50vh]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[4/3] max-h-[50vh]" },
    ],
    specialThanks: "Special thanks to the founding officers and advisors.",
  },
  {
    id: "stride-retail",
    title: "Stride Retail",
    role: "Founder",
    year: "",
    note: "Started reselling Supreme and sneakers as a 5th grader. Grew it into Stride Retail LLC — Amazon FBA, wholesale contacts, ticket reselling. $280K peak year revenue.",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[1/1] max-h-[50vh]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[16/10] max-h-[50vh]" },
    ],
  },
];
