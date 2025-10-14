"use client";
import { useEffect } from "react";
import GodotFrame from "@/components/GodotFrame";

export default function MathPage() {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "GAME_SCORE") console.log("Math score:", e.data.score);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return <GodotFrame buildUrl="/godot-builds/math/index.html" />;
}
