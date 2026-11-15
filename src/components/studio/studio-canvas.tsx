"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group, Image as KImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type { DesignLayer, PrintArea } from "@/lib/domain/types";
import { loadImage, measureTextHeightIn, ptToIn } from "./konva-utils";

interface Props {
  area: PrintArea;
  layers: DesignLayer[];
  selectedId?: string;
  zoom: number;
  errorLayerIds: Set<string>;
  onSelect: (id?: string) => void;
  onChange: (id: string, patch: Partial<DesignLayer>) => void;
}

const PAD = 40;

function useImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement>();
  useEffect(() => {
    if (!src) return;
    let alive = true;
    loadImage(src).then((i) => alive && setImg(i)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}

function ImageNode({ layer, ppi, ...handlers }: { layer: DesignLayer; ppi: number } & NodeHandlers) {
  const img = useImage(layer.src);
  return (
    <KImage
      id={layer.id}
      image={img}
      x={layer.x * ppi}
      y={layer.y * ppi}
      width={layer.width * ppi}
      height={layer.height * ppi}
      rotation={layer.rotation}
      draggable
      {...handlers}
    />
  );
}

interface NodeHandlers {
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseDown: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

export default function StudioCanvas({ area, layers, selectedId, zoom, errorLayerIds, onSelect, onChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ w: 600, h: 500 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = Math.max(10, Math.min((size.w - PAD * 2) / area.widthIn, (size.h - PAD * 2) / area.heightIn));
  const ppi = fit * zoom;
  const areaW = area.widthIn * ppi;
  const areaH = area.heightIn * ppi;
  const stageW = Math.max(size.w, areaW + PAD * 2);
  const stageH = Math.max(size.h, areaH + PAD * 2);
  const ox = (stageW - areaW) / 2;
  const oy = (stageH - areaH) / 2;

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = selectedId ? stage.findOne(`#${selectedId}`) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, layers, ppi]);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const container = e.target.getStage()?.container();
    if (container) container.style.cursor = cursor;
  };

  const handlersFor = (layer: DesignLayer): NodeHandlers => ({
    onMouseEnter: (e) => setCursor(e, "move"),
    onMouseLeave: (e) => setCursor(e, "default"),
    onMouseDown: () => onSelect(layer.id),
    onTap: () => onSelect(layer.id),
    onDragEnd: (e) => onChange(layer.id, { x: e.target.x() / ppi, y: e.target.y() / ppi }),
    onTransformEnd: (e) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      const width = (node.width() * sx) / ppi;
      const base = { x: node.x() / ppi, y: node.y() / ppi, rotation: node.rotation(), width };
      if (layer.kind === "text") {
        const fontSize = Math.max(4, Math.round((layer.fontSize ?? 24) * sy));
        onChange(layer.id, { ...base, fontSize, height: measureTextHeightIn({ ...layer, fontSize, width }) });
      } else {
        onChange(layer.id, { ...base, height: (node.height() * sy) / ppi });
      }
    },
  });

  const m = area.safeMarginIn * ppi;

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-auto">
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === "bg") onSelect(undefined);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === "bg") onSelect(undefined);
        }}
      >
        <Layer>
          <Rect name="bg" width={stageW} height={stageH} fill="#e7ede5" />
          <Rect x={ox} y={oy} width={areaW} height={areaH} fill="#ffffff" shadowColor="#000" shadowOpacity={0.08} shadowBlur={12} listening={false} />
        </Layer>

        <Layer x={ox} y={oy}>
          {layers.map((l) =>
            l.kind === "image" ? (
              <ImageNode key={l.id} layer={l} ppi={ppi} {...handlersFor(l)} />
            ) : (
              <Text
                key={l.id}
                id={l.id}
                x={l.x * ppi}
                y={l.y * ppi}
                width={l.width * ppi}
                rotation={l.rotation}
                text={l.text}
                fontFamily={l.fontFamily}
                fontSize={ptToIn(l.fontSize ?? 24) * ppi}
                fontStyle={l.fontStyle ?? "normal"}
                fill={l.fill}
                align={l.align}
                wrap="word"
                draggable
                {...handlersFor(l)}
              />
            ),
          )}
        </Layer>

        {/* Guides: dim everything outside the print area, then draw edges and safe zone. */}
        <Layer listening={false}>
          <Group opacity={0.55}>
            <Rect x={0} y={0} width={stageW} height={oy} fill="#e7ede5" />
            <Rect x={0} y={oy + areaH} width={stageW} height={stageH - oy - areaH} fill="#e7ede5" />
            <Rect x={0} y={oy} width={ox} height={areaH} fill="#e7ede5" />
            <Rect x={ox + areaW} y={oy} width={stageW - ox - areaW} height={areaH} fill="#e7ede5" />
          </Group>
          <Rect x={ox} y={oy} width={areaW} height={areaH} stroke="#2e6b5e" strokeWidth={1.5} />
          <Rect x={ox + m} y={oy + m} width={areaW - 2 * m} height={areaH - 2 * m} stroke="#2e6b5e" strokeWidth={1} dash={[6, 5]} opacity={0.7} />
          {area.widthIn / area.heightIn > 1 && (
            <Line points={[ox + areaW / 2, oy, ox + areaW / 2, oy + areaH]} stroke="#6e7f7a" dash={[2, 6]} />
          )}
          {layers
            .filter((l) => errorLayerIds.has(l.id))
            .map((l) => (
              <Rect
                key={`err-${l.id}`}
                x={ox + l.x * ppi}
                y={oy + l.y * ppi}
                width={l.width * ppi}
                height={l.height * ppi}
                rotation={l.rotation}
                stroke="#b42318"
                strokeWidth={1.5}
                dash={[4, 3]}
              />
            ))}
          <Text x={ox} y={oy - 20} text={`${area.name} · ${area.widthIn}″ × ${area.heightIn}″`} fontSize={12} fill="#52625c" />
          <Text x={ox + m + 4} y={oy + m + 4} text="safe zone" fontSize={10} fill="#2e6b5e" opacity={0.7} />
          {area.widthIn / area.heightIn > 1 && <Text x={ox + areaW / 2 + 4} y={oy + areaH + 6} text="front center" fontSize={10} fill="#6e7f7a" />}
        </Layer>

        <Layer>
          <Transformer
            ref={trRef}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            anchorSize={9}
            borderStroke="#2e6b5e"
            anchorStroke="#2e6b5e"
            keepRatio
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 8 || newBox.height < 8 ? oldBox : newBox)}
          />
        </Layer>
      </Stage>
    </div>
  );
}
