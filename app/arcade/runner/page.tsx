"use client";
import { useEffect } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

export default function RunnerPage() {
  useEffect(() => {
    // Redirect directly to the Godot game
    window.location.href = "/godot-builds/runner/index.html";
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative">
      <GlobalNavigation />
      <div className="text-white text-xl">Loading Circuit Sprint...</div>
    </div>
  );
}
