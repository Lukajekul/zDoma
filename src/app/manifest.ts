import type { MetadataRoute } from "next";

/** Lets zDoma be added to the home screen (needed for notifications on iPhone, T-39/T-36). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "zDoma – okrevanje doma",
    short_name: "zDoma",
    description: "Spremljanje okrevanja na domu po odpustu iz bolnišnice",
    lang: "sl",
    dir: "ltr",
    // Sends each user to their own home: patient, family, staff or student (T-88).
    start_url: "/start",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d7d3e",
    categories: ["health", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
