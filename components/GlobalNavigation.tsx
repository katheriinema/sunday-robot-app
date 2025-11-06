"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParentAccessManager from "@/components/parent/ParentAccessManager";

export default function GlobalNavigation() {
  const router = useRouter();
  const [parentOpen, setParentOpen] = useState(false);

  return (
    <>
      {/* Settings Button - Top Right */}
      <button
        aria-label="Settings"
        onClick={() => setParentOpen(true)}
        className="fixed top-4 right-4 z-50 hover:opacity-80 transition-opacity transform hover:scale-110"
      >
        <img src="/assets/ui/settings.png" alt="settings" className="w-7 h-7" />
      </button>

      {/* Home Button - Bottom Left */}
      <button
        onClick={() => router.push("/living-room")}
        aria-label="Go to home"
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
      >
        🏠
      </button>

      {/* Parent Access Manager */}
      <ParentAccessManager open={parentOpen} onClose={() => setParentOpen(false)} />
    </>
  );
}

