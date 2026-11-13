import { redirect } from "next/navigation";

// Legacy URL: send visitors to the canonical Crop & Merge / Smart Print Editor page.
export default function LegacyPrintEditorRoute() {
  redirect("/document-tools");
}
