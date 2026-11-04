"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

type Asset = { id: string; name: string; dataUrl: string; width: number; height: number; source: "image" | "pdf" };
type PdfJsPage = { getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } };
type PdfJsDoc = { numPages: number; getPage: (n: number) => Promise<PdfJsPage> };
type PdfJsLib = { GlobalWorkerOptions: { workerSrc: string }; getDocument: (options: { data: ArrayBuffer; password?: string }) => { promise: Promise<PdfJsDoc> } };

let pdfJsPromise: Promise<PdfJsLib> | null = null;
function loadPdfJs(): Promise<PdfJsLib> {
  const w = window as Window & { pdfjsLib?: PdfJsLib };
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (!pdfJsPromise) pdfJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (!lib) return reject(new Error("PDF engine लोड नहीं हुआ।"));
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(lib);
    };
    script.onerror = () => reject(new Error("PDF engine डाउनलोड नहीं हो सका। Internet connection जाँचें।"));
    document.head.appendChild(script);
  });
  return pdfJsPromise;
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("File read नहीं हो सकी।"));
    reader.onerror = () => reject(new Error("File read नहीं हो सकी।"));
    reader.readAsDataURL(file);
  });
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image preview नहीं खुला।"));
    image.src = src;
  });
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function cmToPx(cm: number, dpi: number) { return Math.max(1, Math.round(cm / 2.54 * dpi)); }

