import type { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/components/brand/logo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: BRAND_TAGLINE,
    start_url: "/",
    display: "standalone",
    theme_color: "#0E2F2C",
    background_color: "#0E2F2C",
    icons: [
      { src: "/brand/04-web-icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/04-web-icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/04-web-icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
