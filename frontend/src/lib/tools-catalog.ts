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
  { id: "image-increase-size", name: "Increase Image Size", category: "Image & Photo", description: "Increase image file size in KB or MB for upload requirements.", keywords: ["increase image size", "KB", "MB", "file size"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-white-background", name: "White Background Photo", category: "Image & Photo", description: "Create a photo with a white background; check the destination form's photo rules.", keywords: ["white background", "passport", "photo background"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-background", name: "Background Tools", category: "Image & Photo", description: "Explore background removal, blur and color-change tools.", keywords: ["remove background", "blur background", "blue background", "red background"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-dpi", name: "Convert or Check Image DPI", category: "Image & Photo", description: "Find image DPI utilities and prepare images for print-resolution requirements.", keywords: ["DPI", "200 DPI", "300 DPI", "600 DPI", "check DPI", "convert DPI"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-ocr", name: "Image to Text (OCR)", category: "Image & Photo", description: "Extract text from an image using optical character recognition.", keywords: ["OCR", "image to text", "extract text", "scan"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-merge-signature", name: "Merge Photo and Signature", category: "Image & Photo", description: "Combine a photo and signature image for document upload workflows.", keywords: ["merge photo", "signature", "combine"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-watermark", name: "Watermark Images", category: "Image & Photo", description: "Add a text or logo watermark to images.", keywords: ["watermark", "logo", "copyright"], status: "external", url: "https://image.pi7.org/" },
  { id: "image-remove-object", name: "Remove Text, Logo or Object", category: "AI Image Tools", description: "Find tools for removing unwanted text, logos or objects from images.", keywords: ["remove text", "remove logo", "remove object", "AI erase"], status: "external", url: "https://vision.pi7.org/" },
  { id: "image-enhance", name: "Enhance or Upscale Image", category: "AI Image Tools", description: "Find AI photo enhancement, restoration and upscaling tools.", keywords: ["enhance", "upscale", "super resolution", "restore old photo", "unblur"], status: "external", url: "https://vision.pi7.org/" },
  { id: "image-to-pdf", name: "Image to PDF", category: "PDF & Documents", description: "Convert one or more images into a PDF document.", keywords: ["image to PDF", "JPG to PDF", "photo PDF"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "pdf-to-image", name: "PDF to Image", category: "PDF & Documents", description: "Convert PDF pages to image files.", keywords: ["PDF to JPG", "PDF to PNG", "PDF to image", "convert"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "pdf-edit", name: "PDF Editor", category: "PDF & Documents", description: "Open PDF editing tools for pages, annotations, signatures and forms.", keywords: ["PDF editor", "sign PDF", "fill form", "highlight", "add image", "crop PDF"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "pdf-sign", name: "Sign PDF", category: "PDF & Documents", description: "Add a signature to a PDF document.", keywords: ["sign PDF", "digital signature", "signature", "document"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "pdf-pages-sheet", name: "Multiple PDF Pages Per Sheet", category: "PDF & Documents", description: "Arrange two or more PDF pages on one sheet for compact printing.", keywords: ["pages per sheet", "2 per page", "4 per page", "print"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "pdf-fill-form", name: "Fill PDF Form", category: "PDF & Documents", description: "Fill form fields, check boxes and add text or signatures to PDFs.", keywords: ["fill PDF", "PDF form", "checkbox", "form fields"], status: "external", url: "https://pdf.pi7.org/" },
  { id: "audio-speed-pitch", name: "Audio Speed and Pitch", category: "Audio", description: "Change audio playback speed or pitch.", keywords: ["audio speed", "slow down", "speed up", "pitch"], status: "external", url: "https://audio.pi7.org/" },
  { id: "audio-compress", name: "Compress Audio", category: "Audio", description: "Reduce audio file size for sharing or upload.", keywords: ["compress audio", "audio KB", "audio size"], status: "external", url: "https://audio.pi7.org/" },
  { id: "audio-recorder", name: "Audio Recorder", category: "Audio", description: "Open an audio recording tool.", keywords: ["record audio", "voice recorder", "microphone"], status: "external", url: "https://audio.pi7.org/" },
  { id: "gif-optimize", name: "GIF Optimizer", category: "GIF & Video", description: "Optimize animated GIFs to reduce file size.", keywords: ["GIF optimizer", "compress GIF", "animation"], status: "external", url: "https://gif.pi7.org/" },
  { id: "video-to-gif", name: "Video to GIF", category: "GIF & Video", description: "Convert a video clip into an animated GIF.", keywords: ["video to GIF", "make GIF", "animation"], status: "external", url: "https://gif.pi7.org/" },
  { id: "collab-codepad", name: "Collaborative Code Pad", category: "Developer & Other", description: "Open a shared live code pad for collaborative editing.", keywords: ["collab", "code pad", "share code", "live editing"], status: "external", url: "https://collab.pi7.org/" },
  { id: "hash-generator", name: "Hash Generator", category: "Developer & Other", description: "Generate a hash from text or input data.", keywords: ["hash", "checksum", "MD5", "SHA"], status: "external", url: "https://pi7.org/" },
  { id: "password-generator", name: "Password Generator", category: "Developer & Other", description: "Generate a random password locally or with a trusted tool.", keywords: ["password", "secure password", "random"], status: "external", url: "https://pi7.org/" },
  { id: "text-editor", name: "Online Text Editor", category: "Developer & Other", description: "Edit plain text in a browser.", keywords: ["text editor", "plain text", "notes"], status: "external", url: "https://pi7.org/" },
  { id: "smalljpg-compress", name: "SmallJPG Image Compressor", category: "Image & Photo", description: "Open the separate SmallJPG service for target-size JPG compression.", keywords: ["SmallJPG", "compress JPG", "exact size"], status: "external", url: "https://smalljpg.org/" },
  { id: "toolhive-ai", name: "ToolHive AI Creator Suite", category: "AI Image Tools", description: "Explore external creator tools for prompts, resume, writing and SEO. These are links, not local API integrations.", keywords: ["ToolHive", "AI prompts", "resume", "writing", "SEO"], status: "external", url: "https://thetoolhive.org/" },
  { id: "synthetic-face-generator", name: "Synthetic Face Generator", category: "AI Image Tools", description: "Generate synthetic faces that do not represent real people.", keywords: ["AI face", "synthetic face", "generate face"], status: "external", url: "https://thispersonnotexist.org/" },
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
