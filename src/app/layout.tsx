import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { SwRegister } from "@/components/pwa/sw-register";
import "./globals.css";

// Designed by the Braille Institute for low-vision readers: many of our users are elderly.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  // Next has no metrics to build a size-adjusted fallback for this font.
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "zDoma",
  description: "Spremljanje okrevanja na domu po odpustu iz bolnišnice",
  applicationName: "zDoma",
  // iPhone "Add to Home Screen": opens full screen with this name under the icon.
  appleWebApp: { capable: true, title: "zDoma", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1d7d3e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sl"
      className={`${atkinson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
