import type { MetadataRoute } from "next";

/** Lets zDoma be added to the home screen (needed for notifications on iPhone, T-39/T-36). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "zDoma",
    short_name: "zDoma",
    description: "Spremljanje okrevanja na domu po odpustu iz bolnišnice",
    lang: "sl",
    start_url: "/patient",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#004a9f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
