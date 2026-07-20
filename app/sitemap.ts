import type { MetadataRoute } from "next";

const baseUrl = "https://www.victorqi.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl },
    { url: `${baseUrl}/about` },
  ];
}