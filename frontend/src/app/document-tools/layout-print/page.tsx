"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";

type Item = { id: string; name: string; url: string; width: number; height: number; x: number; y: number; w: number; h: number; crop?: { x: number; y: number; w: number; h: number } };
const uid = () => Math.random().toString(36).slice(2, 10);

export default function LayoutPrintPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [paper, setPaper] = useState<"A4" | "A5">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [layout, setLayout] = useState<"free" | "2in1" | "4in1">("free");
  const [status, setStatus] = useState("एक या अधिक JPG/PNG इमेज चुनें। यह लेआउट आपके ब्राउज़र में तैयार होता है।");
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; itemX: number; itemY: number } | null>(null);

  useEffect(() => () => items.forEach(item => URL.revokeObjectURL(item.url)), []);

  const loadFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) { setStatus("इस layout tool में अभी image files चुनें। PDF से पहले Crop, Resize & Convert पेज पर पेज को JPG में export करें।"); return; }
    const next = files.map(file => ({ file, id: uid(), url: URL.createObjectURL(file) }));
    next.forEach(({file,id,url}, i) => {
      const img = new Image();
      img.onload = () => {
        const item: Item = { id, name: file.name, url, width: img.naturalWidth, height: img.naturalHeight, x: 30 + (i % 2) * 220, y: 30 + Math.floor(i / 2) * 160, w: 180, h: 130 };
        setItems(prev => [...prev, item]);
        setSelected(id);
      };
      img.onerror = () => setStatus("एक इमेज लोड नहीं हो सकी। कृपया JPG या PNG आज़माएँ।");
      img.src = url;
    });
    setStatus("इमेज लोड हो रही हैं। उन्हें नीचे दिए गए पेज पर drag करके व्यवस्थित करें।");
    e.target.value = "";
  };

  const pointerDown = (e: PointerEvent<HTMLDivElement>, item: Item) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    dragRef.current = { id: item.id, x: e.clientX, y: e.clientY, itemX: item.x, itemY: item.y };
    setSelected(item.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const stage = stageRef.current;
    if (!d || !stage) return;
    const scale = stage.clientWidth / 794;
    setItems(prev => prev.map(it => it.id === d.id ? { ...it, x: Math.max(0, Math.min(794 - it.w, d.itemX + (e.clientX - d.x) / scale)), y: Math.max(0, Math.min(1123 - it.h, d.itemY + (e.clientY - d.y) / scale)) } : it));
  };
  const pointerUp = () => { dragRef.current = null; };

  const arrange = () => {
    if (!items.length) return;
    const count = layout === "2in1" ? 2 : layout === "4in1" ? 4 : items.length;
    setItems(prev => prev.map((it, i) => {
      const col = layout === "4in1" ? i % 2 : 0;
      const row = layout === "4in1" ? Math.floor(i / 2) : i;
      const w = layout === "free" ? it.w : 340;
      const h = layout === "free" ? it.h : layout === "2in1" ? 500 : 500;
      return { ...it, x: layout === "free" ? it.x : col * 390 + 25, y: layout === "free" ? it.y : row * (layout === "2in1" ? 530 : 530) + 25, w, h };
    }));
    setStatus(layout === "free" ? "Free layout चुना गया। इमेज को drag करके रखें।" : `${layout === "2in1" ? "2-in-1" : "4-in-1"} layout लागू किया। जरूरत हो तो अब इमेज drag करके सही जगह रखें।`);
  };

  const makeCanvas = async () => {
    const width = orientation === "portrait" ? (paper === "A4" ? 794 : 559) : (paper === "A4" ? 1123 : 794);
    const height = orientation === "portrait" ? (paper === "A4" ? 1123 : 794) : (paper === "A4" ? 794 : 559);
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas उपलब्ध नहीं है।");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height);
    for (const item of items) {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = item.url; });
      const scaleX = width / 794, scaleY = height / 1123;
      ctx.drawImage(img, item.x * scaleX, item.y * scaleY, item.w * scaleX, item.h * scaleY);
    }
    return canvas;
  };

  const download = async (format: "image/jpeg" | "image/png") => {
    if (!items.length) { setStatus("पहले एक या अधिक इमेज चुनें।"); return; }
    setBusy(true);
    try {
      const canvas = await makeCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Export तैयार नहीं हुआ।")), format, .92));
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `document-layout.${format === "image/jpeg" ? "jpg" : "png"}`; a.click(); URL.revokeObjectURL(url);
      setStatus("Layout डाउनलोड हो गया।");
    } catch (err) { setStatus(err instanceof Error ? err.message : "Download असफल रहा।"); }
    finally { setBusy(false); }
  };

  const print = async () => {
    if (!items.length) { setStatus("पहले इमेज चुनें।"); return; }
    setBusy(true);
    try {
      const canvas = await makeCanvas();
      const data = canvas.toDataURL("image/png");
      const win = window.open("", "_blank");
      if (!win) { setStatus("Print window block हो गई। Browser में pop-ups की अनुमति दें।"); return; }
      win.document.write(`<!doctype html><html><head><title>Document Layout Print</title><style>@page{size:${paper} ${orientation};margin:8mm}html,body{margin:0;padding:0}img{width:100%;height:auto;display:block}</style></head><body><img src="${data}" onload="setTimeout(()=>window.print(),250)"></body></html>`);
      win.document.close();
      setStatus("Print preview खुलनी चाहिए। वहाँ printer और copies चुनें।");
    } catch (err) { setStatus(err instanceof Error ? err.message : "Print तैयार नहीं हुआ।"); }
    finally { setBusy(false); }
  };

  const pageRatio = orientation === "portrait" ? (paper === "A4" ? "210 / 297" : "148 / 210") : (paper === "A4" ? "297 / 210" : "210 / 148");
  return <main style={{ maxWidth: 1100, margin: "24px auto", padding: 20, color: "#17251f", fontFamily: "Arial,sans-serif" }}>
    <a href="/document-tools" style={{ color: "#176b4d", fontWeight: 700 }}>← Crop, Resize & Convert</a>
    <h1 style={{ marginBottom: 6 }}>Selection, Drag & Arrange, Print</h1>
    <p style={{ color: "#52635a", lineHeight: 1.5 }}>दो या अधिक दस्तावेज़ों की cropped images को एक पेज पर रखें। फाइलें इस browser tab में process होती हैं। Original files नहीं बदलतीं।</p>
    <section style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end", padding: 14, background: "#f3f8f4", borderRadius: 12 }}>
      <label style={{ display: "grid", gap: 6, fontWeight: 700 }}>Images चुनें<input type="file" accept="image/*" multiple onChange={loadFiles} /></label>
      <label style={{ display: "grid", gap: 6 }}>Paper<select value={paper} onChange={e => setPaper(e.target.value as "A4"|"A5")}><option>A4</option><option>A5</option></select></label>
      <label style={{ display: "grid", gap: 6 }}>Orientation<select value={orientation} onChange={e => setOrientation(e.target.value as "portrait"|"landscape")}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
      <label style={{ display: "grid", gap: 6 }}>Layout<select value={layout} onChange={e => setLayout(e.target.value as "free"|"2in1"|"4in1")}><option value="free">Free / Custom</option><option value="2in1">2-in-1 (stack)</option><option value="4in1">4-in-1 (grid)</option></select></label>
      <button onClick={arrange} style={btn}>Apply layout</button>
      <button onClick={() => void download("image/jpeg")} disabled={busy} style={btn}>Download JPG</button>
      <button onClick={() => void download("image/png")} disabled={busy} style={btn}>Download PNG</button>
      <button onClick={() => void print()} disabled={busy} style={btn}>Print</button>
    </section>
    <p role="status" aria-live="polite" style={{ color: "#28553d" }}>{status}</p>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 250px", gap: 16, alignItems: "start" }}>
      <div ref={stageRef} style={{ position: "relative", width: "100%", aspectRatio: pageRatio, maxHeight: 900, background: "#fff", border: "1px solid #c9d7ce", boxShadow: "0 3px 14px #0001", overflow: "hidden", touchAction: "none" }}>
        {items.map(item => <div key={item.id} onPointerDown={e => pointerDown(e,item)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} style={{ position: "absolute", left: `${item.x / 794 * 100}%`, top: `${item.y / 1123 * 100}%`, width: `${item.w / 794 * 100}%`, height: `${item.h / 1123 * 100}%`, border: selected === item.id ? "2px solid #176b4d" : "1px solid #999", background: "#fff", cursor: "move", boxSizing: "border-box", overflow: "hidden", touchAction: "none" }}>
          <img src={item.url} alt={item.name} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
        </div>)}
        {!items.length && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#87958b" }}>Your A4/A5 page preview</div>}
      </div>
      <aside style={{ display: "grid", gap: 8 }}>
        <strong>Selected items</strong>
        {items.map((item, i) => <div key={item.id} style={{ border: selected === item.id ? "2px solid #176b4d" : "1px solid #d6e0d9", borderRadius: 8, padding: 8, overflowWrap: "anywhere" }}>
          <button onClick={() => setSelected(item.id)} style={{ ...btn, width: "100%", textAlign: "left" }}>{i + 1}. {item.name}</button>
          <button onClick={() => setItems(prev => prev.filter(x => x.id !== item.id))} style={{ marginTop: 6, background: "#fff", border: "1px solid #cbd8d0", borderRadius: 6, padding: 6 }}>Remove</button>
        </div>)}
        <small>Note: PDF pages को पहले मुख्य Crop, Resize & Convert tool से image में export करें। Selection/crop rectangles और direct multi-page PDF import इस first implementation में अभी शामिल नहीं हैं।</small>
      </aside>
    </div>
  </main>;
}
const btn: React.CSSProperties = { border: 0, borderRadius: 8, padding: "10px 12px", background: "#176b4d", color: "#fff", fontWeight: 700, cursor: "pointer" };
