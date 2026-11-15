import type { DesignLayer, PrintArea, ProductCategory } from "@/lib/domain/types";
import { DesignLayers } from "./design-render";
import { cn } from "@/lib/utils";

/**
 * Vector product mockup used as a placeholder until verified product
 * photography is available (see src/agents/assets.md).
 */

interface Props {
  category?: ProductCategory;
  shape?: "skinny" | "handle" | "classic" | "mug";
  color: string;
  layers?: DesignLayer[];
  printArea?: PrintArea;
  className?: string;
  label?: string;
}

function isDark(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

const SHAPES = {
  skinny: { body: "M62 62 H138 L132 262 Q131 272 120 272 H80 Q69 272 68 262 Z", lid: { x: 58, y: 44, w: 84, h: 20 }, print: { x: 70, y: 92, w: 60, h: 140 }, straw: true },
  classic: { body: "M56 66 H144 L130 264 Q129 274 118 274 H82 Q71 274 70 264 Z", lid: { x: 52, y: 48, w: 96, h: 20 }, print: { x: 70, y: 100, w: 60, h: 120 }, straw: false },
  handle: { body: "M60 70 H134 L128 200 Q127 210 120 214 L118 268 Q117 276 108 276 H86 Q77 276 76 268 L74 214 Q67 210 66 200 Z", lid: { x: 56, y: 50, w: 82, h: 22 }, print: { x: 76, y: 96, w: 42, h: 64 }, straw: true },
  mug: { body: "M50 110 H140 V250 Q140 266 124 266 H66 Q50 266 50 250 Z", lid: null, print: { x: 60, y: 140, w: 70, h: 90 }, straw: false },
} as const;

export function TumblerMockup({ category = "tumbler", shape, color, layers, printArea, className, label }: Props) {
  const s = SHAPES[shape ?? (category === "mug" ? "mug" : "skinny")];
  const dark = isDark(color);
  const p = s.print;

  // For wrap prints, show the front-facing half of the artwork.
  const isWrap = printArea && printArea.widthIn / printArea.heightIn > 1;
  const vb = printArea
    ? isWrap
      ? `${printArea.widthIn / 4} 0 ${printArea.widthIn / 2} ${printArea.heightIn}`
      : `0 0 ${printArea.widthIn} ${printArea.heightIn}`
    : undefined;

  return (
    <svg viewBox="0 0 200 300" className={cn("h-auto w-full", className)} role="img" aria-label={label ?? "Product mockup"}>
      <defs>
        <linearGradient id={`shade-${color.slice(1)}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={dark ? 0.35 : 0.14} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={dark ? 0.08 : 0.35} />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.4 : 0.18} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="282" rx="58" ry="7" fill="#000" opacity="0.08" />
      {shape === "handle" && <path d="M134 92 Q170 96 168 140 Q166 182 130 186" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />}
      {category === "mug" && <path d="M140 140 Q176 142 174 182 Q172 222 140 222" fill="none" stroke={color} strokeWidth="13" />}
      {s.straw && <rect x="104" y="6" width="7" height="46" rx="3" fill="#d4d4d8" />}
      <path d={s.body} fill={color} stroke="#00000014" />
      {layers && printArea && vb && (
        <svg x={p.x} y={p.y} width={p.w} height={p.h} viewBox={vb} preserveAspectRatio="xMidYMid meet">
          <DesignLayers layers={layers} />
        </svg>
      )}
      <path d={s.body} fill={`url(#shade-${color.slice(1)})`} />
      {s.lid && <rect x={s.lid.x} y={s.lid.y} width={s.lid.w} height={s.lid.h} rx="5" fill={dark ? "#3f3f46" : "#d6d3d1"} />}
    </svg>
  );
}

export function shapeFor(productId: string): Props["shape"] {
  if (productId.includes("40")) return "handle";
  if (productId.includes("30")) return "classic";
  if (productId.includes("mug")) return "mug";
  return "skinny";
}
