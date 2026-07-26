import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "InnerArc — Personal Pattern Intelligence",
    short_name: "InnerArc",
    description: "Symbolic self-reflection connected to real-world outcome reviews.",
    start_url: "/ko",
    scope: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#3f5142",
    lang: "ko",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
