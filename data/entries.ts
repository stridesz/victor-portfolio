export type MediaSlot = {
  label: string;
  kind: "photo" | "video";
  caption: string;
  /** Tailwind aspect utility or explicit size classes for varied, honest placeholder shapes */
  sizeClass: string;
  /** Real media source (image or video). When absent, the slot renders as a placeholder. */
  src?: string;
  /** Poster image for video slots */
  poster?: string;
  /** External link (e.g. Instagram reel) shown in the media viewer */
  externalUrl?: string;
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
      {
        label: "QNCX alert × profit",
        kind: "photo",
        caption:
          "The RSA bot flags QNCX as its first big round-up candidate. Right: the profit from that trade.",
        sizeClass: "aspect-[1248/466] max-h-[50vh]",
        src: "/media/fractional-few/tff-diptych.png",
      },
      {
        label: "The Fractional Few reel",
        kind: "video",
        caption:
          "Reel from The Fractional Few Instagram — reverse splits, explained.",
        sizeClass: "aspect-[480/854] max-h-[50vh]",
        src: "/media/fractional-few/tff-reel.mp4",
        poster: "/media/fractional-few/tff-reel-poster.jpg",
        externalUrl: "https://www.instagram.com/reel/Da-96SERTmp/",
      },
    ],
  },
  {
    id: "tablr",
    title: "Tablr",
    role: "Co-founder",
    year: "2026",
    note: "Matches you with college students who share your interests, major, and vibe, then gives you a reason to actually show up.",
    link: "https://jointablr.com",
    mediaPlaceholders: [
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[16/10] max-h-[50vh]",
      },
      {
        label: "Photo 2 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[1/1] max-h-[50vh]",
      },
    ],
  },
  {
    id: "huaren-linen",
    title: "Huaren Linen",
    role: "Intern · Shenzhen",
    year: "Summer 2026",
    note: "Top U.S.-exporting linen company. Learned the business end to end, from how an order becomes fabric to how it becomes payment. Taught 100+ employees an AI fundamentals and agentic AI class, and attended Alibaba's AI Business Architecture program.",
    mediaPlaceholders: [
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[3/4] max-h-[50vh]",
      },
      {
        label: "Video 1 — insert here",
        kind: "video",
        caption: "Caption coming soon — what this video shows.",
        sizeClass: "aspect-[16/9] max-h-[50vh]",
      },
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
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[16/9] max-h-[50vh]",
      },
      {
        label: "Photo 2 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[4/5] max-h-[50vh]",
      },
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
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[4/3] max-h-[50vh]",
      },
      {
        label: "Photo 2 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[3/4] max-h-[50vh]",
      },
    ],
  },
  {
    id: "deca",
    title: "DECA",
    role: "Founder & President",
    year: "2024",
    note: "Founded my high school's DECA chapter after being underwhelmed by the school's business offerings. 30% of the class signed up in the first week; sent 3 people to ICDC in year one.",
    mediaPlaceholders: [
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[16/10] max-h-[50vh]",
      },
      {
        label: "Video 1 — insert here",
        kind: "video",
        caption: "Caption coming soon — what this video shows.",
        sizeClass: "aspect-[4/3] max-h-[50vh]",
      },
    ],
    specialThanks: "Special thanks to the founding officers and advisors.",
  },
  {
    id: "stride-retail",
    title: "Stride Retail LLC",
    role: "Founder",
    year: "",
    note: "Started reselling Supreme and sneakers as a 5th grader. Grew it into Stride Retail LLC, expanding into Amazon FBA, wholesale contacts, and ticket reselling. $280K peak year revenue.",
    mediaPlaceholders: [
      {
        label: "Photo 1 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[1/1] max-h-[50vh]",
      },
      {
        label: "Photo 2 — insert here",
        kind: "photo",
        caption: "Caption coming soon — what this photo shows.",
        sizeClass: "aspect-[16/10] max-h-[50vh]",
      },
    ],
  },
];
