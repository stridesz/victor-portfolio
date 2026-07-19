export type IntroSection = {
  label: string;
  body: string;
};

export const introSections: IntroSection[] = [
  {
    label: "Where I'm From",
    body: "Born in Hong Kong, raised in Raleigh, North Carolina. Spent my first college year in New York City.",
  },
  {
    label: "What I used to Do",
    body: "Started selling Supreme and sneakers as a 5th grader, which grew into Stride Retail LLC. Co-founded Swipe Signals at 13. Founded my high school's DECA chapter.",
  },
  {
    label: "What I Do Now",
    body: "Business Administration at Northeastern, concentrating in Management and Supply Chain Management. Co-founded Tablr and The Fractional Few. Most recently interned in Shenzhen at Huaren Linen.",
  },
  {
    label: "Where I'm At Now",
    body: "Boston, for my first semester on main campus. Usually building something on the side.",
  },
];

export const education = {
  school: "Northeastern University",
  major: "Business Administration",
  concentrations: "Management & Supply Chain Management",
};

export type AboutPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Tailwind aspect utility matching the source image dimensions (honest placeholder shape in the lightbox) */
  sizeClass: string;
};

export type PhotoCategory = {
  id: string;
  label: string;
  photos: AboutPhoto[];
};

// ---------------------------------------------------------------------------
// TEMPORARY STAND-IN PHOTOS
// These reuse existing ledger images purely so the photos card demonstrates
// real behavior (crossfade, categories, lightbox). Victor: replace each
// photo's src/alt/caption/sizeClass, and add or remove photos per category,
// once final photos are chosen. Drop the files under public/media/about/ and
// point src at them (e.g. "/media/about/my-photo.jpg").
// ---------------------------------------------------------------------------
export const photoCategories: PhotoCategory[] = [
  {
    id: "everything",
    label: "Everything",
    photos: [
      {
        src: "/media/tablr/tablr-dorm-build.png",
        alt: "Finishing the first version of Tablr in a freshman dorm",
        caption:
          "Finishing the first version of Tablr late at night in my freshman dorm in New York City.",
        sizeClass: "aspect-[1097/673] max-h-[50vh]",
      },
      {
        src: "/media/huaren-linen/texworld-fabric-samples.jpeg",
        alt: "Huaren Linen fabric samples at Texworld NYC",
        caption:
          "Huaren Linen fabric samples on display at Texworld NYC in the Javits Center.",
        sizeClass: "aspect-[800/1067] max-h-[50vh]",
      },
      {
        src: "/media/12-pell/men-in-black-halloween.jpg",
        alt: "Men in Black themed Halloween night at 12 Pell",
        caption:
          "Halloween night during freshman year at 12 Pell. Theme: Men in Black.",
        sizeClass: "aspect-[2160/2880] max-h-[50vh]",
      },
    ],
  },
  {
    id: "wiggles",
    label: "Wiggles",
    photos: [
      {
        src: "/media/12-pell/men-in-black-halloween.jpg",
        alt: "Men in Black themed Halloween night at 12 Pell",
        caption:
          "Halloween night during freshman year at 12 Pell. Theme: Men in Black.",
        sizeClass: "aspect-[2160/2880] max-h-[50vh]",
      },
      {
        src: "/media/tablr/tablr-dorm-build.png",
        alt: "Finishing the first version of Tablr in a freshman dorm",
        caption:
          "Finishing the first version of Tablr late at night in my freshman dorm in New York City.",
        sizeClass: "aspect-[1097/673] max-h-[50vh]",
      },
    ],
  },
];

// Song slot: src and albumArt are intentionally empty (not yet supplied).
// The player renders fully but stays disabled until src points at a real
// audio file (e.g. "/media/about/on-repeat.mp3" under public/media/about/).
export const track = {
  title: "Song title",
  artist: "Artist",
  src: "",
  albumArt: "",
};
