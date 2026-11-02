"use client";

import { ChangeEvent, PointerEvent, useMemo, useRef, useState } from "react";

type LayoutItem = {
  id: string;
  name: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

type Gesture = {
  mode: "drag" | "resize" | "rotate";
  id: string;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  startRotation: number;
  centerX: number;
  centerY: number;
  startAngle: number;
};

const PAGE_W = 794;
const PAGE_H = 1123;
const makeId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function PrintEditorPrototypePage() {
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("JPG या PNG इमेज चुनें, फिर उसे पेज पर drag, resize और rotate करें।");
  const stageRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);

  const selected = useMemo(() => items.find(item => item.id === selectedId) ?? null, [items, selectedId]);

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter(file => file.type.startsWith("image/"));
    if (!files.length) {
      setStatus("कृपया JPG, PNG या कोई supported image चुनें।");
      return;
    }

    files.forEach(file => {
      const src = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const maxW = 340;
        const maxH = 250;
        const ratio = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight, 1);
        const w = Math.max(60, image.naturalWidth * ratio);
        const h = Math.max(60, image.naturalHeight * ratio);
        const item: LayoutItem = {
          id: makeId(),
          name: file.name,
          src,
          x: Math.max(0, (PAGE_W - w) / 2),
          y: Math.max(0, (PAGE_H - h) / 2),
          w,
          h,
          rotation: 0,
        };
        setItems(previous => [...previous, item]);
        setSelectedId(item.id);
        setStatus("इमेज जुड़ गई। बॉर्डर के अंदर drag करें, नीचे-दाएँ handle से resize और ऊपर के गोल handle से rotate करें।");
      };
      image.onerror = () => {
        URL.revokeObjectURL(src);
        setStatus(`${file.name} लोड नहीं हो सकी। दूसरी image आज़माएँ।`);
      };
      image.src = src;
    });
    event.target.value = "";
  };

  const beginGesture = (
    event: PointerEvent<HTMLElement>,
    item: LayoutItem,
    mode: Gesture["mode"],
  ) => {
    const stage = stageRef.current;
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = stage.getBoundingClientRect();
    const scale = rect.width / PAGE_W;
    const px = (event.clientX - rect.left) / scale;
    const py = (event.clientY - rect.top) / scale;
    const centerX = item.x + item.w / 2;
    const centerY = item.y + item.h / 2;
    gestureRef.current = {
      mode,
      id: item.id,
      pointerX: px,
      pointerY: py,
      startX: item.x,
      startY: item.y,
      startW: item.w,
      startH: item.h,
      startRotation: item.rotation,
      centerX,
      centerY,
      startAngle: Math.atan2(py - centerY, px - centerX) * 180 / Math.PI,
    };
    setSelectedId(item.id);
    stage.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    const stage = stageRef.current;
    if (!gesture || !stage) return;
    const rect = stage.getBoundingClientRect();
    const scale = rect.width / PAGE_W;
    const px = (event.clientX - rect.left) / scale;
    const py = (event.clientY - rect.top) / scale;
    const dx = px - gesture.pointerX;
    const dy = py - gesture.pointerY;

    setItems(previous => previous.map(item => {
      if (item.id !== gesture.id) return item;
      if (gesture.mode === "drag") {
        return {
          ...item,
          x: clamp(gesture.startX + dx, 0, PAGE_W - item.w),
          y: clamp(gesture.startY + dy, 0, PAGE_H - item.h),
        };
      }
      if (gesture.mode === "resize") {
        const ratio = gesture.startW / gesture.startH;
        const nextW = clamp(gesture.startW + dx, 48, PAGE_W);
        const nextH = clamp(nextW / ratio, 48, PAGE_H);
        return { ...item, w: nextW, h: nextH };
      }
      const angle = Math.atan2(py - gesture.centerY, px - gesture.centerX) * 180 / Math.PI;
      return { ...item, rotation: normalizeAngle(gesture.startRotation + angle - gesture.startAngle) };
    }));
  };

  const endGesture = () => { gestureRef.current = null; };

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: makeId(), name: `${selected.name} (copy)`, x: clamp(selected.x + 24, 0, PAGE_W - selected.w), y: clamp(selected.y + 24, 0, PAGE_H - selected.h) };
    setItems(previous => [...previous, copy]);
    setSelectedId(copy.id);
    setStatus("Selected image की एक copy बना दी गई।");
  };

  const deleteSelected = () => {
    if (!selected) return;
    URL.revokeObjectURL(selected.src);
    setItems(previous => previous.filter(item => item.id !== selected.id));
    setSelectedId(null);
    setStatus("Selected image हटाई गई।");
  };

  const updatePositionMm = (axis: "x" | "y", rawValue: string) => {
    if (!selected) return;
    if (rawValue.trim() === "") return;
    const mm = Number(rawValue);
    if (!Number.isFinite(mm)) return;
    const px = axis === "x" ? mm * PAGE_W / 210 : mm * PAGE_H / 297;
    const max = axis === "x" ? PAGE_W - selected.w : PAGE_H - selected.h;
    setItems(previous => previous.map(item => item.id === selected.id
      ? { ...item, [axis]: clamp(px, 0, max) }
      : item));
  };

  const resetSelected = () => {
    if (!selected) return;
    setItems(previous => previous.map(item => item.id === selected.id ? { ...item, rotation: 0 } : item));
  };

  const printPage = () => {
    if (!items.length) {
      setStatus("Print से पहले कम-से-कम एक image जोड़ें।");
      return;
    }
    window.print();
  };

  return (
    <main className="editor-shell">
      <style jsx>{`
        .editor-shell{max-width:1180px;margin:0 auto;padding:24px 16px 40px;color:#17251f;font-family:Arial,sans-serif}
        .topline{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
        .back{color:#176b4d;text-decoration:none;font-weight:700}
        h1{font-size:clamp(24px,4vw,34px);margin:18px 0 8px}
        .intro{color:#52635a;line-height:1.55;max-width:760px}
        .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#f2f7f3;border:1px solid #dce8df;border-radius:14px;padding:14px;margin:18px 0}
        .btn{border:0;border-radius:8px;padding:10px 14px;background:#176b4d;color:#fff;font-weight:700;cursor:pointer}
        .btn:disabled{opacity:.45;cursor:not-allowed}
        .btn.secondary{background:#fff;color:#24533d;border:1px solid #cbd9ce}
        .status{min-height:24px;color:#28553d}
        .workspace{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:18px;align-items:start}
        .page-wrap{min-width:0;background:#e9eeeb;padding:12px;border-radius:12px}
        .stage{position:relative;width:100%;aspect-ratio:210/297;max-height:1000px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 4px 18px #17251f20;touch-action:none;user-select:none}
        .item{position:absolute;box-sizing:border-box;transform-origin:center center;touch-action:none;cursor:move}
        .item.selected{outline:2px solid #176b4d;outline-offset:0}
        .item img{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none}
        .handle{position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #176b4d;box-shadow:0 1px 4px #0003;z-index:3}
        .resize{right:-10px;bottom:-10px;cursor:nwse-resize}
        .rotate{left:50%;top:-34px;transform:translateX(-50%);cursor:grab}
        .rotate-line{position:absolute;left:50%;top:-19px;height:17px;border-left:1px dashed #176b4d;pointer-events:none}
        .side{background:#fff;border:1px solid #dce5de;border-radius:12px;padding:14px;display:grid;gap:10px}
        .side h2{font-size:17px;margin:0}
        .meta{font-size:13px;color:#5a6b60;line-height:1.5;overflow-wrap:anywhere}
        .help{font-size:13px;color:#607066;line-height:1.55}
        .position-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .field{display:grid;gap:5px;font-size:12px;color:#53645a;font-weight:700}
        .field input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #cbd9ce;border-radius:7px;padding:9px;font:inherit;color:#17251f;background:#fff}
        .field input:focus{outline:2px solid #8bbca1;outline-offset:1px}
        @media(max-width:760px){.workspace{grid-template-columns:1fr}.side{order:-1}.stage{max-height:none}.toolbar>*{max-width:100%}}
        @media print{
          @page{size:A4 portrait;margin:0}
          body{margin:0!important;background:#fff!important}
          .editor-shell{padding:0!important;margin:0!important;max-width:none!important}
          .topline,.intro,h1,.toolbar,.status,.side{display:none!important}
          .page-wrap{display:block!important;padding:0!important;background:transparent!important;border-radius:0!important}
          .workspace{display:block!important}
          .stage{width:210mm!important;height:297mm!important;max-height:none!important;aspect-ratio:auto!important;box-shadow:none!important;overflow:hidden!important}
          .item{outline:none!important}
          .handle,.rotate-line{display:none!important}
        }
      `}</style>

      <div className="topline">
        <a className="back" href="/document-tools">← Document Tools</a>
        <span className="meta">Prototype v1 · A4 portrait · Browser-based</span>
      </div>
      <h1>Print Layout Editor</h1>
      <p className="intro">यह isolated prototype है। इसमें image को page पर स्वतंत्र रूप से move, resize और rotate किया जा सकता है। अभी enhancement sliders और DPI controls शामिल नहीं हैं।</p>

      <section className="toolbar">
        <label className="btn secondary">
          Add images
          <input type="file" accept="image/*" multiple onChange={addFiles} style={{display:"none"}} />
        </label>
        <button className="btn secondary" onClick={duplicateSelected} disabled={!selected}>Duplicate</button>
        <button className="btn secondary" onClick={resetSelected} disabled={!selected}>Reset rotation</button>
        <button className="btn secondary" onClick={deleteSelected} disabled={!selected}>Delete</button>
        <button className="btn" onClick={printPage} disabled={!items.length}>Print preview</button>
      </section>

      <p className="status" role="status" aria-live="polite">{status}</p>

      <div className="workspace">
        <div className="page-wrap">
          <div
            ref={stageRef}
            className="stage"
            onPointerMove={handlePointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
            onPointerDown={event => { if (event.target === event.currentTarget) setSelectedId(null); }}
          >
            {items.map(item => (
              <div
                key={item.id}
                className={`item ${selectedId === item.id ? "selected" : ""}`}
                style={{left:`${item.x / PAGE_W * 100}%`,top:`${item.y / PAGE_H * 100}%`,width:`${item.w / PAGE_W * 100}%`,height:`${item.h / PAGE_H * 100}%`,transform:`rotate(${item.rotation}deg)`}}
                onPointerDown={event => beginGesture(event,item,"drag")}
                onClick={event => {event.stopPropagation();setSelectedId(item.id);}}
              >
                <img src={item.src} alt={item.name} draggable={false} />
                {selectedId === item.id && <>
                  <span className="rotate-line" />
                  <button aria-label="Rotate image" className="handle rotate" onPointerDown={event => beginGesture(event,item,"rotate")} />
                  <button aria-label="Resize image" className="handle resize" onPointerDown={event => beginGesture(event,item,"resize")} />
                </>}
              </div>
            ))}
            {!items.length && <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#829087",textAlign:"center",padding:20}}>Add an image to start arranging your A4 page</div>}
          </div>
        </div>

        <aside className="side">
          <h2>Selected image</h2>
          {selected ? <>
            <strong>{selected.name}</strong>
            <div className="meta">Width: {Math.round(selected.w / PAGE_W * 210)} mm</div>
            <div className="meta">Height: {Math.round(selected.h / PAGE_H * 297)} mm</div>
            <div className="position-grid">
              <label className="field">X position (mm)
                <input type="number" min="0" max={Math.max(0, (PAGE_W - selected.w) / PAGE_W * 210).toFixed(1)} step="0.1" value={(selected.x / PAGE_W * 210).toFixed(1)} onChange={event => updatePositionMm("x", event.target.value)} />
              </label>
              <label className="field">Y position (mm)
                <input type="number" min="0" max={Math.max(0, (PAGE_H - selected.h) / PAGE_H * 297).toFixed(1)} step="0.1" value={(selected.y / PAGE_H * 297).toFixed(1)} onChange={event => updatePositionMm("y", event.target.value)} />
              </label>
            </div>
            <div className="meta">Position is measured from the top-left corner of the A4 page.</div>
            <div className="meta">Rotation: {Math.round(selected.rotation)}°</div>
            <p className="help">Drag image: move it. X/Y fields: set exact position in millimeters. Bottom-right handle: resize while preserving aspect ratio. Top circular handle: rotate. Touch gestures are supported.</p>
          </> : <p className="help">किसी image को select करें। फिर उसे drag, resize या rotate करें।</p>}
          <div className="meta">Page boundary: A4 · 210 × 297 mm</div>
          <div className="meta">यह prototype original uploaded image file को modify नहीं करता।</div>
        </aside>
      </div>
    </main>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}
