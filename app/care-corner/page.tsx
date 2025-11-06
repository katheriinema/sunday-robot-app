"use client";
import Image from "next/image";
import { useState } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

type ZoneKey = "water" | "fruit" | "play" | "rest" | null;

export default function CareCorner() {
  const [lastClick, setLastClick] = useState<ZoneKey>(null);
  const [hunger, setHunger] = useState(50);
  const [water, setWater] = useState(50);
  const [rest, setRest] = useState(50);
  const [exercise, setExercise] = useState(50);

  const noteFor = (z: ZoneKey) => (
    z === "water" ? "Hydration" :
    z === "fruit" ? "Snack Time" :
    z === "play" ? "Movement & Play" :
    z === "rest" ? "Cozy Rest" : ""
  );

  return (
    <div className="relative min-h-screen w-full">
      {/* Background */}
      <Image 
        src="/assets/bg/baby.png" 
        alt="Care Corner background" 
        fill 
        className="object-cover"
        priority
        unoptimized
      />

      {/* Companion image removed for now (will be replaced later) */}

      {/* Invisible interaction zones - approximate polygons. Adjust later. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Water cup (hydration) */}
        <polygon
          points="250,520 300,520 300,600 240,600"
          fill="transparent"
          className="pointer-events-auto cursor-pointer"
          onClick={() => setLastClick("water")}
          aria-label="Hydration"
        />

        {/* Fruit bowl (snack) */}
        <polygon
          points="460,430 560,430 570,480 450,480"
          fill="transparent"
          className="pointer-events-auto cursor-pointer"
          onClick={() => setLastClick("fruit")}
          aria-label="Snack"
        />

        {/* Soccer ball (movement/play) */}
        <polygon
          points="980,640 1040,640 1040,700 980,700"
          fill="transparent"
          className="pointer-events-auto cursor-pointer"
          onClick={() => setLastClick("play")}
          aria-label="Movement and play"
        />

        {/* Cushion bed (rest) */}
        <polygon
          points="1180,560 1380,560 1400,630 1160,630"
          fill="transparent"
          className="pointer-events-auto cursor-pointer"
          onClick={() => setLastClick("rest")}
          aria-label="Rest"
        />

        {/* Plant is decorative only - no handler */}
        <polygon
          points="150,300 220,300 220,520 150,520"
          fill="transparent"
        />
      </svg>

      {/* HUD: Meters and actions */}
      <div className="absolute left-4 top-4 bg-white/85 backdrop-blur-sm rounded-xl border border-emerald-200 shadow p-4 w-[280px]">
        <div className="font-semibold text-emerald-900 mb-2">Care Meters</div>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-700 mb-1">Hunger</div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${hunger}%` }} />
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-700 mb-1">Water</div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${water}%` }} />
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-700 mb-1">Rest</div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${rest}%` }} />
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-700 mb-1">Exercise</div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-fuchsia-500" style={{ width: `${exercise}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => setHunger((v) => Math.min(100, v + 10))} className="px-3 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold">Food</button>
          <button onClick={() => setWater((v) => Math.min(100, v + 10))} className="px-3 py-2 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-semibold">Water</button>
          <button onClick={() => setRest((v) => Math.min(100, v + 10))} className="px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold">Sleep</button>
          <button onClick={() => setExercise((v) => Math.min(100, v + 10))} className="px-3 py-2 rounded-lg bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-900 font-semibold">Exercise</button>
        </div>
      </div>

      {/* Gentle feedback note */}
      {lastClick && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-white/80 text-emerald-900 border border-emerald-200 rounded-xl px-4 py-2 shadow">
          {noteFor(lastClick)}
        </div>
      )}

      <GlobalNavigation />
    </div>
  );
}


