import type { DesignLayer, PrintArea } from "@/lib/domain/types";

/**
 * Starter templates, defined relative to the print area so they adapt to
 * every product. Fonts are common system fonts to avoid licensing issues.
 */
export interface Template {
  id: string;
  name: string;
  build: (area: PrintArea) => Omit<DesignLayer, "id" | "height">[];
}

const centerBox = (area: PrintArea, widthRatio: number) => {
  const width = area.widthIn * widthRatio;
  return { x: (area.widthIn - width) / 2, width };
};

export const TEMPLATES: Template[] = [
  {
    id: "name",
    name: "Personalised name",
    build: (a) => [
      { kind: "text", ...centerBox(a, 0.8), y: a.heightIn * 0.36, rotation: 0, text: "Your Name", fontFamily: "Georgia", fontStyle: "italic", fontSize: Math.round(a.heightIn * 9), fill: "#14532d", align: "center" },
      { kind: "text", ...centerBox(a, 0.8), y: a.heightIn * 0.58, rotation: 0, text: "stay hydrated", fontFamily: "Arial", fontSize: Math.round(a.heightIn * 3.2), fill: "#4d7c0f", align: "center" },
    ],
  },
  {
    id: "quote",
    name: "Bold quote",
    build: (a) => [
      { kind: "text", ...centerBox(a, 0.8), y: a.heightIn * 0.3, rotation: 0, text: "BUT FIRST,\nCOFFEE", fontFamily: "Impact", fontSize: Math.round(a.heightIn * 8), fill: "#1c1917", align: "center" },
    ],
  },
  {
    id: "brand",
    name: "Brand + tagline",
    build: (a) => [
      { kind: "text", ...centerBox(a, 0.8), y: a.heightIn * 0.34, rotation: 0, text: "Brand Name", fontFamily: "Trebuchet MS", fontStyle: "bold", fontSize: Math.round(a.heightIn * 7.5), fill: "#7c2d12", align: "center" },
      { kind: "text", ...centerBox(a, 0.8), y: a.heightIn * 0.55, rotation: 0, text: "EST. 2026 · JAKARTA", fontFamily: "Courier New", fontSize: Math.round(a.heightIn * 2.6), fill: "#a16207", align: "center" },
    ],
  },
];

export const FONTS = ["Arial", "Georgia", "Trebuchet MS", "Verdana", "Courier New", "Impact", "Times New Roman"];
