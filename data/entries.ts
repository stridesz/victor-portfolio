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
  org: string;
  year: string;
  metaNote?: string;
  mediaPlaceholders: MediaSlot[];
  storyText: string;
  specialThanks?: string;
};

export const entries: LedgerEntry[] = [
  {
    id: "the-fractional-few",
    title: "The Fractional Few",
    role: "Founder",
    org: "Independent",
    year: "2026",
    metaNote: "Includes RSA bot automation",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[4/3]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[3/4]" },
    ],
    storyText:
      "Placeholder narrative for The Fractional Few. Replace with the real account of the practice — the operators involved, the engagements taken on, and the RSA bot automation work that ran underneath it.",
  },
  {
    id: "tablr",
    title: "Tablr",
    role: "Co-founder",
    org: "Tablr",
    year: "2026",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[1/1]" },
    ],
    storyText:
      "Placeholder narrative for Tablr. Replace with the real account of what was built, who it served, and what came of it.",
  },
  {
    id: "huaren-linen",
    title: "Huaren Linen",
    role: "AI/ERP Intern",
    org: "Huaren Linen",
    year: "Summer 2026",
    metaNote: "Shenzhen",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[3/4]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[16/9]" },
    ],
    storyText:
      "Placeholder narrative for Huaren Linen. Replace with notes on the AI/ERP work in Shenzhen — the systems touched, the people, the factory floor.",
  },
  {
    id: "12-pell",
    title: "12 Pell",
    role: "Intern",
    org: "TikTok",
    year: "2025",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/9]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[4/5]" },
    ],
    storyText:
      "Placeholder narrative for 12 Pell. Replace with the story of the internship inside TikTok — the team, the work, the barbershop.",
  },
  {
    id: "stride-retail",
    title: "Stride Retail",
    role: "Founder",
    org: "Stride Retail",
    year: "2025",
    metaNote: "$280K peak year",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[1/1]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[16/10]" },
    ],
    storyText:
      "Placeholder narrative for Stride Retail. Replace with the account of the operation that reached a $280K peak year — sourcing, selling, and what it taught.",
  },
  {
    id: "swipe-signals",
    title: "Swipe Signals",
    role: "Founder",
    org: "Swipe Signals",
    year: "2024",
    metaNote: "$35 MRR",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[4/3]" },
      { label: "Photo 2 — insert here", kind: "photo", sizeClass: "aspect-[3/4]" },
    ],
    storyText:
      "Placeholder narrative for Swipe Signals. Replace with the honest story of a product that peaked at $35 MRR — and why that still counts.",
  },
  {
    id: "deca",
    title: "DECA",
    role: "Founder & President",
    org: "DECA",
    year: "2024",
    metaNote: "~30% of class signed up",
    mediaPlaceholders: [
      { label: "Photo 1 — insert here", kind: "photo", sizeClass: "aspect-[16/10]" },
      { label: "Video 1 — insert here", kind: "video", sizeClass: "aspect-[4/3]" },
    ],
    storyText:
      "Placeholder narrative for DECA. Replace with how the chapter was founded and grew to roughly a third of the class signing up.",
    specialThanks: "Special thanks to the founding officers and advisors.",
  },
];
