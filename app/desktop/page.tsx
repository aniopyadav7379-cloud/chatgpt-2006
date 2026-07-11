"use client";

import { useState } from "react";
import BootScreen from "@/components/BootScreen";
import DesktopProvider from "@/components/desktop/DesktopProvider";
import Desktop from "@/components/desktop/Desktop";

export default function DesktopPage() {
  const [booted, setBooted] = useState(false);

  if (!booted) {
    return <BootScreen onDone={() => setBooted(true)} />;
  }

  return (
    <DesktopProvider>
      <Desktop />
    </DesktopProvider>
  );
}