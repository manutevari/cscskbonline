import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CSCSKB Online — CSC Shikohabad",
    short_name: "CSCSKB",
    description: "CSC services, verified scheme guidance, document tools and appointment access.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#06142d",
    theme_color: "#06142d",
    lang: "en-IN",
    categories: ["business", "education", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
