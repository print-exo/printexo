import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { BRAND_NAME } from "@/components/brand/logo";

/** Archivo variable (wght 100–900, wdth 62–125%) from the brand kit, SIL OFL. */
const archivo = localFont({
  src: "../../public/brand/05-typography/Archivo-Variable.ttf",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Browser-tab title only: capitalised by request. The logo and in-page copy stay lowercase (see brand.md). */
const TAB_NAME = BRAND_NAME.charAt(0).toUpperCase() + BRAND_NAME.slice(1);

export const metadata: Metadata = {
  title: { default: TAB_NAME, template: `%s · ${TAB_NAME}` },
  description: "Print-on-demand for online shops. Upload a design, list it on TikTok Shop or Shopee, and we print and ship every order. No inventory, no minimums.",
  applicationName: BRAND_NAME,
};

export const viewport: Viewport = { themeColor: "#0E2F2C" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
