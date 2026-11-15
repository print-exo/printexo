import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Always lowercase: the name is never capitalised, even at the start of a sentence. See src/agents/brand.md. */
export const BRAND_NAME = "printexo";
export const BRAND_TAGLINE = "Print it. Ship it. Own it.";

const KIT = "/brand";

/**
 * Logo artwork from the brand kit (v3). Never retype the logo in a font: the
 * sliced "x" only exists in these files. Tones:
 * - deepgreen: on Paper / white (default)
 * - white:     on Deep Green or photos
 * - lime:      one-colour signature, on Deep Green only
 * - duo:       Lime dovetail tail + white, on Deep Green only (never on light backgrounds)
 */
export type LogoTone = "deepgreen" | "white" | "lime" | "duo";

/**
 * - lockup:   dovetail symbol + wordmark, the main logo (01-main-logo, viewBox 1117.28 × 228)
 * - wordmark: the lettering alone, where the symbol already appears nearby (08-wordmark, 837.28 × 228)
 */
const VARIANTS = {
  lockup: { dir: "01-main-logo", base: "printexo-logo", ratio: 1117.28 / 228, minWidth: 120 },
  wordmark: { dir: "08-wordmark", base: "printexo-wordmark", ratio: 837.28 / 228, minWidth: 80 },
} as const;

export type LogoVariant = keyof typeof VARIANTS;

/**
 * Horizontal logo. `height` is in px and is clamped so the logo never drops
 * below the brand minimum width (lockup 120 px, wordmark 80 px).
 * The wordmark has no duo colourway; it falls back to white.
 */
export function Logo({
  href = "/",
  tone = "deepgreen",
  variant = "lockup",
  height = 26,
  className,
}: {
  href?: string | null;
  tone?: LogoTone;
  variant?: LogoVariant;
  height?: number;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const h = Math.max(height, Math.ceil(v.minWidth / v.ratio));
  const file = variant === "wordmark" && tone === "duo" ? "white" : tone;
  const img = (
    <Image
      src={`${KIT}/${v.dir}/svg/${v.base}-${file}.svg`}
      alt={BRAND_NAME}
      width={Math.round(h * v.ratio)}
      height={h}
      priority
      className="block h-auto max-w-none"
    />
  );
  if (href === null) return <span className={cn("inline-flex", className)}>{img}</span>;
  return (
    <Link href={href} aria-label={`${BRAND_NAME} home`} className={cn("inline-flex shrink-0 items-center", className)}>
      {img}
    </Link>
  );
}

/**
 * The dovetail app icon (Lime tail + white on Deep Green). Uses the small cut
 * (wider joint gap) below 32 px, as the guidelines require.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const src = size < 32 ? `${KIT}/04-web-icons/favicon.svg` : `${KIT}/04-web-icons/printexo-app-icon.svg`;
  return <Image src={src} alt="" aria-hidden width={size} height={size} className={cn("shrink-0", className)} />;
}
