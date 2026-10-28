export type ToolRecord = {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  status: "available" | "external" | "planned";
  url?: string;
};

export const TOOL_CATALOG: ToolRecord[] = [
  { id: "image-crop", name: "Image Crop & Auto Crop", category: "Image & Photo", description: "Crop images manually or detect non-background content automatically; reset crop to the full image.", keywords: ["crop", "auto crop", "trim", "edges", "photo"], status: "available", url: "/document-tools" },
  { id: "image-resize", name: "Image Resize with DPI and Units", category: "Image & Photo", description: "Resize by width and height using pixels, centimeters, millimeters or inches, with DPI conversion, aspect ratios and presets.", keywords: ["resize", "dimensions", "dpi", "pixels", "cm", "mm", "inches", "A4", "passport", "signature"], status: "available", url: "/document-tools" },
  { id: "image-compress", name: "Image Compressor", category: "Image & Photo", description: "Reduce image file size to a target KB limit and export to supported image formats.", keywords: ["compress", "reduce size", "KB", "JPEG", "JPG", "PNG", "WebP"], status: "available", url: "/document-tools" },
  { id: "image-convert", name: "Image Format Converter", category: "Image & Photo", description: "Convert supported images to JPEG, PNG, WebP or PDF output where supported by the current editor.", keywords: ["convert", "format", "webp", "png", "jpeg", "pdf"], status: "available", url: "/document-tools" },
  { id: "passport-photo", name: "Passport Photo Presets", category: "Image & Photo", description: "Start from common passport-photo dimensions; always verify the destination authority's required size.", keywords: ["passport", "visa", "photo", "35x45", "identity"], status: "available", url: "/document-tools" },
  { id: "signature-resize", name: "Signature Resize Presets", category: "Image & Photo", description: "Start from common signature dimensions and export to a target size; verify portal requirements before submission.", keywords: ["signature", "sign", "140x60", "6x2 cm"], status: "available", url: "/document-tools" },
  { id: "image-metadata", name: "Image Metadata", category: "Image & Photo", description: "Inspect image dimensions and file information. Full EXIF editing is a separate planned capability.", keywords: ["metadata", "EXIF", "image info"], status: "planned" },
  { id: "pdf-open", name: "PDF Page Preview and Export", category: "PDF & Documents", description: "Open PDF pages in the editor, navigate pages, handle password-protected PDFs with the supplied password, and export selected page content.", keywords: ["PDF", "page", "password", "preview", "export"], status: "available", url: "/document-tools" },
  { id: "pdf-merge", name: "PDF Merge", category: "PDF & Documents", description: "Combine multiple PDF files into one document.", keywords: ["merge", "join", "combine", "PDF"], status: "planned" },
  { id: "pdf-split", name: "PDF Split", category: "PDF & Documents", description: "Split a PDF into selected pages or page ranges.", keywords: ["split", "extract pages", "PDF"], status: "planned" },
  { id: "pdf-compress", name: "PDF Compressor", category: "PDF & Documents", description: "Reduce PDF file size while balancing visual quality.", keywords: ["compress", "reduce size", "PDF"], status: "planned" },
  { id: "pdf-rotate", name: "PDF Rotate", category: "PDF & Documents", description: "Rotate PDF pages and export the corrected document.", keywords: ["rotate", "orientation", "PDF"], status: "planned" },
  { id: "pdf-ocr", name: "PDF/Image OCR", category: "PDF & Documents", description: "Extract searchable text from scanned pages and images using OCR.", keywords: ["OCR", "extract text", "scan", "Hindi", "English"], status: "planned" },
  { id: "a4-print", name: "A4 Print Layout", category: "PDF & Documents", description: "Prepare an A4 print layout with page dimensions, margins and print preview; verify browser print settings.", keywords: ["A4", "print", "paper", "margins", "page layout"], status: "available", url: "/document-tools" },
  { id: "audio-trim", name: "Audio Trimmer", category: "Audio", description: "Trim audio to a selected time range.", keywords: ["audio", "cut", "trim", "mp3"], status: "external", url: "https://audio.pi7.org/" },
  { id: "audio-merge", name: "Audio Merger", category: "Audio", description: "Combine multiple audio files into one track.", keywords: ["audio", "merge", "join"], status: "external", url: "https://audio.pi7.org/" },
  { id: "audio-convert", name: "Audio Converter", category: "Audio", description: "Convert between supported audio formats.", keywords: ["audio", "convert", "format"], status: "external", url: "https://audio.pi7.org/" },
  { id: "gif-tools", name: "GIF Tools", category: "GIF & Video", description: "Open external GIF utilities for resizing, optimizing or creating GIFs; exact capabilities depend on the provider.", keywords: ["GIF", "animation", "optimize", "resize", "video to GIF"], status: "external", url: "https://gif.pi7.org/" },
  { id: "bulk-resizer", name: "Bulk Image Resizer", category: "Bulk & Collage", description: "Resize many images in a batch; the current site also supports multi-image processing and ZIP download.", keywords: ["bulk", "batch", "multiple images", "ZIP", "resize"], status: "available", url: "/document-tools" },
  { id: "collage", name: "Photo Collage Maker", category: "Bulk & Collage", description: "Arrange multiple photos into a collage.", keywords: ["collage", "grid", "combine photos"], status: "external", url: "https://collage.pi7.org/" },
  { id: "ai-vision", name: "AI Vision Tools", category: "AI Image Tools", description: "External image/vision utilities; AI enhancement, removal and upscaling are not claimed as locally integrated until implemented and tested.", keywords: ["AI", "vision", "enhance", "upscale", "background removal", "object removal"], status: "external", url: "https://vision.pi7.org/" },
  { id: "ai-workspace", name: "AI Creator Tools", category: "AI Image Tools", description: "Explore external AI creator tools. This link is not an API integration into CSC SKB Online.", keywords: ["AI", "creator", "prompt", "writing"], status: "external", url: "https://thetoolhive.org/" },
  { id: "base64", name: "Base64 Encoder/Decoder", category: "Developer & Other", description: "Encode text to Base64 or decode Base64 text.", keywords: ["base64", "encode", "decode", "developer"], status: "external", url: "https://base64.pi7.org/" },
  { id: "batch-zip", name: "Batch Processing and ZIP Download", category: "Bulk & Collage", description: "Process multiple images together and download results as a ZIP archive.", keywords: ["batch", "zip", "multiple files", "bulk"], status: "available", url: "/document-tools" },
];

export function chunkTool(tool: ToolRecord) {
  return {
    id: tool.id,
    category: tool.category,
    title: tool.name,
    content: [
      `Tool: ${tool.name}`,
      `Category: ${tool.category}`,
      `Description: ${tool.description}`,
      `Keywords: ${tool.keywords.join(", ")}`,
      `Availability: ${tool.status}`,
      tool.url ? `URL: ${tool.url}` : "URL: not available",
    ].join("\n"),
    metadata: { status: tool.status, url: tool.url ?? null, keywords: tool.keywords },
  };
}
