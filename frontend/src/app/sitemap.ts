import type { MetadataRoute } from "next";

const SITE_URL = "https://www.cscskb.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/jobs-exams",
    "/tata-water",
    "/privacy",
    "/document-tools",
  ];

  return paths.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
