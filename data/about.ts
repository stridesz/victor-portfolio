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
  school: "Northeastern University '29",
  major: "Business Administration",
  concentrations: "Management & Supply Chain Management",
};

export type AboutPhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Tailwind aspect utility matching the source image dimensions (honest placeholder shape in the lightbox) */
  sizeClass: string;
  /** Optional emoji shown as this photo's indicator under the card. Falls back to a plain dot when omitted. */
  icon?: string;
};

// ---------------------------------------------------------------------------
// PHOTOS — awaiting Victor's final picks. Drop files under public/media/about/
// and add one entry per photo below (src, alt, caption, sizeClass matching the
// source dimensions, optional emoji icon for the indicator row).
// ---------------------------------------------------------------------------
export const aboutPhotos: AboutPhoto[] = [];

// Song slot: src and albumArt are intentionally empty (not yet supplied).
// The player renders fully but stays disabled until src points at a real
// audio file (e.g. "/media/about/on-repeat.mp3" under public/media/about/).
export const track = {
  title: "knocking",
  artist: "Ken Carson",
  src: "/media/about/knocking.mp3",
  albumArt: "/media/about/ken-carson-knocking.jpg",
};

// Scent slot: name, house, and photo are intentionally empty (not yet
// supplied). Drop the bottle photo under public/media/about/ and fill these in.
export const scent = {
  name: "Jasmine 17",
  house: "Le Labo",
  photo: "/media/about/le-labo-jasmine-17.png",
};
