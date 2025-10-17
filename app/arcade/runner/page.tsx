"use client";
import { useEffect } from "react";

export default function RunnerPage() {
  useEffect(() => {
    // Redirect directly to the Godot game
    window.location.href = "/godot-builds/runner/index.html";
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative">
      <div className="text-white text-xl">Loading Circuit Sprint...</div>
      
      {/* Cute Back Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="/living-room" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          <span className="text-xl">🏠</span>
          Back to Room
        </a>
      </div>
    </div>
  );
}