export default function SmartPhotoDocumentStudio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [intent, setIntent] = useState("");
  const [widthCm, setWidthCm] = useState("3.5");
  const [heightCm, setHeightCm] = useState("4.5");
  const [dpi, setDpi] = useState("300");
  const [maxKb, setMaxKb] = useState("50");
  const [pixelWidth, setPixelWidth] = useState("");
  const [pixelHeight, setPixelHeight] = useState("");
  const [compressionQuality, setCompressionQuality] = useState("0.9");
  const [chatMessages, setChatMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([{ role: "assistant", text: "बताइए फोटो या document में क्या बदलाव चाहिए। उदाहरण: 3.5 × 4.5 cm, 300 DPI और अधिकतम 50 KB." }]);
  const [marginMm, setMarginMm] = useState("8");
  const [gapMm, setGapMm] = useState("3");
  const [whiteBg, setWhiteBg] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Images या PDF upload करें। Original files browser में ही रहती हैं।");
  const [activeTab, setActiveTab] = useState<"photo" | "document" | "print">("photo");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedAssets = useMemo(() => assets.filter(a => selected.includes(a.id)), [assets, selected]);

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setStatus("Files पढ़ी जा रही हैं…");
    const added: Asset[] = [];
    try {
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) { setStatus(file.name + " 25 MB से बड़ी है, skip की गई।"); continue; }
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (isPdf) {
          const lib = await loadPdfJs();
          const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
          const limit = Math.min(pdf.numPages, 30);
          for (let pageNo = 1; pageNo <= limit; pageNo++) {
            const page = await pdf.getPage(pageNo);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("PDF canvas उपलब्ध नहीं है।");
            await page.render({ canvas, canvasContext: ctx, viewport }).promise;
            added.push({ id: crypto.randomUUID(), name: file.name + " · Page " + pageNo, dataUrl: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height, source: "pdf" });
          }
          if (pdf.numPages > limit) setStatus(file.name + ": पहले 30 pages import किए गए।");
        } else if (file.type.startsWith("image/")) {
          const dataUrl = await readDataUrl(file);
          const image = await loadImage(dataUrl);
          added.push({ id: crypto.randomUUID(), name: file.name, dataUrl, width: image.naturalWidth, height: image.naturalHeight, source: "image" });
        } else setStatus(file.name + " unsupported format है।");
      }
      setAssets(prev => [...prev, ...added]);
      setSelected(prev => [...prev, ...added.map(a => a.id)]);
      setStatus(added.length + " asset(s) workspace में जोड़े गए। PDF के pages अलग-अलग editable image assets हैं।");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Files import नहीं हो सकीं। Password-protected PDF के लिए पहले password हटाकर upload करें।");
    } finally { setBusy(false); }
  };

  const parseIntent = async () => {
    const instruction = intent.trim();
    if (!instruction) return;
    setBusy(true);
    setChatMessages(prev => [...prev, { role: "user", text: instruction }]);
    setIntent("");
    setStatus("AI instruction समझ रहा है…");
    try {
      const response = await fetch("/api/ai/intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI request असफल रही।");
      const s = result.settings || {};
      if (typeof s.widthCm === "number") setWidthCm(String(s.widthCm));
      if (typeof s.heightCm === "number") setHeightCm(String(s.heightCm));
      if (typeof s.dpi === "number") setDpi(String(s.dpi));
      if (typeof s.maxKb === "number") setMaxKb(String(s.maxKb));
      if (typeof s.pixelWidth === "number") setPixelWidth(String(s.pixelWidth));
      if (typeof s.pixelHeight === "number") setPixelHeight(String(s.pixelHeight));
      if (typeof s.compressionQuality === "number") setCompressionQuality(String(s.compressionQuality));
      if (typeof s.whiteBg === "boolean") setWhiteBg(s.whiteBg);
      const explanation = result.explanation || "Instruction के अनुसार settings update कर दी गई हैं।";
      const note = result.missingInfo?.length ? " स्पष्ट करने की जरूरत: " + result.missingInfo.join(", ") : "";
      setChatMessages(prev => [...prev, { role: "assistant", text: explanation + note + " Settings panel में values जाँचकर फिर export करें." }]);
      setStatus("AI ने settings interpret कीं। कोई बदलाव export करने से पहले आप जाँच सकते हैं।");
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request असफल रही।";
      setChatMessages(prev => [...prev, { role: "assistant", text: "AI से response नहीं मिला: " + message + " API key और deployment environment जाँचें." }]);
      setStatus(message);
    } finally { setBusy(false); }
  };
  const makeJpeg = useCallback(async (asset: Asset): Promise<Blob> => {
    const image = await loadImage(asset.dataUrl);
    const w = Math.max(1, Math.min(10000, Number(pixelWidth) || cmToPx(Number(widthCm) || 3.5, Number(dpi) || 300)));
    const h = Math.max(1, Math.min(10000, Number(pixelHeight) || cmToPx(Number(heightCm) || 4.5, Number(dpi) || 300)));
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processor उपलब्ध नहीं है।");
    if (whiteBg) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const sw = w / scale, sh = h / scale;
    const sx = (image.naturalWidth - sw) / 2, sy = (image.naturalHeight - sh) / 2;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, w, h);
    const limit = Math.max(1, Number(maxKb) || 50) * 1024;
    let low = 0.08, high = Math.max(0.08, Math.min(0.98, Number(compressionQuality) || 0.9)), best: Blob | null = null;
    for (let i = 0; i < 12; i++) {
      const q = (low + high) / 2;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", q));
      if (!blob) throw new Error("JPEG export असफल रहा।");
      if (blob.size <= limit) { best = blob; low = q; } else high = q;
    }
    if (!best) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.08));
      if (!blob || blob.size > limit) throw new Error(asset.name + ": चुनी गई dimensions पर " + maxKb + " KB limit पूरी नहीं हुई। KB बढ़ाएँ या dimensions घटाएँ।");
      best = blob;
    }
    return best;
  }, [widthCm, heightCm, dpi, whiteBg, maxKb, pixelWidth, pixelHeight, compressionQuality]);

  const exportImages = async () => {
    const targets = selectedAssets.length ? selectedAssets : assets;
    if (!targets.length) { setStatus("पहले कम से कम एक image या PDF page चुनें।"); return; }
    setBusy(true); setStatus("Selected images compress हो रही हैं…");
    try {
      const zipModule = await import("jszip");
      const zip = new zipModule.default();
      for (const asset of targets) {
        const blob = await makeJpeg(asset);
        zip.file(asset.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "_") + ".jpg", blob);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      download(archive, "cscskb-compressed-images.zip");
      setStatus(targets.length + " image(s) compressed. ZIP download तैयार है।");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Compression असफल रही।"); }
    finally { setBusy(false); }
  };

  const exportA4 = async () => {
    const targets = selectedAssets.length ? selectedAssets : assets;
    if (!targets.length) { setStatus("A4 sheet बनाने के लिए assets upload/select करें।"); return; }
    setBusy(true); setStatus("A4 print layout तैयार हो रहा है…");
    try {
      const pdf = await PDFDocument.create();
      const pageW = 595.28, pageH = 841.89;
      const mm = 72 / 25.4;
      const margin = Math.max(0, Number(marginMm) || 8) * mm;
      const gap = Math.max(0, Number(gapMm) || 3) * mm;
      const photoW = (Number(widthCm) || 3.5) * 10 * mm;
      const photoH = (Number(heightCm) || 4.5) * 10 * mm;
      const cols = Math.max(1, Math.floor((pageW - 2 * margin + gap) / (photoW + gap)));
      const rows = Math.max(1, Math.floor((pageH - 2 * margin + gap) / (photoH + gap)));
      if (photoW > pageW - 2 * margin || photoH > pageH - 2 * margin) throw new Error("Photo dimensions A4 printable area से बड़ी हैं।");
      const perPage = cols * rows;
      for (let start = 0; start < targets.length; start += perPage) {
        const page = pdf.addPage([pageW, pageH]);
        const batch = targets.slice(start, start + perPage);
        for (let i = 0; i < batch.length; i++) {
          const blob = await makeJpeg(batch[i]);
          const bytes = new Uint8Array(await blob.arrayBuffer());
          const embedded = await pdf.embedJpg(bytes);
          const col = i % cols, row = Math.floor(i / cols);
          const x = margin + col * (photoW + gap);
          const y = pageH - margin - photoH - row * (photoH + gap);
          page.drawImage(embedded, { x, y, width: photoW, height: photoH });
        }
      }
      const bytes = await pdf.save();
      const pdfBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(pdfBuffer).set(bytes);
      download(new Blob([pdfBuffer], { type: "application/pdf" }), "cscskb-A4-print-sheet.pdf");
      setStatus("A4 PDF तैयार: " + targets.length + " photos · " + cols + " columns × " + rows + " rows per page · " + Math.ceil(targets.length / perPage) + " page(s).");
    } catch (error) { setStatus(error instanceof Error ? error.message : "A4 PDF export असफल रहा।"); }
    finally { setBusy(false); }
  };

  const removeSelected = useCallback(() => {
    setAssets(prev => prev.filter(a => !selected.includes(a.id)));
    setSelected([]);
    setStatus("Selected assets workspace से हटाए गए। Original files में कोई बदलाव नहीं हुआ।");
  }, [selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") { event.preventDefault(); setSelected(assets.map(a => a.id)); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void exportA4(); }
      if (event.key === "Delete" && selected.length) removeSelected();
      if (event.key === "Escape") setSelected([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assets, selected, removeSelected]);

  return (
    <main className="studio-shell">
      <style>{`
        .studio-shell{min-height:100vh;background:#f3f6f8;color:#17212b;padding:24px;font-family:Arial,sans-serif}
        .studio-wrap{max-width:1240px;margin:auto}.studio-head{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}
        .studio-head h1{font-size:27px;margin:0 0 6px}.studio-head p{margin:0;color:#5d6b78}
        .studio-tabs{display:flex;gap:8px;margin:22px 0}.studio-tabs button,.studio-btn{border:1px solid #cbd5df;border-radius:10px;padding:10px 14px;background:white;color:#17212b;cursor:pointer;font-weight:600}
        .studio-tabs button.active,.studio-btn.primary{background:#173d5b;color:white;border-color:#173d5b}.studio-grid{display:grid;grid-template-columns:320px 1fr;gap:18px}
        .studio-card{background:white;border:1px solid #dce3e9;border-radius:15px;padding:17px;box-shadow:0 3px 14px #1425360a}.studio-card h2{font-size:17px;margin:0 0 13px}
        .studio-field{display:block;margin:12px 0;font-size:13px;color:#52616e}.studio-field input{display:block;width:100%;box-sizing:border-box;margin-top:5px;border:1px solid #cbd5df;border-radius:8px;padding:9px;color:#17212b;background:white}
        .studio-intent{display:flex;gap:8px;margin-bottom:16px}.studio-intent input{flex:1;min-width:0;border:1px solid #cbd5df;border-radius:10px;padding:12px}
        .studio-assets{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:12px}.studio-asset{border:2px solid #e1e7ed;border-radius:11px;padding:8px;cursor:pointer;min-width:0}.studio-asset.selected{border-color:#176b9a;background:#eff8fc}
        .studio-asset img{width:100%;height:130px;object-fit:contain;background:#f1f3f5;border-radius:7px}.studio-asset p{font-size:12px;overflow-wrap:anywhere;margin:7px 0 2px}
        .studio-actions{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}.studio-status{padding:12px;background:#eef5f8;border-radius:10px;color:#28465b;font-size:13px;margin-top:15px}
        .studio-help{font-size:12px;line-height:1.6;color:#667581;margin-top:14px}@media(max-width:800px){.studio-shell{padding:12px}.studio-grid{grid-template-columns:1fr}.studio-intent{flex-wrap:wrap}.studio-intent input{flex-basis:100%}}
      `}</style>
      <div className="studio-wrap">
        <header className="studio-head"><div><h1>Smart Photo &amp; Document Studio</h1><p>एक workspace में photo editing, PDF pages और A4 print layout</p></div><button className="studio-btn" onClick={() => inputRef.current?.click()} disabled={busy}>＋ Upload files</button></header>
        <nav className="studio-tabs">
          <button className={activeTab === "photo" ? "active" : ""} onClick={() => setActiveTab("photo")}>Photo Studio</button>
          <button className={activeTab === "document" ? "active" : ""} onClick={() => setActiveTab("document")}>Document Studio</button>
          <button className={activeTab === "print" ? "active" : ""} onClick={() => setActiveTab("print")}>Print Studio</button>
        </nav>
        <input ref={inputRef} type="file" accept="image/*,application/pdf,.pdf" multiple hidden onChange={addFiles} />
        
        <div className="studio-grid">
          <aside className="studio-card">
            <h2>Output settings</h2>
            <label className="studio-field">Width (cm)<input type="number" min="0.5" max="20" step="0.1" value={widthCm} onChange={e => setWidthCm(e.target.value)} /></label>
            <label className="studio-field">Height (cm)<input type="number" min="0.5" max="28" step="0.1" value={heightCm} onChange={e => setHeightCm(e.target.value)} /></label>
            <label className="studio-field">Resolution (DPI)<input type="number" min="72" max="1200" value={dpi} onChange={e => setDpi(e.target.value)} /></label>
            <label className="studio-field">Maximum file size (KB)<input type="number" min="1" max="10000" value={maxKb} onChange={e => setMaxKb(e.target.value)} /></label>
            <label className="studio-field">Pixel width (px, optional)<input type="number" min="1" max="10000" value={pixelWidth} onChange={e => setPixelWidth(e.target.value)} placeholder={String(cmToPx(Number(widthCm) || 3.5, Number(dpi) || 300))} /></label>
            <label className="studio-field">Pixel height (px, optional)<input type="number" min="1" max="10000" value={pixelHeight} onChange={e => setPixelHeight(e.target.value)} placeholder={String(cmToPx(Number(heightCm) || 4.5, Number(dpi) || 300))} /></label>
            <label className="studio-field">Compression quality (0.08–0.98)<input type="number" min="0.08" max="0.98" step="0.01" value={compressionQuality} onChange={e => setCompressionQuality(e.target.value)} /></label>
            <label className="studio-field">A4 margin (mm)<input type="number" min="0" max="30" value={marginMm} onChange={e => setMarginMm(e.target.value)} /></label>
            <label className="studio-field">Photo gap (mm)<input type="number" min="0" max="20" value={gapMm} onChange={e => setGapMm(e.target.value)} /></label>
            <label className="studio-field"><input type="checkbox" checked={whiteBg} onChange={e => setWhiteBg(e.target.checked)} /> White background</label>
            <div className="studio-actions"><button className="studio-btn primary" onClick={exportImages} disabled={busy || !assets.length}>Compress selected</button><button className="studio-btn" onClick={exportA4} disabled={busy || !assets.length}>Export A4 PDF</button></div>
            <p className="studio-help">Compression में dimensions आपके चुने हुए cm और DPI से बनते हैं। यदि चुनी गई KB सीमा संभव नहीं होगी तो app स्पष्ट error देगा; original asset नहीं बदलेगा।</p>
          </aside>
          <section className="studio-card">
            <h2>{activeTab === "photo" ? "Photo assets" : activeTab === "document" ? "Document pages" : "A4 print workspace"} <span style={{fontWeight:400,color:"#71808c"}}>· {assets.length} total</span></h2>
            <div className="studio-actions"><button className="studio-btn" onClick={() => setSelected(assets.map(a => a.id))}>Select all</button><button className="studio-btn" onClick={() => setSelected([])}>Clear selection</button><button className="studio-btn" onClick={removeSelected} disabled={!selected.length}>Remove selected</button></div>
            {assets.length ? <div className="studio-assets">{assets.map(asset => <div key={asset.id} className={"studio-asset " + (selected.includes(asset.id) ? "selected" : "")} onClick={() => setSelected(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id])}><img src={asset.dataUrl} alt={asset.name} /><p><strong>{asset.name}</strong></p><p>{asset.width} × {asset.height}px · {asset.source === "pdf" ? "PDF page" : "Image"}</p></div>)}</div> : <div style={{padding:"48px 16px",textAlign:"center",border:"1px dashed #cbd5df",borderRadius:12,color:"#6b7a86"}}><div style={{fontSize:34}}>▧</div><strong>Upload images or PDF</strong><p>Multiple files supported · PDF pages become separate assets</p><button className="studio-btn primary" onClick={() => inputRef.current?.click()}>Choose files</button></div>}
            <div className="studio-status" role="status">{busy ? "Processing… " : ""}{status}</div>
            <p className="studio-help">Shortcuts: Ctrl+A select all · Delete remove selected · Esc clear selection · Ctrl+S export A4 PDF. Files are processed in this browser session; nothing is uploaded to a server by this page.</p>
          </section>
        </div>
        <section className="studio-card" style={{ marginTop: 18 }} aria-label="AI assistant">
          <h2>AI Studio Assistant</h2>
          <div style={{ maxHeight: 190, overflowY: "auto", display: "grid", gap: 8, marginBottom: 12 }} aria-live="polite">
            {chatMessages.map((message, index) => <div key={index} style={{ justifySelf: message.role === "user" ? "end" : "start", maxWidth: "88%", padding: "9px 12px", borderRadius: 10, background: message.role === "user" ? "#e8f2f8" : "#f1f4f6", fontSize: 13, lineHeight: 1.5 }}>{message.text}</div>)}
          </div>
          <div className="studio-intent" style={{ marginBottom: 0 }}>
            <input aria-label="AI instruction" value={intent} onChange={e => setIntent(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void parseIntent(); } }} placeholder="उदाहरण: फोटो 200 × 230 px और 30 KB से कम करें" />
            <button className="studio-btn primary" onClick={() => void parseIntent()} disabled={busy || !intent.trim()}>Send instruction</button>
          </div>
          <p className="studio-help">Privacy: इस चैट में केवल आपका लिखा हुआ instruction OpenRouter को भेजा जाता है। Uploaded photos और PDFs इसी browser में process होते हैं। AI द्वारा बदली गई settings export से पहले editable रहती हैं।</p>
        </section>
      </div>
    </main>
  );
}
