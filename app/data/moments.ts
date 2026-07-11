export type Moment = {
  id: string;
  src: string;
  alt: string;
  date: string;
  location?: string;
  caption?: string;
};

export const moments: Moment[] = [];