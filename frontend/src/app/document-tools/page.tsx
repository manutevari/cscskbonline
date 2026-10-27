"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
type Crop = { x: number; y: number; width: number; height: number };
type PdfJsViewport = { width: number; height: number };
type PdfJsPage = {
  getViewport: (options: { scale: number }) => PdfJsViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfJsViewport }) => { promise: Promise<void> };
};
type PdfJsDocument = { numPages: number; getPage: (pageNumber: number) => Promise<PdfJsPage> };
type PdfJsLibrary = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer; password?: string }) => { promise: Promise<PdfJsDocument> };
};

let pdfJsPromise: Promise<PdfJsLibrary> | null = null;
function loadPdfJs(): Promise<PdfJsLibrary> {
  const existing = (window as Window & { pdfjsLib?: PdfJsLibrary }).pdfjsLib;
  if (existing) return Promise.resolve(existing);
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise<PdfJsLibrary>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const library = (window as Window & { pdfjsLib?: PdfJsLibrary }).pdfjsLib;
        if (!library) {
          reject(new Error("PDF engine load नहीं हो सका। कृपया इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।"));
          return;
        }
        library.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(library);
      };
      script.onerror = () => reject(new Error("PDF engine डाउनलोड नहीं हो सका। कृपया इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।"));
      document.head.appendChild(script);
    });
  }
  return pdfJsPromise;
}

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
  const pdfBytes = concat(...parts);
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
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
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchStatus, setBatchStatus] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState("200");
  const [targetHeight, setTargetHeight] = useState("230");
  const [maxKb, setMaxKb] = useState("50");
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [notificationText, setNotificationText] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<Array<{ id: number; label: string; dataUrl: string }>>([]);
  const [nextCropId, setNextCropId] = useState(1);
  const [busy, setBusy] = useState(false);
  const [cropMode, setCropMode] = useState<"manual">("manual");
  const [isPdfInput, setIsPdfInput] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfPasswordRequired, setPdfPasswordRequired] = useState(false);
  const [pdfPasswordIncorrect, setPdfPasswordIncorrect] = useState(false);
  const [pdfUnlocking, setPdfUnlocking] = useState(false);
  const pdfDocumentRef = useRef<PdfJsDocument | null>(null);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);

  const renderPdfPage = async (pdf: PdfJsDocument, pageNumber: number) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PDF preview canvas उपलब्ध नहीं है।");
    await page.render({ canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PDF page preview तैयार नहीं हो सका।")), "image/png");
    });
    setSourceUrl(URL.createObjectURL(blob));
    setDimensions({ width: canvas.width, height: canvas.height });
    setTargetWidth(String(canvas.width));
    setTargetHeight(String(canvas.height));
    setCrop({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    setCropMode("manual");
    setStatus(`PDF page ${pageNumber} / ${pdf.numPages} तैयार है। Crop area चुनें और output format चुनकर download करें।`);
  };

  const changePdfPage = async (pageNumber: number) => {
    const pdf = pdfDocumentRef.current;
    if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) return;
    setBusy(true);
    setStatus("PDF page render हो रहा है…");
    try {
      await renderPdfPage(pdf, pageNumber);
      setPdfPage(pageNumber);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PDF page render नहीं हो सका।");
    } finally {
      setBusy(false);
    }
  };

  const openPdfWithPassword = async (password: string) => {
    const bytes = pdfBytesRef.current;
    if (!bytes) { setStatus("पहले PDF फाइल चुनें।"); return; }
    setPdfUnlocking(true);
    setPdfPasswordIncorrect(false);
    setStatus("PDF password verify किया जा रहा है…");
    try {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: bytes.slice(0), password }).promise;
      pdfDocumentRef.current = pdf;
      setPdfPageCount(pdf.numPages);
      setPdfPage(1);
      setPdfPasswordRequired(false);
      setPdfPasswordIncorrect(false);
      await renderPdfPage(pdf, 1);
      setStatus(`PDF सफलतापूर्वक खुल गई · ${pdf.numPages} pages. चुने हुए page को crop/export कर सकते हैं।`);
    } catch (error) {
      const reason = error as { name?: string; message?: string; code?: number };
      if (reason?.name === "PasswordException" || reason?.code === 1 || reason?.code === 2) {
        setPdfPasswordRequired(true);
        setPdfPasswordIncorrect(reason.code === 2 || /incorrect|invalid password/i.test(reason.message || ""));
        setStatus(reason.code === 2 || /incorrect|invalid password/i.test(reason.message || "")
          ? "Password गलत है। PDF का सही password डालकर दोबारा कोशिश करें।"
          : "यह PDF password-protected है। खोलने के लिए इसका सही password डालें।");
      } else {
        setStatus(reason?.message || "PDF नहीं खुल सकी। फाइल खराब हो सकती है या encryption format supported नहीं है।");
      }
    } finally { setPdfUnlocking(false); }
  };

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    const isPdf = next.type === "application/pdf" || next.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !next.type.startsWith("image/")) {
      setStatus("कृपया JPG, PNG, WebP, GIF, BMP, AVIF या PDF फाइल चुनें।");
      event.target.value = "";
      return;
    }
    if (next.size > 20 * 1024 * 1024) {
      setStatus("फाइल 20 MB से बड़ी है। कृपया छोटी फाइल चुनें।");
      event.target.value = "";
      return;
    }
    setFile(next);
    setDimensions({ width: 0, height: 0 });
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setIsPdfInput(isPdf);
    setPdfPageCount(0);
    setPdfPage(1);
    setPdfPassword("");
    setPdfPasswordRequired(false);
    setPdfPasswordIncorrect(false);
    pdfDocumentRef.current = null;
    pdfBytesRef.current = null;
    if (isPdf) {
      setStatus("PDF खोला जा रहा है… पहली बार PDF engine लोड होने में कुछ सेकंड लग सकते हैं।");
      try {
        pdfBytesRef.current = await next.arrayBuffer();
        await openPdfWithPassword("");
      } catch (error) {
        setSourceUrl("");
        setStatus(error instanceof Error ? error.message : "PDF नहीं खुल सकी। कृपया वैध PDF चुनें।");
      } finally { event.target.value = ""; }
      return;
    }
    const url = URL.createObjectURL(next);
    setSourceUrl(url);
    setStatus("फाइल चुनी गई है। Preview तैयार होने पर crop और resize कर सकते हैं।");
    event.target.value = "";
  };

  const onImageLoaded = () => {
    const image = imageRef.current;
    if (!image) return;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    setDimensions({ width, height });
    setCrop({ x: 0, y: 0, width, height });
    setStatus(`Preview तैयार: ${file?.name || "image"} · ${width} × ${height}px · ${((file?.size || 0) / 1024).toFixed(1)} KB`);
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
    // Reading notification rules must never crop the preview automatically.
    // The full page remains visible until the user manually selects a crop area.
    setStatus(sizeMatch || dimMatch || formatMatch
      ? "Notification text से कुछ शर्तें पहचानी गईं। कृपया निकाले गए dimensions, KB और format को official notification से मिलाकर confirm करें।"
      : "आम pattern नहीं मिला। कृपया dimensions, KB limit और format नीचे manually भरें।");
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
    const width = Math.max(1, Math.abs(p.x - start.x));
    const height = Math.max(1, Math.abs(p.y - start.y));
    setCrop({ x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), width, height });
    if (isPdfInput) { setTargetWidth(String(width)); setTargetHeight(String(height)); }
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
    if (crop.width < 2 || crop.height < 2) { setStatus("Preview में drag करके crop area manually चुनें।"); return; }
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
        const pdfOverheadAllowance = format === "application/pdf" ? 2048 : 0;
        if (blob.size + pdfOverheadAllowance <= maxBytes) break;
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
      if (output.size > maxBytes) {
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

  const loadBatchImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    const images = selected.filter((item) => item.type.startsWith("image/"));
    const rejected = selected.length - images.length;
    const tooLarge = images.filter((item) => item.size > 20 * 1024 * 1024);
    const valid = images.filter((item) => item.size <= 20 * 1024 * 1024).slice(0, 20);
    setBatchFiles(valid);
    setBatchStatus((rejected ? rejected + " non-image/PDF file(s) skipped. " : "") + (tooLarge.length ? tooLarge.length + " file(s) over 20 MB skipped. " : "") + (images.length > 20 ? "Only the first 20 images are queued. " : "") + (valid.length ? valid.length + " image(s) ready for batch processing." : "No valid images selected. Choose up to 20 images, each under 20 MB."));
    event.target.value = "";
  };

  const processBatchImages = async () => {
    if (!batchFiles.length) { setBatchStatus("पहले एक या अधिक image files चुनें।"); return; }
    setBatchBusy(true);
    setBatchStatus("Images process हो रही हैं…");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const w = Math.max(1, Math.min(5000, Math.round(Number(targetWidth) || 200)));
      const h = Math.max(1, Math.min(5000, Math.round(Number(targetHeight) || 230)));
      const maxBytes = Math.max(1, Number(maxKb) || 50) * 1024;
      let success = 0;
      const failures: string[] = [];
      for (const inputFile of batchFiles) {
        try {
          const bitmap = await createImageBitmap(inputFile);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas unavailable");
          if (format === "image/jpeg" || format === "application/pdf") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
          ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, w, h);
          bitmap.close();
          const mime = format === "application/pdf" ? "image/jpeg" : format;
          let quality = 0.92;
          let blob: Blob | null = null;
          for (let attempt = 0; attempt < (mime === "image/png" ? 1 : 18); attempt++) {
            blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
            if (!blob || blob.size <= maxBytes) break;
            quality *= 0.78;
          }
          if (!blob) throw new Error("Could not export this format");
          if (format === "application/pdf") throw new Error("Batch PDF output is not supported yet; choose JPG, PNG or WebP");
          if (blob.size > maxBytes) throw new Error("Could not meet the KB limit; reduce dimensions or increase Max KB");
          const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
          const base = inputFile.name.replace(/\.[^.]+$/, "") || "image";
          zip.file(base + "-processed." + extension, blob);
          success++;
        } catch (error) { failures.push(inputFile.name + ": " + (error instanceof Error ? error.message : "processing failed")); }
      }
      if (!success) throw new Error("No images were processed. " + failures.join(" | "));
      const archive = await zip.generateAsync({ type: "blob" });
      downloadBlob(archive, "cscskb-processed-images.zip");
      setBatchStatus(success + " image(s) processed at " + w + " × " + h + " px and packed into ZIP. " + (failures.length ? failures.length + " skipped/failed: " + failures.join(" | ") : "All queued images succeeded.") + " Note: batch mode resizes the full image; manual crop is still done in the single-file editor.");
    } catch (error) { setBatchStatus(error instanceof Error ? error.message : "Batch processing failed."); }
    finally { setBatchBusy(false); }
  };

  const previewStyle = dimensions.width && dimensions.height
    ? { width: "100%", height: "100%", objectFit: "contain" as const }
    : undefined;

  return (
    <main style={{ maxWidth: 1050, margin: "24px auto", padding: "24px 16px 40px", color: "#17251f", background: "#f6faf8", border: "1px solid #dce7df", borderRadius: 22, boxShadow: "0 18px 48px rgba(0,0,0,.18)" }}>
      <style>{`@page { size: A4 portrait; margin: 8mm; } @media print { body * { visibility: hidden !important; } .print-layout-panel, .print-layout-panel * { visibility: visible !important; } .print-layout-panel { position: absolute !important; inset: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: white !important; } .print-layout-panel > *:not(.print-output) { display: none !important; } .print-output { display: flex !important; flex-direction: column !important; height: 281mm !important; width: 100% !important; box-sizing: border-box !important; overflow: hidden !important; } .print-output > div { flex: 1 1 0 !important; min-height: 0 !important; margin: 0 !important; padding: 1mm 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; break-inside: avoid !important; overflow: hidden !important; } .print-output > div img { max-width: 100% !important; max-height: calc(100% - 5mm) !important; width: auto !important; height: auto !important; object-fit: contain !important; } .print-output > div div { font-size: 7pt !important; line-height: 1 !important; margin-top: 1mm !important; } }`}</style>
      <a href="/" style={{ color: "#176b4d", fontWeight: 700, textDecoration: "none" }}>← CSC Home</a>
      <header style={{ margin: "18px 0 24px" }}>
        <p style={{ color: "#176b4d", fontWeight: 800, marginBottom: 8 }}>CSC DOCUMENT TOOLS</p>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.15, margin: "0 0 10px", color: "#17251f", letterSpacing: "-.03em" }}>Crop, Select, Merge & Print Layout</h1>
        <p style={{ color: "#52635a", lineHeight: 1.6, maxWidth: 760, margin: 0 }}>Image processing आपके browser में होता है। Original file बदली नहीं जाती। Notification rules को confirm करें और download से पहले preview जाँचें।</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start" }}>
        <div style={{ border: "1px solid #d8e4dc", borderRadius: 16, padding: 18, background: "#fff", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#17251f", letterSpacing: "-.02em" }}>1. Choose File & Preview</h2>
          <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>Choose image or PDF
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,application/pdf,.pdf" onChange={loadFile} style={{ padding: 10, border: "1px dashed #9eb7a7", borderRadius: 10, background: "#f7fbf8" }} />
          </label>
          <div style={{ display: "grid", gap: 8, padding: 12, border: "1px solid #d8e4dc", borderRadius: 10, background: "#f7fbf8" }}>
            <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>Batch upload — multiple images
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif" onChange={loadBatchImages} style={{ padding: 10, border: "1px dashed #9eb7a7", borderRadius: 10, background: "#fff" }} />
            </label>
            <small style={{ color: "#52635a" }}>{batchFiles.length ? batchFiles.map((item) => item.name).join(", ") : "Up to 20 images, max 20 MB each. This batch action currently supports images, not PDFs."}</small>
            <button type="button" onClick={() => void processBatchImages()} disabled={!batchFiles.length || batchBusy} style={{ ...buttonStyle, opacity: !batchFiles.length || batchBusy ? .6 : 1 }}>{batchBusy ? "Processing batch…" : "Process images & Download ZIP"}</button>
            <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 13, color: "#254c39", overflowWrap: "anywhere" }}>{batchStatus || "Batch processing applies the width, height, format and KB settings on the right. It resizes full images; use the single-file editor for manual crop."}</p>
          </div>
          {file && <div style={{ fontSize: 13, color: "#52635a" }}>{file.name} · {(file.size / 1024).toFixed(1)} KB · {dimensions.width ? `${dimensions.width} × ${dimensions.height}px` : "Reading preview…"}</div>}
          {isPdfInput && pdfPasswordRequired && <div style={{ display: "grid", gap: 10, padding: 14, border: "1px solid #d7b76a", borderRadius: 12, background: "#fff9e9" }}>
            <strong style={{ color: "#594a22" }}>🔒 Password-protected PDF</strong>
            <p style={{ margin: 0, color: "#594a22", fontSize: 13, lineHeight: 1.5 }}>PDF खोलने के लिए उसका सही password डालें। Password केवल इस page की memory में इस्तेमाल होगा; इसे save या log नहीं किया जाता।</p>
            <label style={{ display: "grid", gap: 6, color: "#594a22", fontWeight: 700 }}>PDF password
              <input type="password" autoComplete="off" value={pdfPassword} onChange={e => setPdfPassword(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !pdfUnlocking) void openPdfWithPassword(pdfPassword); }} style={fieldStyle} placeholder="Enter PDF password" />
            </label>
            <button type="button" disabled={pdfUnlocking || !pdfPassword} onClick={() => void openPdfWithPassword(pdfPassword)} style={{ ...buttonStyle, opacity: pdfUnlocking || !pdfPassword ? .6 : 1 }}>{pdfUnlocking ? "Checking password…" : "🔓 Open PDF with password"}</button>
            {pdfPasswordIncorrect && <small role="alert" style={{ color: "#a12622" }}>Password match नहीं हुआ। PDF के owner से सही password लें।</small>}
          </div>}
          {isPdfInput && pdfPageCount > 0 && <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>PDF page to crop
            <select value={pdfPage} onChange={(e) => void changePdfPage(Number(e.target.value))} disabled={busy} style={fieldStyle}>
              {Array.from({ length: pdfPageCount }, (_, index) => <option key={index + 1} value={index + 1}>Page {index + 1} of {pdfPageCount}</option>)}
            </select>
            <small style={{ color: "#52635a", fontWeight: 400 }}>पूरा PDF एक-एक पेज करके देखें। Crop केवल चुने हुए पेज पर लागू होगा; PDF export अभी single-page output है।</small>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <button type="button" onClick={() => void changePdfPage(pdfPage - 1)} disabled={busy || pdfPage <= 1} style={{ ...secondaryButtonStyle, opacity: busy || pdfPage <= 1 ? .5 : 1 }}>← Previous page</button>
              <strong style={{ fontSize: 13, whiteSpace: "nowrap" }}>Page {pdfPage} of {pdfPageCount}</strong>
              <button type="button" onClick={() => void changePdfPage(pdfPage + 1)} disabled={busy || pdfPage >= pdfPageCount} style={{ ...secondaryButtonStyle, opacity: busy || pdfPage >= pdfPageCount ? .5 : 1 }}>Next page →</button>
            </div>
          </label>}
          {sourceUrl && <div ref={previewBoxRef} onPointerDown={beginCrop} onPointerMove={moveCrop} onPointerUp={endCrop} onPointerCancel={endCrop} style={{ position: "relative", height: 310, border: "1px solid #cddbd2", borderRadius: 12, background: "#eef3ef", overflow: "hidden", touchAction: "none", cursor: "crosshair", display: "grid", placeItems: "center" }}>
            <img ref={imageRef} src={sourceUrl} onLoad={onImageLoaded} alt="Uploaded image preview" style={previewStyle} draggable={false} />
            {dimensions.width > 0 && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "rgba(9,30,20,.28)", clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${crop.x / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, ${crop.x / dimensions.width * 100}% ${(crop.y + crop.height) / dimensions.height * 100}%, ${(crop.x + crop.width) / dimensions.width * 100}% ${(crop.y + crop.height) / dimensions.height * 100}%, ${(crop.x + crop.width) / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, ${crop.x / dimensions.width * 100}% ${crop.y / dimensions.height * 100}%, 0 0)` }} />}
            <span style={{ position: "absolute", bottom: 8, left: 8, background: "#102d22dd", color: "white", borderRadius: 7, padding: "5px 8px", fontSize: 12 }}>Drag to select crop area</span>
          </div>}
          <small style={{ color: "#52635a" }}>Crop: {Math.round(crop.x)}, {Math.round(crop.y)} · {Math.round(crop.width)} × {Math.round(crop.height)} px · Manual</small>
          {dimensions.width > 0 && <button type="button" onClick={() => {
            const image = imageRef.current;
            if (!image || crop.width < 2 || crop.height < 2) { setStatus("पहले preview में drag करके crop area चुनें।"); return; }
            const x = Math.max(0, Math.min(dimensions.width - 1, Math.round(crop.x)));
            const y = Math.max(0, Math.min(dimensions.height - 1, Math.round(crop.y)));
            const width = Math.max(1, Math.min(dimensions.width - x, Math.round(crop.width)));
            const height = Math.max(1, Math.min(dimensions.height - y, Math.round(crop.height)));
            const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d"); if (!ctx) { setStatus("Crop select नहीं हो सका।"); return; }
            ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
            const label = (file?.name || "Image") + (isPdfInput ? " · Page " + pdfPage : " · Image");
            setSelectedCrops(items => [...items, { id: nextCropId, label, dataUrl: canvas.toDataURL("image/png") }]);
            setNextCropId(id => id + 1); setStatus("Crop Print Layout में जोड़ दिया गया।");
          }} style={buttonStyle}>Select crop → Add to Print Layout</button>}
        </div>

        <div style={{ border: "1px solid #d8e4dc", borderRadius: 16, padding: 18, background: "#fff", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#17251f", letterSpacing: "-.02em" }}>2. Notification Rules</h2>
          <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>Paste notification requirement (optional)
            <textarea value={notificationText} onChange={e => setNotificationText(e.target.value)} rows={3} placeholder="Example: photo JPG, 200 x 230 pixels, maximum 50 KB" style={fieldStyle} />
          </label>
          <button type="button" onClick={applyAutoRules} style={buttonStyle}>Read common rules & apply</button>
          <p style={{ fontSize: 12, color: "#6a756e", lineHeight: 1.5, margin: 0 }}>Rule reading is pattern-based, not a full PDF/legal interpretation. Confirm each value against the official notification.</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 20, color: "#17251f", letterSpacing: "-.02em" }}>3. Resize & Output</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={labelStyle}>Width (px)<input type="number" min="1" max="5000" value={targetWidth} onChange={e => setTargetWidth(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Height (px)<input type="number" min="1" max="5000" value={targetHeight} onChange={e => setTargetHeight(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Max file size (KB)<input type="number" min="1" max="20000" value={maxKb} onChange={e => setMaxKb(e.target.value)} style={fieldStyle} /></label>
            <label style={labelStyle}>Output format<select value={format} onChange={e => setFormat(e.target.value as OutputFormat)} style={fieldStyle}><option value="image/jpeg">JPG / JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option><option value="application/pdf">PDF (single image page)</option></select></label>
          </div>
          {isPdfInput && pdfPageCount > 0 && <div style={{ display: "grid", gap: 6, padding: 13, border: "1px solid #e3c780", borderRadius: 12, background: "#fff9e9", color: "#594a22" }}>
            <strong>🔒 Premium: Remove PDF password / decrypt original file</strong>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>यह paid feature locked है। इस project में payment gateway और server-side payment verification configured नहीं मिले, इसलिए original PDF का password हटाने/decrypt करने का action बंद है। Payment verify हुए बिना इसे unlock नहीं किया जाएगा।</p>
            <button type="button" disabled style={{ ...secondaryButtonStyle, cursor: "not-allowed", opacity: .65 }}>🔒 Premium feature — locked</button>
          </div>}
          <button type="button" onClick={processAndDownload} disabled={!file || busy || (isPdfInput && (pdfPasswordRequired || !pdfPageCount))} style={{ ...buttonStyle, padding: "14px 16px", fontSize: 16, opacity: !file || busy || (isPdfInput && (pdfPasswordRequired || !pdfPageCount)) ? .6 : 1 }}>{busy ? "Processing…" : "Convert & Download"}</button>
          <p role="status" aria-live="polite" style={{ margin: 0, padding: 12, borderRadius: 10, background: "#f2f8f4", color: "#254c39", lineHeight: 1.5, overflowWrap: "anywhere" }}>{status || "फाइल चुनें, crop/resize करें और output format चुनें।"}</p>
        </div>
      </section>

      <section className="print-layout-panel" style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #d8e4dc", color: "#17251f", lineHeight: 1.6 }}>
        <h2 style={{ marginTop: 0 }}>4. Merge & Print Layout</h2>
        <p>हर image/PDF से crop select करके यहाँ जोड़ें। ↑/↓ से क्रम बदलें; Print से browser print dialog खुलेगा।</p>
        {selectedCrops.length === 0 ? <p>अभी कोई crop select नहीं है।</p> : <div style={{ display: "grid", gap: 10 }}>
          {selectedCrops.map((item, index) => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr) auto", alignItems: "center", gap: 10, padding: 10, border: "1px solid #d8e4dc", borderRadius: 10 }}>
            <img src={item.dataUrl} alt={item.label} style={{ width: 72, height: 72, objectFit: "contain", background: "#f6faf8", borderRadius: 6 }} />
            <div><strong>{index + 1}. {item.label}</strong><div style={{ fontSize: 12 }}>Selected crop</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button type="button" disabled={index === 0} onClick={() => setSelectedCrops(items => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} style={secondaryButtonStyle}>↑</button>
              <button type="button" disabled={index === selectedCrops.length - 1} onClick={() => setSelectedCrops(items => { const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })} style={secondaryButtonStyle}>↓</button>
              <button type="button" onClick={() => setSelectedCrops(items => items.filter(cropItem => cropItem.id !== item.id))} style={secondaryButtonStyle}>Remove</button>
            </div>
          </div>)}
        </div>}
        <button type="button" disabled={!selectedCrops.length} onClick={() => { if (selectedCrops.length) window.print(); }} style={{ ...buttonStyle, marginTop: 12 }}>Print selected layout</button>
        <div className="print-output" style={{ display: "none" }}>
          {selectedCrops.map((item, index) => <div key={item.id} style={{ breakInside: "avoid", marginBottom: 2, textAlign: "center" }}><img src={item.dataUrl} alt={item.label} style={{ maxWidth: "100%", maxHeight: "58mm", objectFit: "contain" }} /><div style={{ fontSize: 8 }}>{index + 1}</div></div>)}
        </div>
      </section>
      <section style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#fff9e9", border: "1px solid #ead8a7", color: "#594a22", lineHeight: 1.6 }}>
        <strong>Supported in this release:</strong> image or PDF input → crop/resize the preview and download as JPG, PNG, WebP or single-page PDF. Password-protected PDFs can be opened when you know the correct password. The separate feature to remove a PDF password or decrypt the original file remains premium-locked until payment verification is implemented. This is not a password-cracking tool. PDF-to-Word, Excel conversion, multi-page PDF editing and OCR are not included yet. PDF.js is loaded from cdnjs on first PDF use; the document itself is processed locally in this browser tab and is not uploaded by this tool.
      </section>
    </main>
  );
}

const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 10, padding: "10px 12px", background: "#176b4d", color: "#fff", fontWeight: 800, cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { border: "1px solid #b8cec0", borderRadius: 10, padding: "10px 12px", background: "#fff", color: "#234735", fontWeight: 700, cursor: "pointer" };
const fieldStyle: React.CSSProperties = { width: "100%", minWidth: 0, padding: 10, border: "1px solid #cbd8d0", borderRadius: 8, background: "#fff", color: "#17251f", font: "inherit", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700 };
