"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type LayoutItem = { id: string; name: string; src: string; pageId: number; x: number; y: number; w: number; h: number };
type LayoutPage = { id: number; label: string };
type PagePreset = "A4" | "A3" | "A5" | "Legal" | "Custom";
const PRESETS: Record<Exclude<PagePreset, "Custom">, { w: number; h: number }> = {
  A4: { w: 210, h: 297 }, A3: { w: 297, h: 420 }, A5: { w: 148, h: 210 }, Legal: { w: 216, h: 356 },
};
const uid = () => "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
let pdfJsPromise: Promise<any> | null = null;
async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") throw new Error("PDF browser engine unavailable.");
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs")
      .then((pdfjs: any) => {
        // Use the worker shipped with the installed package instead of relying on
        // a third-party CDN script, which can be blocked or unavailable on CSC PCs.
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        return pdfjs;
      })
      .catch((error: unknown) => {
        pdfJsPromise = null; // allow retry after a transient chunk/load failure
        throw new Error(
          "PDF engine load नहीं हो सका। Page refresh करके फिर कोशिश करें। " +
          (error instanceof Error ? error.message : "")
        );
      });
  }
  return pdfJsPromise;
}

export default function PrintEditorPage() {
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [pages, setPages] = useState<LayoutPage[]>([{ id: 1, label: "Page 1" }]);
  const [activePage, setActivePage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual" | "grid" | "photo">("manual");
  const [preset, setPreset] = useState<PagePreset>("A4");
  const [customW, setCustomW] = useState("210");
  const [customH, setCustomH] = useState("297");
  const [photoCopies, setPhotoCopies] = useState("8");
  const [photoWidthMm, setPhotoWidthMm] = useState("35");
  const [photoHeightMm, setPhotoHeightMm] = useState("45");
  const [pageMargins, setPageMargins] = useState({ top: "5", right: "5", bottom: "5", left: "5" });
  const [clipboardItem, setClipboardItem] = useState<LayoutItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [resizeState, setResizeState] = useState<{id:string; handle:string; startX:number; startY:number; startW:number; startH:number} | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const [status, setStatus] = useState("एक या कई image/PDF चुनें। PDF के pages को preview करके layout में जोड़ें।");
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const urlsRef = useRef<string[]>([]);
  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);
  const pageSize = preset === "Custom" ? { w: Math.max(20, Number(customW) || 210), h: Math.max(20, Number(customH) || 297) } : PRESETS[preset];
  const pageItems = items.filter(i => i.pageId === activePage);

  useEffect(() => () => urlsRef.current.forEach(url => URL.revokeObjectURL(url)), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if (typing) return;
      const command = event.ctrlKey || event.metaKey;
      if (command && event.key.toLowerCase() === "a") {
        event.preventDefault(); setSelectedIds(pageItems.map(i => i.id)); setStatus("इस page की सभी photos select हुईं। Resize fields केवल active photo को बदलते हैं।"); return;
      }
      if (command && event.key.toLowerCase() === "c" && selected) {
        event.preventDefault(); setClipboardItem({ ...selected }); setStatus("Selected photo copied. Press Ctrl+V to paste."); return;
      }
      if (command && event.key.toLowerCase() === "x" && selected) {
        event.preventDefault(); setClipboardItem({ ...selected }); setItems(old => old.filter(i => i.id !== selected.id)); setSelectedId(null); setSelectedIds(old => old.filter(id => id !== selected.id)); setStatus("Selected photo cut. Press Ctrl+V to paste."); return;
      }
      if (command && event.key.toLowerCase() === "v" && clipboardItem) {
        event.preventDefault();
        const copy = { ...clipboardItem, id: uid(), name: clipboardItem.name + " copy", pageId: activePage, x: Math.min(794 - clipboardItem.w, clipboardItem.x + 24), y: Math.min(1123 - clipboardItem.h, clipboardItem.y + 24) };
        setItems(old => [...old, copy]); setSelectedId(copy.id); setSelectedIds([copy.id]); setStatus("Photo pasted on the current page."); return;
      }
      if (!command && selected && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) {
        event.preventDefault(); const step=event.shiftKey?5:1;
        const key=event.key==="ArrowLeft"?"x":event.key==="ArrowRight"?"x":event.key==="ArrowUp"?"y":"y";
        const delta=event.key==="ArrowLeft"||event.key==="ArrowUp"?-step:step;
        updateSelected(key,String(selected[key]+delta));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, clipboardItem, activePage, pageItems]);

  useEffect(() => {
    const raw = sessionStorage.getItem("cscskb-print-layout-queue");
    if (!raw) return;
    sessionStorage.removeItem("cscskb-print-layout-queue");
    try {
      const queued = JSON.parse(raw) as Array<{ name: string; dataUrl: string }>;
      void (async () => {
        for (const entry of queued) {
          const response = await fetch(entry.dataUrl);
          const blob = await response.blob();
          await addImage(new File([blob], entry.name.replace(/[^a-z0-9._-]+/gi, "-") + ".png", { type: "image/png" }));
        }
        if (queued.length) setStatus(queued.length + " crop(s) Document Tools से Print Layout में भेजे गए।");
      })().catch(error => setStatus(error instanceof Error ? error.message : "Queued images load नहीं हो सकीं।"));
    } catch {
      setStatus("Document Tools से भेजी गई image queue पढ़ी नहीं जा सकी। कृपया image दोबारा भेजें।");
    }
  }, []);

  const addImage = async (file: File, pageId = activePage) => {
    if (!file.type.startsWith("image/")) return;
    const src = URL.createObjectURL(file); urlsRef.current.push(src);
    const image = new Image();
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error(file.name + " image load नहीं हुई।")); image.src = src; });
    const ratio = Math.min(340 / image.naturalWidth, 250 / image.naturalHeight, 1);
    const w = Math.max(24, image.naturalWidth * ratio), h = Math.max(24, image.naturalHeight * ratio);
    setItems(old => [...old, { id: uid(), name: file.name, src, pageId, x: Math.max(0, (794 - w) / 2), y: Math.max(0, (1123 - h) / 2), w, h }]);
  };

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const invalid = files.filter(f => !f.type.startsWith("image/") && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf"));
    const tooLarge = files.filter(f => f.size > 30 * 1024 * 1024);
    if (invalid.length || tooLarge.length) { setStatus("केवल images/PDF स्वीकार हैं; हर file की सीमा 30 MB है। गलत या बड़ी files छोड़ दी गई हैं।"); }
    setBusy(true);
    let added = 0;
    try {
      for (const file of files) {
        if (invalid.includes(file) || tooLarge.includes(file)) continue;
        if (file.type.startsWith("image/")) { await addImage(file); added++; continue; }
        const pdfjs = await loadPdfJs();
        const bytes = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: bytes, password: pdfPassword || undefined }).promise;
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n), viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("PDF canvas उपलब्ध नहीं है।");
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("PDF page render failed")), "image/png"));
          const pageFile = new File([blob], file.name.replace(/\.pdf$/i, "") + "-page-" + n + ".png", { type: "image/png" });
          await addImage(pageFile); added++;
        }
      }
      setStatus(added + " image/PDF page(s) layout में जोड़ दिए गए। अब page assignment और layout mode चुनें।");
    } catch (error) {
      const e = error as { name?: string; message?: string; code?: number };
      if (e.name === "PasswordException" || e.code === 1 || e.code === 2) setStatus("यह PDF password-protected है। सही password डालकर फिर से चुनें।");
      else setStatus(e.message || "कुछ files process नहीं हो सकीं।");
    } finally { setBusy(false); }
  };

  const addPage = () => {
    const id = Math.max(0, ...pages.map(p => p.id)) + 1;
    setPages(old => [...old, { id, label: "Page " + id }]); setActivePage(id);
    setStatus("नया blank page जोड़ा गया।");
  };
  const moveToPage = (id: string, pageId: number) => setItems(old => old.map(i => i.id === id ? { ...i, pageId } : i));
  const deleteItem = () => {
    if (!selected) return;
    setItems(old => old.filter(i => i.id !== selected.id)); setSelectedId(null);
  };
  const updateSelected = (key: "x" | "y" | "w" | "h", value: string) => {
    if (!selected || value.trim() === "") return;
    const n = Number(value); if (!Number.isFinite(n)) return;
    setItems(old => old.map(i => i.id === selected.id ? { ...i, [key]: Math.max(key === "w" || key === "h" ? 12 : 0, n) } : i));
  };
  const createPhotoSheet = () => {
    const source = selected;
    if (!source) { setStatus("पहले photo select करें।"); return; }
    const count = Math.max(1, Math.min(30, Number(photoCopies) || 8));
    const mmToX = 794 / pageSize.w, mmToY = 1123 / pageSize.h;
    const w = Math.max(20, Number(photoWidthMm) || 35) * mmToX;
    const h = Math.max(20, Number(photoHeightMm) || 45) * mmToY;
    const gap = 2 * mmToX;
    const left = Math.max(0, Number(pageMargins.left) || 0) * mmToX;
    const right = 794 - Math.max(0, Number(pageMargins.right) || 0) * mmToX;
    const top = Math.max(0, Number(pageMargins.top) || 0) * mmToY;
    const bottom = 1123 - Math.max(0, Number(pageMargins.bottom) || 0) * mmToY;
    const cols = Math.max(1, Math.min(count, Math.floor((right - left + gap) / (w + gap))));
    const rows = Math.max(1, Math.floor((bottom - top + gap) / (h + gap)));
    const capacity = cols * rows;
    const actualCount = Math.min(count, capacity);
    const startX = left + Math.max(0, (right - left - (cols * w + (cols - 1) * gap)) / 2);
    const usedRows = Math.ceil(actualCount / cols);
    const startY = top + Math.max(0, (bottom - top - (usedRows * h + (usedRows - 1) * gap)) / 2);
    const copies = Array.from({ length: actualCount }, (_, index) => ({ ...source, id: uid(), name: source.name + " · copy " + (index + 1), x: startX + (index % cols) * (w + gap), y: startY + Math.floor(index / cols) * (h + gap), w, h }));
    setItems(old => [...old, ...copies.map(i => ({ ...i, pageId: activePage }))]);
    setMode("photo"); setStatus(actualCount + " copies का photo sheet बनाया गया।" + (actualCount < count ? " इस page पर margins और photo size के अनुसार अधिकतम " + capacity + " copies fit हुईं; बाकी के लिए दूसरा page जोड़ें।" : " Print से पहले size और spacing जाँचें।"));
  };
  const arrangeGrid = () => {
    const count = pageItems.length; if (!count) return;
    const mmToX = 794 / pageSize.w, mmToY = 1123 / pageSize.h;
    const left = Math.max(0, Number(pageMargins.left) || 0) * mmToX;
    const right = 794 - Math.max(0, Number(pageMargins.right) || 0) * mmToX;
    const top = Math.max(0, Number(pageMargins.top) || 0) * mmToY;
    const bottom = 1123 - Math.max(0, Number(pageMargins.bottom) || 0) * mmToY;
    const gap = 4 * mmToX;
    const cols = Math.ceil(Math.sqrt(count)), rows = Math.ceil(count / cols);
    const cellW = (right - left - gap * (cols + 1)) / cols, cellH = (bottom - top - gap * (rows + 1)) / rows;
    setItems(old => old.map(item => {
      if (item.pageId !== activePage) return item;
      const index = pageItems.findIndex(p => p.id === item.id);
      const ratio = item.w / item.h, scale = Math.min((cellW - 12) / item.w, (cellH - 12) / item.h);
      const w = item.w * scale, h = item.h * scale;
      return { ...item, x: left + gap + (index % cols) * (cellW + gap) + (cellW - w) / 2, y: top + gap + Math.floor(index / cols) * (cellH + gap) + (cellH - h) / 2, w, h };
    }));
    setMode("grid"); setStatus("इस page के photos automatic grid में arrange किए गए।");
  };
  const print = () => { if (!items.length) { setStatus("Print से पहले files जोड़ें।"); return; } window.print(); };

  return <main className="editor">
    <style jsx>{`
      .editor{max-width:1200px;margin:auto;padding:22px 16px 40px;font-family:Arial,sans-serif;color:#17251f}
      .top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.back{color:#176b4d;text-decoration:none;font-weight:700}
      h1{font-size:clamp(25px,4vw,34px);margin:18px 0 8px}.intro{color:#58685e;line-height:1.5;max-width:850px}
      .toolbar,.panel{display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:12px;background:#f2f7f3;border:1px solid #dce8df;border-radius:12px;margin:14px 0}
      .btn{border:0;border-radius:8px;padding:9px 12px;background:#176b4d;color:white;font-weight:700;cursor:pointer}.secondary{background:white;color:#24533d;border:1px solid #cbd9ce}.btn:disabled{opacity:.45}
      .status{min-height:22px;color:#28553d}.workspace{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:16px;align-items:start}
      .stage-wrap{padding:12px;background:#e9eeeb;border-radius:12px;min-width:0}.stage{position:relative;width:100%;aspect-ratio:210/297;background:white;overflow:hidden;box-shadow:0 3px 14px #17251f22;touch-action:none}
      .placed{position:absolute;border:1px dashed transparent;cursor:move;box-sizing:border-box;touch-action:none}.placed.active{border:2px solid #176b4d}.placed.multi{outline:1px solid #7aa58b}.placed img{width:100%;height:100%;object-fit:fill;pointer-events:none;display:block}
      .resize-handle{position:absolute;width:11px;height:11px;border:1px solid white;border-radius:50%;background:#176b4d;z-index:3;touch-action:none}
      .nw{left:-6px;top:-6px;cursor:nwse-resize}.ne{right:-6px;top:-6px;cursor:nesw-resize}.sw{left:-6px;bottom:-6px;cursor:nesw-resize}.se{right:-6px;bottom:-6px;cursor:nwse-resize}
      .n{left:calc(50% - 5px);top:-6px;cursor:ns-resize}.s{left:calc(50% - 5px);bottom:-6px;cursor:ns-resize}.w{left:-6px;top:calc(50% - 5px);cursor:ew-resize}.e{right:-6px;top:calc(50% - 5px);cursor:ew-resize}
      .side{background:white;border:1px solid #dce5de;border-radius:12px;padding:13px;display:grid;gap:10px}.side h2{font-size:17px;margin:0}.field{display:grid;gap:4px;font-size:12px;font-weight:700;color:#53645a}.field input,.field select{width:100%;box-sizing:border-box;padding:8px;border:1px solid #cbd9ce;border-radius:7px;background:white;color:#17251f}
      .thumbs{display:grid;gap:7px}.thumb{display:grid;grid-template-columns:20px 54px minmax(0,1fr);gap:8px;align-items:center;padding:6px;border:1px solid #dce5de;border-radius:8px;cursor:pointer;background:white}.thumb.chosen{border-color:#176b4d;background:#f1f8f3}.thumb input[type=checkbox]{width:17px;height:17px;accent-color:#176b4d}.thumb img{width:54px;height:54px;object-fit:contain;background:#f5f7f5}.small{font-size:12px;color:#5c6b62;overflow-wrap:anywhere}
      .pages{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.pagebtn{padding:7px 9px;border:1px solid #cbd9ce;border-radius:7px;background:white;color:#24533d}.pagebtn.active{background:#176b4d;color:white}
      .margin-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      @media(max-width:780px){.workspace{grid-template-columns:1fr}.side{order:-1}}
      @media print{@page{size:${pageSize.w}mm ${pageSize.h}mm;margin:0}body{margin:0!important}.editor{padding:0!important;margin:0!important;max-width:none!important}.top,h1,.intro,.toolbar,.panel,.status,.side{display:none!important}.workspace,.stage-wrap{display:block!important;padding:0!important;margin:0!important;background:transparent!important}.stage{width:${pageSize.w}mm!important;height:${pageSize.h}mm!important;aspect-ratio:auto!important;box-shadow:none!important;overflow:hidden!important;page-break-after:always;break-after:page}.placed{border:0!important}}
    `}</style>
    <div className="top"><a className="back" href="/document-tools">← Document Tools</a><span className="small">Multi-file · PDF pages · Custom print size</span></div>
    <h1>Print Layout Editor</h1>
    <p className="intro">एक ही जगह images और PDFs जोड़ें। PDF के हर page का preview layout में आएगा। तय करें कौन-सी photos एक collage में रहेंगी और कौन अलग pages पर जाएँगी।</p>
    <section className="toolbar">
      <label className="btn secondary">Add images / PDFs<input type="file" accept="image/*,application/pdf,.pdf" multiple onChange={addFiles} hidden /></label>
      <label className="field">PDF password (if required)<input type="password" value={pdfPassword} onChange={e => setPdfPassword(e.target.value)} placeholder="PDF password" /></label>
      <button className="btn secondary" onClick={addPage}>+ Separate page</button>
      <button className="btn" onClick={print} disabled={!items.length || busy}>Print preview</button>
    </section>
    <section className="panel">
      <label className="field">Page size<select value={preset} onChange={e => setPreset(e.target.value as PagePreset)}>{["A4","A3","A5","Legal","Custom"].map(p => <option key={p}>{p}</option>)}</select></label>
      {preset === "Custom" && <><label className="field">Width (mm)<input type="number" min="20" value={customW} onChange={e => setCustomW(e.target.value)} /></label><label className="field">Height (mm)<input type="number" min="20" value={customH} onChange={e => setCustomH(e.target.value)} /></label></>}
      <label className="field">Workflow<select value={mode} onChange={e => setMode(e.target.value as "manual" | "grid" | "photo")}><option value="manual">Manual layout</option><option value="grid">Automatic collage</option><option value="photo">Photo sheet</option></select></label>
      <button className="btn secondary" onClick={arrangeGrid} disabled={!pageItems.length}>Arrange this page as collage</button>
      <label className="field">Copies<input type="number" min="1" max="30" value={photoCopies} onChange={e => setPhotoCopies(e.target.value)} /></label>
      <label className="field">Photo width (mm)<input type="number" min="20" max="100" step="0.1" value={photoWidthMm} onChange={e => setPhotoWidthMm(e.target.value)} /></label>
      <label className="field">Photo height (mm)<input type="number" min="20" max="120" step="0.1" value={photoHeightMm} onChange={e => setPhotoHeightMm(e.target.value)} /></label>
      <button className="btn secondary" onClick={createPhotoSheet} disabled={!selected}>Create passport / ID photo sheet</button>
    </section>
    <p className="status" role="status" aria-live="polite">{busy ? "Files process हो रही हैं…" : status}</p>
    <div className="workspace">
      <div className="stage-wrap">
        <div className="pages">{pages.map(p => <button key={p.id} className={"pagebtn " + (activePage === p.id ? "active" : "")} onClick={() => setActivePage(p.id)}>{p.label} ({items.filter(i => i.pageId === p.id).length})</button>)}</div>
        <div className="stage" ref={stageRef} style={{ aspectRatio: pageSize.w + "/" + pageSize.h }} onPointerMove={e => {
          if (!stageRef.current) return;
          const rect=stageRef.current.getBoundingClientRect(), sx=794/rect.width, sy=1123/rect.height;
          if(resizeState){
            const dx=(e.clientX-resizeState.startX)*sx, dy=(e.clientY-resizeState.startY)*sy;
            setItems(old=>old.map(i=>{if(i.id!==resizeState.id)return i;let {x,y,w,h}=i;const handle=resizeState.handle;
              if(handle.includes("e"))w=Math.max(12,resizeState.startW+dx);if(handle.includes("s"))h=Math.max(12,resizeState.startH+dy);
              if(handle.includes("w")){w=Math.max(12,resizeState.startW-dx);x=i.x+(resizeState.startW-w);}
              if(handle.includes("n")){h=Math.max(12,resizeState.startH-dy);y=i.y+(resizeState.startH-h);}
              return {...i,x,y,w,h};}));
            return;
          }
          if(!dragId)return;
          const x=(e.clientX-rect.left)*sx-dragOffsetRef.current.x,y=(e.clientY-rect.top)*sy-dragOffsetRef.current.y;
          setItems(old=>old.map(i=>i.id===dragId?{...i,x:Math.max(0,Math.min(794-i.w,x)),y:Math.max(0,Math.min(1123-i.h,y))}:i));
        }} onPointerUp={()=>{setDragId(null);setResizeState(null);}} onPointerLeave={()=>{setDragId(null);setResizeState(null);}}>
          {pageItems.map(item => <div key={item.id} className={"placed " + (selectedId === item.id ? "active " : "") + (selectedIds.includes(item.id) ? "multi" : "")} style={{left:(item.x/794*100)+"%",top:(item.y/1123*100)+"%",width:(item.w/794*100)+"%",height:(item.h/1123*100)+"%"}} onPointerDown={e => { e.preventDefault(); if(e.ctrlKey||e.metaKey||e.shiftKey||e.nativeEvent.ctrlKey||e.nativeEvent.metaKey||e.nativeEvent.shiftKey){setSelectedIds(old=>old.includes(item.id)?old.filter(id=>id!==item.id):[...old,item.id]);setSelectedId(item.id);return;} const rect=stageRef.current?.getBoundingClientRect(); if(rect){dragOffsetRef.current={x:(e.clientX-rect.left)*794/rect.width-item.x,y:(e.clientY-rect.top)*1123/rect.height-item.y};} setSelectedId(item.id); setSelectedIds([item.id]); setDragId(item.id); }}>
            <img src={item.src} alt={item.name} draggable={false} />
            {selectedId===item.id && ["nw","n","ne","e","se","s","sw","w"].map(handle=><span key={handle} className={"resize-handle "+handle} onPointerDown={e=>{e.stopPropagation();e.preventDefault();setSelectedId(item.id);setSelectedIds([item.id]);setResizeState({id:item.id,handle,startX:e.clientX,startY:e.clientY,startW:item.w,startH:item.h});}} />)}
          </div>)}
          {!pageItems.length && <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#829087"}}>इस page पर photos जोड़ें या organizer से move करें</div>}
        </div>
      </div>
      <aside className="side">
        <h2>Photo / page organizer</h2>
        <p className="small">हर thumbnail के checkbox से selection करें। Ctrl/⌘+Click या Shift+Click भी supported है। Ctrl+A से current page की सभी photos select होंगी।</p>
        <button className="btn secondary" onClick={()=>{setSelectedIds(pageItems.map(i=>i.id));setStatus("Current page की सभी photos select हुईं।")}}>Select all on this page</button>
        <button className="btn secondary" onClick={()=>{setSelectedIds([]);setStatus("Selection clear कर दी गई।")}}>Clear selection</button>
        <strong className="small">Page margins (mm)</strong>
        <div className="margin-grid">
          {(["top","right","bottom","left"] as const).map(side => <label className="field" key={side}>{side[0].toUpperCase()+side.slice(1)}<input type="number" min="0" max="50" step="0.5" value={pageMargins[side]} onChange={e => setPageMargins(old => ({...old,[side]:e.target.value}))} /></label>)}
        </div>
        <p className="small">Ctrl+C copy · Ctrl+V paste · Drag photo to position</p>
        <div className="thumbs">{items.map(item => <div key={item.id} className={"thumb "+(selectedIds.includes(item.id)?"chosen":"")} onClick={() => {setSelectedId(item.id);setActivePage(item.pageId);}}>
          <input type="checkbox" aria-label={"Select "+item.name} checked={selectedIds.includes(item.id)} onClick={e=>e.stopPropagation()} onChange={e=>{setActivePage(item.pageId);if(e.target.checked){setSelectedIds(old=>old.includes(item.id)?old:[...old,item.id]);setSelectedId(item.id);}else{setSelectedIds(old=>old.filter(id=>id!==item.id));if(selectedId===item.id){const next=selectedIds.find(id=>id!==item.id);setSelectedId(next||null);}}}} />
          <img src={item.src} alt="" /><div><strong className="small">{item.name}</strong><div className="small">Page {item.pageId}</div><select aria-label="Assign page" value={item.pageId} onClick={e => e.stopPropagation()} onChange={e => moveToPage(item.id, Number(e.target.value))}>{pages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
        </div>)}</div>
        {selected && <><hr /><strong className="small">{selected.name}</strong>
          <div className="position-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <label className="field">X (mm)<input type="number" step="0.1" value={(selected.x / 794 * pageSize.w).toFixed(1)} onChange={e => updateSelected("x",String(Number(e.target.value) * 794 / pageSize.w))} /></label>
            <label className="field">Y (mm)<input type="number" step="0.1" value={(selected.y / 1123 * pageSize.h).toFixed(1)} onChange={e => updateSelected("y",String(Number(e.target.value) * 1123 / pageSize.h))} /></label>
            <label className="field">Width (mm)<input type="number" min="1" step="0.1" value={(selected.w / 794 * pageSize.w).toFixed(1)} onChange={e => updateSelected("w",String(Number(e.target.value) * 794 / pageSize.w))} /></label>
            <label className="field">Height (mm)<input type="number" min="1" step="0.1" value={(selected.h / 1123 * pageSize.h).toFixed(1)} onChange={e => updateSelected("h",String(Number(e.target.value) * 1123 / pageSize.h))} /></label>
          </div>
          <button className="btn secondary" onClick={() => moveToPage(selected.id, activePage)}>Move to current page</button>
          <button className="btn secondary" onClick={() => {setClipboardItem({...selected});setStatus("Photo copied. Press Ctrl+V to paste.");}}>Copy (Ctrl+C)</button>
          <button className="btn secondary" onClick={() => {const copy={...selected,id:uid(),name:selected.name+" copy",pageId:activePage,x:Math.min(794-selected.w,selected.x+24),y:Math.min(1123-selected.h,selected.y+24)};setItems(old=>[...old,copy]);setSelectedId(copy.id);}}>Duplicate</button>
          <button className="btn secondary" onClick={deleteItem}>Remove selected</button>
        </>}
        <p className="small">PDF pages are rendered locally in this browser. Password-protected PDFs require the correct password. Official passport/visa/PAN photo specifications must be verified against the relevant current form before printing.</p>
      </aside>
    </div>
  </main>;
}
