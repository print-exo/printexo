import Konva from "konva";
import type { DesignLayer, PrintArea } from "@/lib/domain/types";

/** Points are 1/72 inch. */
export const ptToIn = (pt: number) => pt / 72;

/** Measure wrapped text height in inches using Konva's own layout engine. */
export function measureTextHeightIn(layer: Pick<DesignLayer, "text" | "fontFamily" | "fontSize" | "fontStyle" | "width">) {
  const node = new Konva.Text({
    text: layer.text || " ",
    fontFamily: layer.fontFamily ?? "Arial",
    fontSize: layer.fontSize ?? 24, // at 72 px/in, 1 pt == 1 px
    fontStyle: layer.fontStyle ?? "normal",
    width: layer.width * 72,
    wrap: "word",
  });
  const h = node.height() / 72;
  node.destroy();
  return h;
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Render the artwork at production resolution, transparent background,
 * exactly the size of the print area. The real pipeline does this on the
 * server with sharp and also writes a TIFF; this is the client preview.
 */
export async function renderPrintPng(layers: DesignLayer[], area: PrintArea, dpi = 300) {
  const container = document.createElement("div");
  const stage = new Konva.Stage({ container, width: Math.round(area.widthIn * dpi), height: Math.round(area.heightIn * dpi) });
  const layer = new Konva.Layer();
  stage.add(layer);
  for (const l of layers) {
    const common = { x: l.x * dpi, y: l.y * dpi, rotation: l.rotation, width: l.width * dpi };
    if (l.kind === "image" && l.src) {
      const img = await loadImage(l.src);
      layer.add(new Konva.Image({ ...common, image: img, height: l.height * dpi }));
    } else if (l.kind === "text") {
      layer.add(
        new Konva.Text({
          ...common,
          text: l.text,
          fontFamily: l.fontFamily,
          fontSize: ptToIn(l.fontSize ?? 24) * dpi,
          fontStyle: l.fontStyle ?? "normal",
          fill: l.fill,
          align: l.align ?? "left",
          wrap: "word",
        }),
      );
    }
  }
  layer.draw();
  const url = stage.toDataURL({ mimeType: "image/png", pixelRatio: 1 });
  stage.destroy();
  return url;
}
