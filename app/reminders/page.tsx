"use client";
import { useState } from "react";

export default function Reminders() {
  const [hydrated, setHydrated] = useState(false);
  return (
    <div className="grid place-items-center h-dvh bg-sky-100">
      <button className="btn text-2xl" onClick={() => setHydrated(true)}>
        {hydrated ? "✅ Great job! Stay hydrated." : "💧 Drink some water!"}
      </button>
    </div>
  );
}
