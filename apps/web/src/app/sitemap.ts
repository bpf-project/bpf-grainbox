import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://grainbox.easycasual.app";

  // Main pages (grainbox-owned)
  const mainPages = [
    "",
    "/login",
    "/join",
    "/meetings",
    // "/settings", // Vexa-origin, use /profile instead
  ];

  const pages = mainPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  return pages;
}

