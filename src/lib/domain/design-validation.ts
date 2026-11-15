import type { DesignLayer, PrintArea } from "./types";

export const MIN_DPI = 150; // below this we block submission
export const RECOMMENDED_DPI = 300; // below this we warn
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  level: IssueLevel;
  layerId?: string;
  code:
    | "empty_design"
    | "low_resolution"
    | "below_recommended_resolution"
    | "outside_print_area"
    | "outside_safe_zone"
    | "empty_text";
  message: string;
}

/** Effective print DPI of an image layer at its current printed size. */
export function effectiveDpi(layer: DesignLayer) {
  if (layer.kind !== "image" || !layer.naturalWidthPx || !layer.naturalHeightPx) return Infinity;
  return Math.min(layer.naturalWidthPx / layer.width, layer.naturalHeightPx / layer.height);
}

/** Axis-aligned bounding box of a (possibly rotated) layer, rotating around its top-left like Konva. */
export function layerBounds(layer: DesignLayer) {
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = [
    [0, 0],
    [layer.width, 0],
    [layer.width, layer.height],
    [0, layer.height],
  ].map(([px, py]) => [layer.x + px * cos - py * sin, layer.y + px * sin + py * cos]);
  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
}

const EPS = 0.01;

export function validateDesign(layers: DesignLayer[], area: PrintArea): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (layers.length === 0) {
    issues.push({ level: "error", code: "empty_design", message: "Add at least one image or text element." });
    return issues;
  }

  for (const layer of layers) {
    const label = layer.kind === "text" ? `Text “${(layer.text ?? "").slice(0, 18)}”` : "Image";

    if (layer.kind === "text" && !layer.text?.trim()) {
      issues.push({ level: "error", layerId: layer.id, code: "empty_text", message: "A text element is empty." });
    }

    if (layer.kind === "image") {
      const dpi = effectiveDpi(layer);
      if (dpi < MIN_DPI) {
        issues.push({
          level: "error",
          layerId: layer.id,
          code: "low_resolution",
          message: `${label} prints at ${Math.round(dpi)} DPI. Minimum is ${MIN_DPI} — make it smaller or upload a larger file.`,
        });
      } else if (dpi < RECOMMENDED_DPI) {
        issues.push({
          level: "warning",
          layerId: layer.id,
          code: "below_recommended_resolution",
          message: `${label} prints at ${Math.round(dpi)} DPI. ${RECOMMENDED_DPI} DPI is recommended for sharp results.`,
        });
      }
    }

    const b = layerBounds(layer);
    const outsideArea =
      b.left < -EPS || b.top < -EPS || b.right > area.widthIn + EPS || b.bottom > area.heightIn + EPS;
    const m = area.safeMarginIn;
    const outsideSafe =
      b.left < m - EPS ||
      b.top < m - EPS ||
      b.right > area.widthIn - m + EPS ||
      b.bottom > area.heightIn - m + EPS;

    if (outsideArea) {
      issues.push({
        level: "error",
        layerId: layer.id,
        code: "outside_print_area",
        message: `${label} extends beyond the print area and will be cut off.`,
      });
    } else if (outsideSafe) {
      issues.push({
        level: "warning",
        layerId: layer.id,
        code: "outside_safe_zone",
        message: `${label} is outside the safe zone and may be trimmed at the seam.`,
      });
    }
  }

  return issues;
}

export function canSubmit(issues: ValidationIssue[]) {
  return !issues.some((i) => i.level === "error");
}
