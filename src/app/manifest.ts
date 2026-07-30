import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "결 GYEOL — 나·관계·올해의 흐름 리딩",
    short_name: "결 GYEOL",
    description: "나의 성향과 관계, 올해의 흐름을 알기 쉽게 정리하는 개인 리딩.",
    start_url: "/ko",
    scope: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#3f5142",
    lang: "ko",
    categories: ["lifestyle", "education"],
    icons: [
      // Must stay in step with the static icon file. The dynamic /icon route was
      // removed because it pulled a rasterizer into the worker bundle.
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
