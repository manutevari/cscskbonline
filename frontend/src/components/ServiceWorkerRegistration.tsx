"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
      // Registration is an enhancement; it must never prevent the website from loading.
      console.warn("CSCSKB offline support could not be registered:", error);
    });
  }, []);

  return null;
}
