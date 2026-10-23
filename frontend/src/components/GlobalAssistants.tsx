"use client";

import { usePathname } from "next/navigation";
import CSCAppointmentAssistant from "@/components/CSCAppointmentAssistant";
import CSCLiveVoiceAssistant from "@/components/CSCLiveVoiceAssistant";

export default function GlobalAssistants() {
  const pathname = usePathname();
  return (
    <>
      <CSCAppointmentAssistant />
      {pathname !== "/jobs" && <CSCLiveVoiceAssistant />}
    </>
  );
}
