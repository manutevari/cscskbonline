"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
type Crop = { x: number; y: number; width: number; height: number };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function jpegToPdf(jpeg: Uint8Array, width: number, height: number): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const push = (part: Uint8Array) => { parts.push(part); length += part.length; };
  const ascii = (s: string) => enc.encode(s);
  push(ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
  const object = (id: number, body: Uint8Array) => {
    offsets[id] = length;
    push(ascii(id + " 0 obj\n"));
    push(body);
    push(ascii("\nendobj\n"));
  };
  object(1, ascii("<< /Type /Catalog /Pages 2 0 R >>"));
  object(2, ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  object(3, ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + width + " " + height + "] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"));
  offsets[4] = length;
  push(ascii("4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + width + " /Height " + height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpeg.length + " >>\nstream\n"));
  push(jpeg);
  push(ascii("\nendstream\nendobj\n"));
  const stream = ascii("q\n" + width + " 0 0 " + height + " 0 0 cm\n/Im0 Do\nQ\n");
  object(5, concat(ascii("<< /Length " + stream.length + " >>\nstream\n"), stream, ascii("endstream")));
  const xrefOffset = length;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  push(ascii(xref + "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF"));
  const pdfBytes = concat(...parts);\n  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
function concat(...arrays: Uint8Array[]) {
  const size = arrays.reduce((sum, item) => sum + item.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  arrays.forEach((item) => { out.set(item, offset); offset += item.length; });
  return out;
}

export default function DocumentToolsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState("200");
  const [targetHeight, setTargetHeight] = useState("230");
  const [maxKb, setMaxKb] = useState("50");
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [notificationText, setNotificationText] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [cropMode, setCropMode] = useState<"manual" | "auto">("manual");
  const imageRef = useRef<HTMLImageElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);

  const loadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setStatus("इस संस्करण में input के रूप में JPG, PNG, WebP, GIF और browser-supported images उपलब्ध हैं। PDF को image में बदलना अभी उपलब्ध नहीं है।");
      event.target.value = "";
      return;
    }
    if (next.size > 20 * 1024 * 1024) {
      setStatus("फाइल 20 MB से बड़ी है। कृपया छोटी image चुनें।");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(next);
    setFile(next);
    setSourceUrl(url);
    setDimensions({ width: 0, height: 0 });
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setStatus("फाइल चुनी गई है। Preview तैयार होने पर crop और resize कर सकते हैं।");
  };

  const onImageLoaded = () => {
    const image = imageRef.current;
    if (!image) return;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    setDimensions({ width, height });
    setCrop({ x: 0, y: 0, width, height });
    setStatus(`Upload सफल: ${file?.name || "image"} · ${width} × ${height}px · ${((file?.size || 0) / 1024).toFixed(1)} KB`);
  };

  const applyAutoRules = () => {
    const text = notificationText;
    const sizeMatch = text.match(/(?:max(?:imum)?\s*)?(\d+(?:\.\d+)?)\s*(kb|k\s*b)/i);
    const dimMatch = text.match(/(\d{2,5})\s*[×xX*]\s*(\d{2,5})\s*(?:px|pixels?)?/i);
    const formatMatch = text.match(/\b(jpe?g|png|webp)\b/i);
    if (sizeMatch) setMaxKb(String(Math.max(1, Number(sizeMatch[1]))));
    if (dimMatch) { setTargetWidth(dimMatch[1]); setTargetHeight(dimMatch[2]); }
    if (formatMatch) {
      const f = formatMatch[1].toLowerCase();
      setFormat(f === "png" ? "image/png" : f === "webp" ? "image/webp" : "image/jpeg");
    }
    if (dimMatch && dimensions.width && dimensions.height) {
      const targetRatio = Number(dimMatch[1]) / Number(dimMatch[2]);
      let width = dimensions.width, height = dimensions.height;
      if (width / height > targetRatio) width = Math.round(height * targetRatio);
      else height = Math.round(width / targetRatio);
      setCrop({ x: Math.round((dimensions.width - width) / 2), y: Math.round((dimensions.height - height) / 2), width, height });
      setCropMode("auto");
    }
    setStatus(sizeMatch || dimMatch || formatMatch
      ? "Notification text से कुछ शर्तें पहचानी गईं। कृपया निकाले गए dimensions, KB और format को official notification से मिलाकर confirm करें।"
      : "आम pattern नहीं मिला। कृपया dimensions, KB limit और format नीचे manually भरें।");
  };

  const autoCrop = () => {
    if (!dimensions.width || !dimensions.height) return;
    const w = Math.max(1, Number(targetWidth) || 200);
    const h = Math.max(1, Number(targetHeight) || 230);
    const ratio = w / h;
    let cw = dimensions.width;
    let ch = Math.round(cw / ratio);
    if (ch > dimensions.height) { ch = dimensions.height; cw = Math.round(ch * ratio); }
    setCrop({ x: Math.round((dimensions.width - cw) / 2), y: Math.round((dimensions.height - ch) / 2), width: cw, height: ch });
    setCropMode("auto");
    setStatus("Center auto-crop तैयार है। Preview देखकर सुनिश्चित करें कि चेहरा/signature या जरूरी content नहीं कट रहा।");
  };

  const pointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    const box = previewBoxRef.current;
    if (!box || !dimensions.width || !dimensions.height) return null;
    const rect = box.getBoundingClientRect();
    const scale = Math.min(rect.width / dimensions.width, rect.height / dimensions.height);
    const renderedWidth = dimensions.width * scale;
    const renderedHeight = dimensions.height * scale;
    const left = rect.left + (rect.width - renderedWidth) / 2;
    const top = rect.top + (rect.height - renderedHeight) / 2;
    return {
      x: Math.max(0, Math.min(dimensions.width, Math.round((event.clientX - left) / scale))),
      y: Math.max(0, Math.min(dimensions.height, Math.round((event.clientY - top) / scale))),
    };
  };
  const beginCrop = (event: PointerEvent<HTMLDivElement>) => {
    const p = pointerPosition(event);
    if (!p) return;
    dragRef.current = p;
    setCrop({ x: p.x, y: p.y, width: 1, height: 1 });
    setCropMode("manual");
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveCrop = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const p = pointerPosition(event);
    if (!p) return;
    const start = dragRef.current;
    setCrop({ x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), width: Math.max(1, Math.abs(p.x - start.x)), height: Math.max(1, Math.abs(p.y - start.y)) });
  };
  const endCrop = () => { dragRef.current = null; };

  const processAndDownload = async () => {
    if (!file || !sourceUrl || !dimensions.width || !dimensions.height) {
      setStatus("पहले image चुनें और preview लोड होने दें।");
      return;
    }
    const w = Math.max(1, Math.min(5000, Math.round(Number(targetWidth) || 200)));
    const h = Math.max(1, Math.min(5000, Math.round(Number(targetHeight) || 230)));
    const x = Math.max(0, Math.min(dimensions.width - 1, Math.round(crop.x)));
    const y = Math.max(0, Math.min(dimensions.height - 1, Math.round(crop.y)));
    const cw = Math.max(1, Math.min(dimensions.width - x, Math.round(crop.width)));
    const ch = Math.max(1, Math.min(dimensions.height - y, Math.round(crop.height)));
    if (crop.width < 2 || crop.height < 2) { setStatus("Preview में crop का area चुनें या Auto Crop दबाएँ।"); return; }
    setBusy(true);
    setStatus("फाइल process हो रही है…");
    try {
      const image = imageRef.current;
      if (!image) throw new Error("Image preview उपलब्ध नहीं है।");
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas processor उपलब्ध नहीं है।");
      if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(image, x, y, cw, ch, 0, 0, w, h);
      const mime = format === "application/pdf" ? "image/jpeg" : format;
      let quality = 0.92;
      let blob: Blob | null = null;
      const maxBytes = Math.max(1, Number(maxKb) || 50) * 1024;
      for (let i = 0; i < (mime === "image/png" ? 1 : 18); i++) {
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
        if (!blob) break;
        if (format === "application/pdf" || blob.size <= maxBytes) break;
        quality *= 0.78;
      }
      if (!blob) throw new Error("Selected format में export नहीं हो सका।");
      let output: Blob = blob;
      let extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
      if (format === "application/pdf") {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("PDF conversion data read नहीं हो सका।"));
          reader.onerror = () => reject(new Error("PDF conversion data read नहीं हो सका।"));
          reader.readAsDataURL(blob!);
        });
        const binary = atob(dataUrl.split(",")[1]);
        const jpegBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) jpegBytes[i] = binary.charCodeAt(i);
        output = jpegToPdf(jpegBytes, w, h);
        extension = "pdf";
      }
      if (format !== "application/pdf" && output.size > maxBytes) {
        throw new Error(`फाइल ${(output.size / 1024).toFixed(1)} KB है, जो ${maxKb} KB की सीमा से बड़ी है। अलग format, कम dimensions या अधिक KB सीमा आजमाएँ।`);
      }
      const base = file.name.replace(/\.[^.]+$/, "") || "document";
      downloadBlob(output, `${base}-processed.${extension}`);
      setStatus(`Download तैयार: ${w} × ${h}px · ${(output.size / 1024).toFixed(1)} KB · ${extension.toUpperCase()}. ${output.size <= maxBytes ? "File size limit भी पूरी है।" : "File size limit पूरी नहीं हुई।"}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Processing असफल रही।");
    } finally {
      setBusy(false);
    }
  };

  const previewStyle = dimensions.width && dimensions.height
    ? { width: "100%", height: "100%", objectFit: "contain" as const }
    : undefined;

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: "24px 16px 56px", color: "#17251f" }}>
      <a href="/" style={{ color: "#176b4d", fontWeight: 700, textDecoration: "none" }}>← CSC Home</a>
      <header style={{ margin: "18px 0 24px" }}>
        <p style={{ color: "#176b4d", fontWeight: 800, marginBottom: 8 }}>CSC DOCUMENT TOOLS</p>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.15, margin: "0 0 10px" }}>Crop, Resize & Convert</h1>
        <p style={{ color: "#52635a", lineHeight: 1.6, maxWidth: 760, margin: 0 }}>Image processing आपके browser में होता है। Original file बदली नहीं जाती। Notification rules को confirm करें और download से पहले preview जाँचें।</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start" }}>
        <div style={{ border: "1px solid #d8e4dc", borderRadius: 16, padding: 18, background: "#fff", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>1. Choose File & Preview</h2>
          <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>Choose image
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif" onChange={loadFile} style={{ padding: 10, border: "1px dashed #9eb7a7", borderRadius: 10, background: "#f7fbf8" }} />
          </label>
          {file && <div style={{ fontSize: 13, color: "#52635a" }}>{file.name} · {(file.size / 1024).toFixed(1)} KB · {dimensions.width ? `${dimensions.width} × ${dimensions.height}px` : "Reading image…"}</div>}
          {sourceUrl && <div ref={previewBoxRef} onPointerDown={beginCrop} onPointerMove={moveCrop} onPointerUp={endCrop} onPointerCancel={endCrop} style={{ position: "relative", height: 310, border: "1px solid #cddbd2", borderRadius: 12, background: "#eef3ef", overflow: "hidden", touchAction: "none", cursor: "crosshair", display: "grid", placeItems: "center" }}>
            <img ref={imageRef} src={sourceUrl} onLoad={onImageLoaded} alt="Uploaded image preview" style={previewStyle} draggable={false} />
            {dimensions.width > 0 && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(9,30,20,.28)", clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${crop.x / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, ${crop.x / dimensions.width * 100}% ${(crop.y + crop.height) / dimensions.height * 100}%, ${(crop.x + crop.width) / dimensions.width * 100}% ${(crop.y + crop.height) / dimensions.height * 100}%, ${(crop.x + crop.width) / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, ${crop.x / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, 0 0)` }} />}
            <span style={{ position: "absolute", bottom: 8, left: 8, background: "#102d22dd", color: "white", borderRadius: 7, padding: "5px 8px", fontSize: 12 }}>Drag to select crop area</span>
          </div>}
          {dimensions.width > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={autoCrop} style={buttonStyle}>Auto Crop to target ratio</button>
            <button type="button" onClick={() => { setCrop({ x: 0, y: 0, width: dimensions.width, height: dimensions.height }); setCropMode("manual"); }} style={secondaryButtonStyle}>Use full image</button>
          </div>}
          <small style={{ color: "#52635a" }}>Crop: {Math.round(crop.x)}, {Math.round(crop.y)} · {Math.round(crop.width)} × {Math.round(crop.height)} px · {cropMode === "auto" ? "Auto" : "Manual"}</small>
        </div>

        <div style={{ border: "1px solid #d8e4dc", borderRadius: 16, padding: 18, background: "#fff", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>2. Notification Rules</h2>
          <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>Paste notification requirement (optional)
            <textarea value={notificationText} onChange={e => setNotificationText(e.target.value)} rows={3} placeholder="Example: photo JPG, 200 x 230 pixels, maximum 50 KB" style={fieldStyle} />
          </label>
          <button type="button" onClick={applyAutoRules} style={buttonStyle}>Read common rules & apply</button>
          <p style={{ fontSize: 12, color: "#6a756e", lineHeight: 1.5, margin: 0 }}>Rule reading is pattern-based, not a full PDF/legal interpretation. Confirm each value against the official notification.</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 20 }}>3. Resize & Output</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={labelStyle}>Width (px)<input type="number" min="1" max="5000" value={targetWidth} onChange={e => setTargetWidth(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Height (px)<input type="number" min="1" max="5000" value={targetHeight} onChange={e => setTargetHeight(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Max file size (KB)<input type="number" min="1" max="20000" value={maxKb} onChange={e => setMaxKb(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Output format<select value={format} onChange={e => setFormat(e.target.value as OutputFormat)} style={fieldStyle}><option value="image/jpeg">JPG / JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option><option value="application/pdf">PDF (single image page)</option></select></label>
          </div>
          <button type="button" onClick={processAndDownload} disabled={!file || busy} style={{ ...buttonStyle, padding: "14px 16px", fontSize: 16, opacity: !file || busy ? .6 : 1 }}>{busy ? "Processing…" : "Convert & Download"}</button>
          <p role="status" aria-live="polite" style={{ margin: 0, padding: 12, borderRadius: 10, background: "#f2f8f4", color: "#254c39", lineHeight: 1.5, overflowWrap: "anywhere" }}>{status || "फाइल चुनें, crop/resize करें और output format चुनें।"}</p>
        </div>
      </section>

      <section style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#fff9e9", border: "1px solid #ead8a7", color: "#594a22", lineHeight: 1.6 }}>
        <strong>Supported in this release:</strong> browser-supported images → JPG, PNG, WebP or single-page PDF. PDF input, PDF-to-Word, Excel conversion, multi-page PDF editing and OCR are not included yet. For sensitive documents, processing stays in this browser tab; avoid uploading files on shared devices.
      </section>
    </main>
  );
}

const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 10, padding: "10px 12px", background: "#176b4d", color: "#fff", fontWeight: 800, cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { border: "1px solid #b8cec0", borderRadius: 10, padding: "10px 12px", background: "#fff", color: "#234735", fontWeight: 700, cursor: "pointer" };
const fieldStyle: React.CSSProperties = { width: "100%", minWidth: 0, padding: 10, border: "1px solid #cbd8d0", borderRadius: 8, background: "#fff", color: "#17251f", font: "inherit", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700 };
