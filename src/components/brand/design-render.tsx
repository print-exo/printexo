import type { DesignLayer } from "@/lib/domain/types";

/**
 * Renders design layers as SVG in print-area inch coordinates.
 * Used for thumbnails, mockup previews and order line previews.
 */
export function DesignLayers({ layers }: { layers: DesignLayer[] }) {
  return (
    <>
      {layers.map((l) => {
        const transform = l.rotation ? `rotate(${l.rotation} ${l.x} ${l.y})` : undefined;
        if (l.kind === "image" && l.src) {
          return (
            <image
              key={l.id}
              href={l.src}
              x={l.x}
              y={l.y}
              width={l.width}
              height={l.height}
              preserveAspectRatio="none"
              transform={transform}
            />
          );
        }
        const sizeIn = (l.fontSize ?? 24) / 72;
        const anchor = l.align === "center" ? "middle" : l.align === "right" ? "end" : "start";
        const tx = l.align === "center" ? l.x + l.width / 2 : l.align === "right" ? l.x + l.width : l.x;
        return (
          <text
            key={l.id}
            x={tx}
            y={l.y + sizeIn * 0.85}
            fontSize={sizeIn}
            fontFamily={l.fontFamily ?? "Arial"}
            fontStyle={l.fontStyle?.includes("italic") ? "italic" : undefined}
            fontWeight={l.fontStyle?.includes("bold") ? 700 : undefined}
            fill={l.fill ?? "#111"}
            textAnchor={anchor}
            transform={transform}
          >
            {l.text}
          </text>
        );
      })}
    </>
  );
}

export function DesignThumb({
  layers,
  widthIn,
  heightIn,
  background = "#fff",
  className,
}: {
  layers: DesignLayer[];
  widthIn: number;
  heightIn: number;
  background?: string;
  className?: string;
}) {
  return (
    <svg viewBox={`0 0 ${widthIn} ${heightIn}`} className={className} role="img" aria-label="Design preview">
      <rect width={widthIn} height={heightIn} fill={background} />
      <DesignLayers layers={layers} />
    </svg>
  );
}
