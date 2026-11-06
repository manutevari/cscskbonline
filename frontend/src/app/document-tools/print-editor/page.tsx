"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type LayoutItem = { id: string; name: string; src: string; pageId: number; x: number; y: number; w: number; h: number; brightness?: number; contrast?: number; sharpness?: number; rotation?: number; originalSrc?: string };
type RegionStart = { itemId: string; startX: number; startY: number };
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
  const [zoomMode, setZoomMode] = useState<"fit-page" | "fit-width" | "custom">("fit-page");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [customW, setCustomW] = useState("210");
  const [customH, setCustomH] = useState("297");
  const [photoCopies, setPhotoCopies] = useState("8");
  const [photoWidthMm, setPhotoWidthMm] = useState("35");
  const [photoHeightMm, setPhotoHeightMm] = useState("45");
  const [pageMargins, setPageMargins] = useState({ top: "5", right: "5", bottom: "5", left: "5" });
  const [clipboardItem, setClipboardItem] = useState<LayoutItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editHistory, setEditHistory] = useState<LayoutItem[][]>([]);
  const [cropRect, setCropRect] = useState({ left: "0", top: "0", width: "100", height: "100" });
  const [cropRatio, setCropRatio] = useState("free");
  const [resizeState, setResizeState] = useState<{id:string; handle:string; startX:number; startY:number; startW:number; startH:number} | null>(null);
  const [status, setStatus] = useState("एक या कई image/PDF चुनें। PDF के pages को preview करके layout में जोड़ें।");
  const [assistantCommand, setAssistantCommand] = useState("");
  const [regionMode, setRegionMode] = useState(false);
  const [regionStart, setRegionStart] = useState<RegionStart | null>(null);
  const [busy, setBusy] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{fileName:string; incorrect:boolean} | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");
  const passwordResolverRef = useRef<((value: string | null) => void) | null>(null);
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
        // Ask for a password only after the complete file has been read.
        const loadingTask = pdfjs.getDocument({ data: bytes });
        let passwordCancelled = false;
        loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
          setPdfPassword("");
          setPasswordPrompt({ fileName: file.name, incorrect: reason === 2 });
          setStatus(file.name + " — password required to unlock this PDF.");
          passwordResolverRef.current = (entered: string | null) => {
            setPasswordPrompt(null); passwordResolverRef.current = null;
            if (entered === null) { passwordCancelled = true; void loadingTask.destroy(); return; }
            updatePassword(entered);
          };
        };
        let pdf: any;
        try { pdf = await loadingTask.promise; }
        catch (pdfError) {
          if (passwordCancelled) {
            setStatus(file.name + " हटाई गई — password नहीं दिया गया, इसलिए कोई page या खाली column नहीं जोड़ा गया.");
            continue;
          }
          throw pdfError;
        }
        const permissions = await pdf.getPermissions();
        const permissionFlags = pdfjs.PermissionFlag;
        if (permissions) {
          const canPrint = permissions.includes(permissionFlags.PRINT);
          const canCopy = permissions.includes(permissionFlags.COPY);
          if (!canPrint || !canCopy) {
            const restricted = [!canPrint ? "printing" : "", !canCopy ? "copying/editing" : ""].filter(Boolean).join(" and ");
            setStatus(file.name + " — PDF permissions restrict " + restricted + ". The file was not added to the editor.");
            continue;
          }
        }
        const highQualityPrint = !permissions || permissions.includes(permissionFlags.PRINT_HIGH_QUALITY);
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n), viewport = page.getViewport({ scale: highQualityPrint ? 2.5 : 1.5 });
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

  const submitPdfPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pdfPassword.trim()) { setStatus("PDF password दर्ज करें।"); return; }
    passwordResolverRef.current?.(pdfPassword); setPdfPassword("");
  };
  const cancelPdfPassword = () => { passwordResolverRef.current?.(null); setPdfPassword(""); };

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
  const saveEditSnapshot = () => setEditHistory(old => [...old.slice(-19), items.map(item => ({ ...item }))]);

  const cropSelected = async () => {
    if (!selected) return;
    const left = Math.max(0, Math.min(99, Number(cropRect.left) || 0));
    const top = Math.max(0, Math.min(99, Number(cropRect.top) || 0));
    const width = Math.max(1, Math.min(100 - left, Number(cropRect.width) || 100));
    const height = Math.max(1, Math.min(100 - top, Number(cropRect.height) || 100));
    const image = new Image();
    image.src = selected.src;
    try {
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Image crop के लिए load नहीं हुई।")); });
      const sx = Math.round(image.naturalWidth * left / 100), sy = Math.round(image.naturalHeight * top / 100);
      const sw = Math.max(1, Math.round(image.naturalWidth * width / 100)), sh = Math.max(1, Math.round(image.naturalHeight * height / 100));
      const canvas = document.createElement("canvas"); canvas.width = sw; canvas.height = sh;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Crop canvas उपलब्ध नहीं है।");
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Crop image save नहीं हो सकी।")), "image/png"));
      const src = URL.createObjectURL(blob); urlsRef.current.push(src);
      saveEditSnapshot();
      setItems(old => old.map(item => item.id === selected.id ? { ...item, src, originalSrc: item.originalSrc || item.src, w: item.w * width / 100, h: item.h * height / 100, rotation: 0 } : item));
      setCropRect({ left: "0", top: "0", width: "100", height: "100" });
      setStatus("Crop लागू हो गया। Original file अलग रहती है; layout में cropped copy इस्तेमाल होगी।");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Crop लागू नहीं हो सका।"); }
  };

  const extractSelectedRegion = async () => {
    if (!selected) return;
    const left = Math.max(0, Math.min(99, Number(cropRect.left) || 0));
    const top = Math.max(0, Math.min(99, Number(cropRect.top) || 0));
    const width = Math.max(1, Math.min(100 - left, Number(cropRect.width) || 100));
    const height = Math.max(1, Math.min(100 - top, Number(cropRect.height) || 100));
    if (width >= 99.5 && height >= 99.5) { setStatus("पहले PDF page/photo के अंदर छोटा region drag करके select करें।"); return; }
    const image = new Image(); image.src = selected.src;
    try {
      await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("Selected page load नहीं हुई।"));});
      const sx=Math.round(image.naturalWidth*left/100), sy=Math.round(image.naturalHeight*top/100);
      const sw=Math.max(1,Math.round(image.naturalWidth*width/100)), sh=Math.max(1,Math.round(image.naturalHeight*height/100));
      const canvas=document.createElement("canvas");canvas.width=sw;canvas.height=sh;
      const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Region processor उपलब्ध नहीं है।");
      ctx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Region export नहीं हो सका।")),"image/png"));
      const src=URL.createObjectURL(blob);urlsRef.current.push(src);
      const region:LayoutItem={id:uid(),name:selected.name+" · selected region",src,pageId:selected.pageId,x:selected.x+selected.w*left/100,y:selected.y+selected.h*top/100,w:selected.w*width/100,h:selected.h*height/100,brightness:100,contrast:100,sharpness:0};
      setItems(old=>[...old,region]);setSelectedId(region.id);setSelectedIds([region.id]);
      setCropRect({left:"0",top:"0",width:"100",height:"100"});
      setStatus("चुना हुआ हिस्सा अलग editable layer बन गया है। अब brightness, contrast और sharpness केवल इसी हिस्से पर लागू होंगे; बाकी page और original file सुरक्षित हैं।");
    } catch(error) { setStatus(error instanceof Error?error.message:"Region extract नहीं हो सका।"); }
  };

  const rotateSelected = async (degrees: number) => {
    if (!selected) return;
    const image = new Image(); image.src = selected.src;
    try {
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Image rotate के लिए load नहीं हुई।")); });
      const swap = Math.abs(degrees) % 180 === 90;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? image.naturalHeight : image.naturalWidth;
      canvas.height = swap ? image.naturalWidth : image.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Rotate canvas उपलब्ध नहीं है।");
      ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Rotate image save नहीं हो सकी।")), "image/png"));
      const src = URL.createObjectURL(blob); urlsRef.current.push(src); saveEditSnapshot();
      setItems(old => old.map(item => item.id === selected.id ? { ...item, src, originalSrc: item.originalSrc || item.src, w: swap ? item.h : item.w, h: swap ? item.w : item.h, rotation: 0 } : item));
      setStatus("Image rotate हो गई।");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Rotate लागू नहीं हो सका।"); }
  };

  const updateImageFilter = (key: "brightness" | "contrast" | "sharpness", value: number) => {
    if (!selected) return;
    saveEditSnapshot();
    setItems(old => old.map(item => item.id === selected.id ? { ...item, [key]: value } : item));
  };

  const undoEdit = () => {
    const previous = editHistory[editHistory.length - 1];
    if (!previous) return;
    setItems(previous.map(item => ({ ...item })));
    setEditHistory(old => old.slice(0, -1));
    setStatus("पिछला image edit undo कर दिया गया।");
  };

  const resetSelected = () => {
    if (!selected) return;
    saveEditSnapshot();
    setItems(old => old.map(item => item.id === selected.id ? { ...item, src: item.originalSrc || item.src, originalSrc: undefined, brightness: 100, contrast: 100, sharpness: 0, rotation: 0 } : item));
    setCropRect({ left: "0", top: "0", width: "100", height: "100" });
    setStatus("Selected image के edits reset कर दिए गए।");
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
  const handleAssistantCommand = () => {
    if (!selected) { setStatus("पहले canvas या thumbnail से photo/PDF page select करें।"); return; }
    const command = assistantCommand.trim().toLowerCase();
    if (!command) return;
    const amountMatch = command.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? Number(amountMatch[1]) : 10;
    const decrease = /decrease|reduce|lower|कम|घटा|घटाओ|कम करो/.test(command);
    if (/brightness|bright|रोशनी|उजाला|चमक/.test(command)) {
      updateImageFilter("brightness", Math.max(0, Math.min(300, (selected.brightness ?? 100) + (decrease ? -amount : amount))));
      setStatus("Selected photo की brightness " + (decrease ? "कम" : "बढ़ा") + " दी गई। Original upload सुरक्षित है।");
    } else if (/contrast/.test(command)) {
      updateImageFilter("contrast", Math.max(0, Math.min(300, (selected.contrast ?? 100) + (decrease ? -amount : amount))));
      setStatus("Selected photo का contrast update कर दिया गया।");
    } else if (/sharp|शार्प/.test(command)) {
      updateImageFilter("sharpness", Math.max(0, Math.min(5, (selected.sharpness ?? 0) + (decrease ? -1 : 1))));
      setStatus("Selected photo की sharpness update कर दी गई।");
    } else if (/select|choose|crop|region|area|हिस्सा|भाग|चुन/.test(command)) {
      setRegionMode(true);
      setStatus("अब PDF page/photo के अंदर जिस हिस्से को अलग edit करना है, उस पर drag करें। फिर Apply crop या brightness/contrast इस्तेमाल करें।");
    } else if (/rotate|घुमा/.test(command)) {
      void rotateSelected(/left|anticlockwise|बाएं|बाएँ/.test(command) ? -90 : 90);
    } else if (/reset|original|मूल|रीसेट/.test(command)) {
      resetSelected();
    } else if (/undo|वापस/.test(command)) {
      undoEdit();
    } else {
      setStatus("Command समझ नहीं आया। उदाहरण: “brightness 20% बढ़ाओ”, “contrast 10 कम करो”, “इस हिस्से को select करो”, “rotate right” या “reset photo”.");
    }
    setAssistantCommand("");
  };
  const print = () => { if (!items.length) { setStatus("Print से पहले files जोड़ें।"); return; } window.print(); };

  return <main className="editor">
    <svg aria-hidden="true" width="0" height="0" style={{position:"absolute"}}><defs>{[0,1,2,3,4,5].map(level=><filter key={level} id={"sharpness-"+level}><feConvolveMatrix order="3" kernelMatrix={level===0?"0 0 0 0 1 0 0 0 0":`0 -${level} 0 -${level} ${1+4*level} -${level} 0 -${level} 0`} divisor="1" preserveAlpha="true" /></filter>)}</defs></svg>
    <style jsx>{`
      .editor{max-width:1600px;margin:auto;padding:0 0 30px;font-family:Arial,sans-serif;color:#172033;background:#f4f6fb;min-height:100vh}
      .top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#071b3b;color:#fff;padding:13px 18px;align-items:center}.back{color:#fff;text-decoration:none;font-weight:700}
      h1{font-size:clamp(20px,2.5vw,28px);margin:0;color:#fff}.intro{color:#dbe6f7;line-height:1.4;margin:0;font-size:12px}
      .toolbar,.panel{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:9px 12px;background:#fff;border:1px solid #dce3ef;border-radius:10px;margin:10px 12px}
      .btn{border:0;border-radius:7px;padding:8px 10px;background:#1769d2;color:white;font-weight:700;cursor:pointer}.secondary{background:white;color:#243b60;border:1px solid #cbd5e1}.btn:disabled{opacity:.45}
      .status{min-height:18px;color:#28553d;margin:4px 14px;font-size:12px}.workspace{display:grid;grid-template-columns:190px minmax(360px,1fr) 250px;gap:9px;align-items:stretch;padding:0 10px;min-height:calc(100vh - 205px)}
      .stage-wrap{padding:10px;background:#e8edf6;border:1px solid #d4ddec;border-radius:9px;min-width:0;min-height:0;display:flex;flex-direction:column}.stage{position:relative;max-width:100%;margin:0 auto;flex:0 0 auto;aspect-ratio:210/297;background:white;overflow:hidden;box-shadow:0 3px 14px #17251f22;touch-action:pan-y pinch-zoom}
      .placed{position:absolute;border:1px dashed transparent;cursor:default;box-sizing:border-box;touch-action:pan-y pinch-zoom;user-select:none;-webkit-user-select:none}.placed.active{border:2px solid #176b4d}.placed.multi{outline:1px solid #7aa58b}.placed img{width:100%;height:100%;object-fit:fill;pointer-events:none;display:block}.edit-controls{display:grid;gap:8px;padding:9px;border:1px solid #dce5de;border-radius:8px}.edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .resize-handle{position:absolute;width:11px;height:11px;border:1px solid white;border-radius:50%;background:#176b4d;z-index:3;touch-action:none}
      .nw{left:-6px;top:-6px;cursor:nwse-resize}.ne{right:-6px;top:-6px;cursor:nesw-resize}.sw{left:-6px;bottom:-6px;cursor:nesw-resize}.se{right:-6px;bottom:-6px;cursor:nwse-resize}
      .n{left:calc(50% - 5px);top:-6px;cursor:ns-resize}.s{left:calc(50% - 5px);bottom:-6px;cursor:ns-resize}.w{left:-6px;top:calc(50% - 5px);cursor:ew-resize}.e{right:-6px;top:calc(50% - 5px);cursor:ew-resize}
      .side{background:white;border:1px solid #dce3ef;border-radius:9px;padding:10px;display:grid;gap:9px;min-width:0}.side h2{font-size:17px;margin:0}.field{display:grid;gap:4px;font-size:12px;font-weight:700;color:#53645a}.field input,.field select{width:100%;box-sizing:border-box;padding:8px;border:1px solid #cbd9ce;border-radius:7px;background:white;color:#17251f}
      .thumbs{display:grid;gap:7px}.thumb{display:grid;grid-template-columns:20px 54px minmax(0,1fr);gap:8px;align-items:center;padding:6px;border:1px solid #dce5de;border-radius:8px;cursor:pointer;background:white}.thumb.chosen{border-color:#176b4d;background:#f1f8f3}.thumb input[type=checkbox]{width:17px;height:17px;accent-color:#176b4d}.thumb img{width:54px;height:54px;object-fit:contain;background:#f5f7f5}.small{font-size:12px;color:#5c6b62;overflow-wrap:anywhere}
      .pages{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.pagebtn{padding:7px 9px;border:1px solid #cbd9ce;border-radius:7px;background:white;color:#24533d}.pagebtn.active{background:#176b4d;color:white}
      .margin-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.print-pages{display:none}
      @media(max-width:1050px){.workspace{grid-template-columns:155px minmax(0,1fr)}.side{grid-column:1/-1;grid-row:2;grid-template-columns:repeat(2,minmax(0,1fr))}} @media(max-width:650px){.workspace{grid-template-columns:1fr}.side{grid-column:auto;grid-row:auto;grid-template-columns:1fr}.stage{width:min(100%,480px)}.toolbar,.panel{margin:8px}.editor{padding-bottom:18px}}
      @media print{@page{size:${pageSize.w}mm ${pageSize.h}mm;margin:0}:global(body){margin:0!important}:global(body *){visibility:hidden!important}.editor,.editor *{visibility:visible!important}.editor{position:absolute!important;inset:0!important;padding:0!important;margin:0!important;max-width:none!important;width:100%!important}.editor>:not(.print-pages){display:none!important}.print-pages{display:block!important;visibility:visible!important}.print-page{position:relative;width:${pageSize.w}mm;height:${pageSize.h}mm;overflow:hidden;page-break-after:always;break-after:page}.print-page:last-child{page-break-after:auto;break-after:auto}.print-item{position:absolute;box-sizing:border-box}.print-item img{display:block;width:100%;height:100%;object-fit:fill}}
    `}</style>
    <div className="top"><a className="back" href="/document-tools">← Document Actions</a><div><h1>CSCSKB Online | Smart AI Editor ✨</h1><p className="intro">Document · Photo · PDF · Image Editor</p></div><span className="small" style={{color:"#dbe6f7"}}>A4 · 210 × 297 mm</span></div>
    <section className="toolbar">
      <strong style={{color:"#243b60",fontSize:12}}>View</strong>
      <button className={"btn "+(zoomMode==="fit-page"?"":"secondary")} onClick={()=>setZoomMode("fit-page")}>▣ Fit Page</button>
      <button className={"btn "+(zoomMode==="fit-width"?"":"secondary")} onClick={()=>setZoomMode("fit-width")}>↔ Fit Width</button>
      <button className="btn secondary" onClick={()=>{setZoomMode("custom");setZoomPercent(v=>Math.max(40,v-10));}}>−</button>
      <strong className="small">{zoomMode==="fit-page"?"Fit Page":zoomMode==="fit-width"?"Fit Width":zoomPercent+"%"}</strong>
      <button className="btn secondary" onClick={()=>{setZoomMode("custom");setZoomPercent(v=>Math.min(180,v+10));}}>+</button>
      <button className="btn secondary" onClick={()=>{setZoomMode("custom");setZoomPercent(100);}}>100%</button>
      <label className="btn secondary">Add images / PDFs<input type="file" accept="image/*,application/pdf,.pdf" multiple onChange={addFiles} hidden /></label>
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
    {passwordPrompt && <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) cancelPdfPassword(); }} style={{position:"fixed",inset:0,zIndex:10000,background:"#10201899",display:"grid",placeItems:"center",padding:16}}>
      <form role="dialog" aria-modal="true" aria-labelledby="pdf-password-title" onSubmit={submitPdfPassword} style={{width:"min(100%,420px)",background:"white",borderRadius:14,padding:22,boxShadow:"0 18px 60px #0005",display:"grid",gap:12}}>
        <h2 id="pdf-password-title" style={{margin:0,fontSize:21,color:"#17251f"}}>Unlock password-protected PDF</h2>
        <p style={{margin:0,color:"#58685e",fontSize:14}}><strong>{passwordPrompt.fileName}</strong></p>
        {passwordPrompt.incorrect && <p role="alert" style={{margin:0,color:"#b42318",fontSize:13}}>Password incorrect. Please try again.</p>}
        <label className="field">PDF password<input autoFocus type="password" autoComplete="off" value={pdfPassword} onChange={e=>setPdfPassword(e.target.value)} placeholder="Enter PDF password" /></label>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><button type="button" className="btn secondary" onClick={cancelPdfPassword}>Cancel</button><button type="submit" className="btn">Unlock PDF</button></div>
        <p className="small" style={{margin:0}}>Password is used locally to open this file and is not saved by this editor.</p>
      </form></div>}
    <div className="print-pages" aria-hidden="true">{pages.map(page => <section className="print-page" key={"print-"+page.id}>{items.filter(item => item.pageId === page.id).map(item => <div className="print-item" key={item.id} style={{left:(item.x/794*100)+"%",top:(item.y/1123*100)+"%",width:(item.w/794*100)+"%",height:(item.h/1123*100)+"%"}}><img src={item.src} alt="" style={{filter:`brightness(${item.brightness ?? 100}%) contrast(${item.contrast ?? 100}%) url(#sharpness-${item.sharpness ?? 0})`}} /></div>)}</section>)}</div>
    <div className="workspace">
      <aside className="side">
        <h2>▣ Document Actions</h2>
        <label className="btn secondary">⇧ Upload File<input type="file" accept="image/*,application/pdf,.pdf" multiple onChange={addFiles} hidden /></label>
        <button className="btn secondary" onClick={addPage}>＋ Open / Add Page</button>
        <button className="btn secondary" onClick={arrangeGrid} disabled={!pageItems.length}>▦ Collage (Multiple Images)</button>
        <button className="btn secondary" onClick={createPhotoSheet} disabled={!selected}>▧ Photo Sheet</button>
        <button className="btn secondary" onClick={print} disabled={!items.length || busy}>▣ Print</button>
        <button className="btn secondary" onClick={undoEdit} disabled={!editHistory.length}>↶ Undo / Reorder</button>
        <button className="btn secondary" onClick={deleteItem} disabled={!selected}>⌫ Remove Selected</button>
        <p className="small">Original file safe · Editing stays local in this browser.</p>
      </aside>
      <div className="stage-wrap">
        <div className="pages">{pages.map(p => <button key={p.id} className={"pagebtn " + (activePage === p.id ? "active" : "")} onClick={() => setActivePage(p.id)}>{p.label} ({items.filter(i => i.pageId === p.id).length})</button>)}</div>
        <div className="stage" ref={stageRef} style={{ width: zoomMode==="fit-page" ? `min(100%, calc((100vh - 340px) * ${pageSize.w/pageSize.h}))` : zoomMode==="fit-width" ? "100%" : `${zoomPercent}%`, aspectRatio: pageSize.w + "/" + pageSize.h }} onWheel={()=>{setDragId(null);setResizeState(null);}}
          onPointerCancel={()=>{setDragId(null);setResizeState(null);setRegionStart(null);}}
          onPointerMove={e => {
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
          if(regionStart){
            const item=items.find(candidate=>candidate.id===regionStart.itemId);
            if(!item)return;
            const px=(e.clientX-rect.left)*sx, py=(e.clientY-rect.top)*sy;
            const startLeft=Math.max(0,Math.min(100,(regionStart.startX-item.x)/item.w*100));
            const startTop=Math.max(0,Math.min(100,(regionStart.startY-item.y)/item.h*100));
            const endLeft=Math.max(0,Math.min(100,(px-item.x)/item.w*100));
            const endTop=Math.max(0,Math.min(100,(py-item.y)/item.h*100));
            const left=Math.min(startLeft,endLeft), top=Math.min(startTop,endTop);
            setCropRect({left:String(left),top:String(top),width:String(Math.max(1,Math.abs(endLeft-startLeft))),height:String(Math.max(1,Math.abs(endTop-startTop)))});
            return;
          }
          if(!dragId)return;
          const x=(e.clientX-rect.left)*sx-dragOffsetRef.current.x,y=(e.clientY-rect.top)*sy-dragOffsetRef.current.y;
          setItems(old=>old.map(i=>i.id===dragId?{...i,x:Math.max(0,Math.min(794-i.w,x)),y:Math.max(0,Math.min(1123-i.h,y))}:i));
        }} onPointerUp={()=>{setDragId(null);setResizeState(null);if(regionStart){setRegionStart(null);setRegionMode(false);setStatus("चुना हुआ हिस्सा अलग editable layer बनाया जा रहा है…");void extractSelectedRegion();}}} onPointerLeave={()=>{setDragId(null);setResizeState(null);}}>
          {pageItems.map(item => <div key={item.id} className={"placed " + (selectedId === item.id ? "active " : "") + (selectedIds.includes(item.id) ? "multi" : "")} style={{left:(item.x/794*100)+"%",top:(item.y/1123*100)+"%",width:(item.w/794*100)+"%",height:(item.h/1123*100)+"%"}} onPointerDown={e => { if(e.button!==0)return; e.preventDefault(); if(regionMode){e.currentTarget.setPointerCapture(e.pointerId);const rect=stageRef.current?.getBoundingClientRect();if(rect){const px=(e.clientX-rect.left)*794/rect.width,py=(e.clientY-rect.top)*1123/rect.height;setSelectedId(item.id);setSelectedIds([item.id]);setRegionStart({itemId:item.id,startX:px,startY:py});setCropRect({left:String(Math.max(0,(px-item.x)/item.w*100)),top:String(Math.max(0,(py-item.y)/item.h*100)),width:"1",height:"1"});}return;} if(e.ctrlKey||e.metaKey||e.shiftKey||e.nativeEvent.ctrlKey||e.nativeEvent.metaKey||e.nativeEvent.shiftKey){setSelectedIds(old=>old.includes(item.id)?old.filter(id=>id!==item.id):[...old,item.id]);setSelectedId(item.id);return;} const rect=stageRef.current?.getBoundingClientRect(); if(rect){dragOffsetRef.current={x:(e.clientX-rect.left)*794/rect.width-item.x,y:(e.clientY-rect.top)*1123/rect.height-item.y};} setSelectedId(item.id); setSelectedIds([item.id]); setDragId(item.id); }}>
            <img src={item.src} alt={item.name} draggable={false} style={{filter:`brightness(${item.brightness ?? 100}%) contrast(${item.contrast ?? 100}%) url(#sharpness-${item.sharpness ?? 0})`}} />
            {selectedId===item.id && (regionMode || cropRect.left!=="0" || cropRect.top!=="0" || cropRect.width!=="100" || cropRect.height!=="100") && <div aria-hidden="true" style={{position:"absolute",left:cropRect.left+"%",top:cropRect.top+"%",width:cropRect.width+"%",height:cropRect.height+"%",border:"2px dashed #e11d48",background:"#f43f5e22",pointerEvents:"none",boxSizing:"border-box"}} /> }
            {selectedId===item.id && ["nw","n","ne","e","se","s","sw","w"].map(handle=><span key={handle} className={"resize-handle "+handle} onPointerDown={e=>{e.stopPropagation();e.preventDefault();setSelectedId(item.id);setSelectedIds([item.id]);setResizeState({id:item.id,handle,startX:e.clientX,startY:e.clientY,startW:item.w,startH:item.h});}} />)}
          </div>)}
          {!pageItems.length && <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#829087"}}>इस page पर photos जोड़ें या organizer से move करें</div>}
        </div>
      </div>
      <aside className="side">
        <h2>Smart edit assistant</h2>
        <p className="small">Selected photo/page के लिए natural-language shortcuts. उदाहरण: “brightness 20% बढ़ाओ” या “इस हिस्से को select करो”.</p>
        <form onSubmit={e=>{e.preventDefault();handleAssistantCommand();}} style={{display:"grid",gap:7}}>
          <input aria-label="Edit instruction" value={assistantCommand} onChange={e=>setAssistantCommand(e.target.value)} placeholder="Tell me what to edit…" style={{width:"100%",boxSizing:"border-box",padding:9,border:"1px solid #cbd9ce",borderRadius:7}} />
          <button className="btn" type="submit" disabled={!selected || !assistantCommand.trim()}>Apply instruction</button>
        </form>
        <button className="btn secondary" onClick={()=>{setRegionMode(true);setStatus("PDF page/photo के अंदर जिस photo या हिस्से को edit करना है, उस पर drag करके select करें।");}} disabled={!selected}>Select photo / region inside page</button>
        <hr />
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
          <img src={item.src} alt="" style={{filter:`brightness(${item.brightness ?? 100}%) contrast(${item.contrast ?? 100}%)`}} /><div><strong className="small">{item.name}</strong><div className="small">Page {item.pageId}</div><select aria-label="Assign page" value={item.pageId} onClick={e => e.stopPropagation()} onChange={e => moveToPage(item.id, Number(e.target.value))}>{pages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
        </div>)}</div>
        {selected && <><hr /><strong className="small">{selected.name}</strong>
          <div className="position-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <label className="field">X (mm)<input type="number" step="0.1" value={(selected.x / 794 * pageSize.w).toFixed(1)} onChange={e => updateSelected("x",String(Number(e.target.value) * 794 / pageSize.w))} /></label>
            <label className="field">Y (mm)<input type="number" step="0.1" value={(selected.y / 1123 * pageSize.h).toFixed(1)} onChange={e => updateSelected("y",String(Number(e.target.value) * 1123 / pageSize.h))} /></label>
            <label className="field">Width (mm)<input type="number" min="1" step="0.1" value={(selected.w / 794 * pageSize.w).toFixed(1)} onChange={e => updateSelected("w",String(Number(e.target.value) * 794 / pageSize.w))} /></label>
            <label className="field">Height (mm)<input type="number" min="1" step="0.1" value={(selected.h / 1123 * pageSize.h).toFixed(1)} onChange={e => updateSelected("h",String(Number(e.target.value) * 1123 / pageSize.h))} /></label>
          </div>
          <section className="edit-controls">
            <strong className="small">Image editing</strong>
            {!selected.name.includes("· selected region") && <>
            <div className="edit-grid">
              <label className="field">Crop ratio<select value={cropRatio} onChange={e => { const ratio=e.target.value; setCropRatio(ratio); if(ratio!=="free"){const parts=ratio.split(":").map(Number);const target=parts[0]/parts[1];let width=Number(cropRect.width),height=Number(cropRect.height);if(width/height>target)width=height*target;else height=width/target;setCropRect(old=>({...old,width:String(Math.max(1,Math.min(100,width))),height:String(Math.max(1,Math.min(100,height)))}));}}}><option value="free">Free</option><option value="1:1">1:1 Square</option><option value="3:4">3:4</option><option value="4:5">4:5</option><option value="7:9">Passport 35:45</option><option value="16:9">16:9</option></select></label>
              <label className="field">Left (%)<input type="number" min="0" max="99" value={cropRect.left} onChange={e=>setCropRect(old=>({...old,left:e.target.value}))}/></label>
              <label className="field">Top (%)<input type="number" min="0" max="99" value={cropRect.top} onChange={e=>setCropRect(old=>({...old,top:e.target.value}))}/></label>
              <label className="field">Width (%)<input type="number" min="1" max="100" value={cropRect.width} onChange={e=>setCropRect(old=>({...old,width:e.target.value}))}/></label>
              <label className="field">Height (%)<input type="number" min="1" max="100" value={cropRect.height} onChange={e=>setCropRect(old=>({...old,height:e.target.value}))}/></label>
            </div>
            <button className="btn secondary" onClick={cropSelected}>Apply crop</button>
            <button className="btn" onClick={extractSelectedRegion}>Extract selected region as editable photo</button>
            </>}
            <div className="edit-grid">
              <button className="btn secondary" onClick={()=>rotateSelected(-90)}>↶ Rotate 90°</button>
              <button className="btn secondary" onClick={()=>rotateSelected(90)}>↷ Rotate 90°</button>
            </div>
            <label className="field">Brightness: {selected.brightness ?? 100}%<input type="range" min="50" max="150" value={selected.brightness ?? 100} onChange={e=>updateImageFilter("brightness",Number(e.target.value))}/></label>
            <label className="field">Contrast: {selected.contrast ?? 100}%<input type="range" min="50" max="150" value={selected.contrast ?? 100} onChange={e=>updateImageFilter("contrast",Number(e.target.value))}/></label>
            <label className="field">Sharpness: {selected.sharpness ?? 0}<input type="range" min="0" max="5" value={selected.sharpness ?? 0} onChange={e=>updateImageFilter("sharpness",Number(e.target.value))}/></label>
            <div className="edit-grid">
              <button className="btn secondary" onClick={undoEdit} disabled={!editHistory.length}>Undo</button>
              <button className="btn secondary" onClick={resetSelected}>Reset image</button>
            </div>
            <p className="small">Crop values are percentages of the original image. Brightness, contrast and sharpness filters are applied to the preview and print output.</p>
          </section>
          <button className="btn secondary" onClick={() => moveToPage(selected.id, activePage)}>Move to current page</button>
          <button className="btn secondary" onClick={() => {setClipboardItem({...selected});setStatus("Photo copied. Press Ctrl+V to paste.");}}>Copy (Ctrl+C)</button>
          <button className="btn secondary" onClick={() => {const copy={...selected,id:uid(),name:selected.name+" copy",pageId:activePage,x:Math.min(794-selected.w,selected.x+24),y:Math.min(1123-selected.h,selected.y+24)};setItems(old=>[...old,copy]);setSelectedId(copy.id);}}>Duplicate</button>
          <button className="btn secondary" onClick={deleteItem}>Remove selected</button>
        </>}
        <p className="small">PDF pages are rendered locally in this browser. Crop/rotate create local image copies; brightness/contrast are applied in preview and print. Password-protected PDFs require the correct password. Official passport/visa/PAN photo specifications must be verified against the relevant current form before printing.</p>
      </aside>
    </div>
  </main>;
}
