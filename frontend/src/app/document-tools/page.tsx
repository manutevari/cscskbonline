import { permanentRedirect } from "next/navigation";

export default function DocumentToolsRedirectPage() {
  permanentRedirect("/document-tools/print-editor");
}
