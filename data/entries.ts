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
  /** Displayed label for the external media source */
  externalLabel?: string;
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
          "Reel from The Fractional Few Instagram. Reverse splits, explained.",
        sizeClass: "aspect-[480/854] max-h-[50vh]",
        src: "/media/fractional-few/tff-reel.mp4",
        poster: "/media/fractional-few/tff-reel-poster.jpg",
        externalUrl: "https://www.instagram.com/reel/Da-96SERTmp/",
        externalLabel: "Watch on Instagram",
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
        label: "Tablr's first build",
        kind: "photo",
        caption:
          "Finishing the first version of Tablr late at night in my freshman dorm in New York City.",
        sizeClass: "aspect-[1097/673] max-h-[50vh]",
        src: "/media/tablr/tablr-dorm-build.png",
      },
      {
        label: "Testing Tablr in Washington Square Park",
        kind: "photo",
        caption:
          "Andrew and I testing Tablr in Washington Square Park by asking strangers if they would grab a slice of pizza with us.",
        sizeClass: "aspect-[647/861] max-h-[50vh]",
        src: "/media/tablr/tablr-washington-square-testing.png",
      },
    ],
  },
  {
    id: "huaren-linen",
    title: "Huaren Linen",
    role: "Intern · Shenzhen",
    year: "Summer 2026",
    note: "Shadowed each step of Huaren Linen's order-to-cash process, from fabric production through payment, to identify where AI could make the operation faster, clearer, and more reliable.",
    mediaPlaceholders: [
      {
        label: "Alibaba AI Business Architecture class",
        kind: "photo",
        caption:
          "At Alibaba's Shenzhen headquarters for an AI Business Architecture class, learning how large companies are turning AI into an operating layer for their businesses.",
        src: "/media/huaren-linen/alibaba-shenzhen.jpeg",
        sizeClass: "aspect-[1280/960] max-h-[50vh]",
      },
      {
        label: "Huaren Linen at Texworld NYC",
        kind: "photo",
        caption:
          "Huaren Linen fabric samples on display while I helped run the booth at Texworld NYC in the Javits Center during winter break of my freshman year.",
        src: "/media/huaren-linen/texworld-fabric-samples.jpeg",
        sizeClass: "aspect-[800/1067] max-h-[50vh]",
      },
    ],
  },
  {
    id: "12-pell",
    title: "12 Pell",
    role: "Intern",
    year: "2025",
    note: "Event management and team coordination for a barbershop and community space with 2M+ TikTok followers. You might know them from the Ginger Fringe Incident.",
    link: "https://www.tiktok.com/@12pell",
    mediaPlaceholders: [
      {
        label: "Korean K9 Rescue × Molly Tea adoption event",
        kind: "photo",
        caption:
          "Helping run a 12 Pell adoption event with Korean K9 Rescue and Molly Tea. Three dogs found homes, with free tea for everyone.",
        src: "/media/12-pell/korean-k9-molly-tea-adoption.jpg",
        sizeClass: "aspect-[2160/2880] max-h-[50vh]",
      },
      {
        label: "Men in Black Halloween",
        kind: "photo",
        caption:
          "Halloween night during freshman year, pregaming at 12 Pell with pepperoni pizza. Theme: Men in Black.",
        src: "/media/12-pell/men-in-black-halloween.jpg",
        sizeClass: "aspect-[2160/2880] max-h-[50vh]",
      },
    ],
  },
  {
    id: "deca",
    title: "DECA",
    role: "Founder & President",
    year: "2024",
    note: "Founded my high school's DECA chapter after being underwhelmed by the school's business offerings. 30% of the class signed up in the first week; sent 3 people to ICDC in year one.",
    link: "https://www.ravenscroft.org/our-community/news/story-page/~board/news/post/ravens-accelerate-future-paths-with-shuford-and-deca",
    mediaPlaceholders: [
      {
        label: "DECA progression of engagement",
        kind: "photo",
        caption:
          "DECA's Progression of Engagement guide, the original roadmap we used to build Ravenscroft's chapter from scratch.",
        src: "/media/deca/progression-of-engagement.jpg",
        sizeClass: "aspect-[2880/2160] max-h-[50vh]",
      },
      {
        label: "Ravenscroft's first DECA conference",
        kind: "photo",
        caption:
          "Walking into Ravenscroft School's first DECA conference as a chapter.",
        src: "/media/deca/first-conference.jpg",
        sizeClass: "aspect-[2160/2880] max-h-[50vh]",
      },
    ],
    specialThanks: "Special thanks to the founding officers and advisors.",
  },
  {
    id: "swipe-signals",
    title: "Swipe Signals",
    role: "Co-founder",
    year: "2021–2024",
    note: "Bot reselling group turned ticket reselling group. First 100 memberships sold out in 3 minutes. 150+ five-star reviews. $35K peak MRR.",
    link: "https://whop.com/swipesignals",
    mediaPlaceholders: [
      {
        label: "Finding out I was 13",
        kind: "photo",
        caption:
          "My co-founder finding out I was 13, after already offering me co-ownership.",
        sizeClass: "aspect-[1148/1370] max-h-[50vh]",
        src: "/media/swipe-signals/cofounder-finds-out-age.png",
        externalUrl: "https://x.com/stridesoles/status/1407861544277348356/photo/1",
        externalLabel: "View on X",
      },
      {
        label: "Early Access Launch",
        kind: "photo",
        caption: "The start of something cool. We had it jumping out the gate.",
        sizeClass: "aspect-[605/596] max-h-[50vh]",
        src: "/media/swipe-signals/early-access-launch.png",
      },
    ],
  },
  {
    id: "stride-retail",
    title: "Stride Retail LLC",
    role: "Founder",
    year: "2020–2024",
    note: "Started reselling Supreme and sneakers as a 5th grader. Grew it into Stride Retail LLC, expanding into Amazon FBA, wholesale contacts, and ticket reselling. $280K peak year revenue.",
    mediaPlaceholders: [
      {
        label: "Photo 1 · insert here",
        kind: "photo",
        caption: "Caption coming soon. What this photo shows.",
        sizeClass: "aspect-[1/1] max-h-[50vh]",
      },
      {
        label: "Photo 2 · insert here",
        kind: "photo",
        caption: "Caption coming soon. What this photo shows.",
        sizeClass: "aspect-[16/10] max-h-[50vh]",
      },
    ],
  },
];
