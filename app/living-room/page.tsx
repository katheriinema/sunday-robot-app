"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LivingRoom() {
  const r = useRouter();
  
  return (
    <div className="relative min-h-screen w-full">
      <Image 
        src="/assets/bg/living-room.png" 
        alt="Sunday's living room" 
        fill 
        className="object-cover" 
        priority 
        unoptimized
        />
        
        {/* Clickable hotspots */}
        <button onClick={() => r.push("/books")} className="absolute" style={{left:"8%", top:"30%", width:"18%", height:"45%"}} />
        <button onClick={() => r.push("/arcade")} className="absolute" style={{left:"38%", top:"60%", width:"25%", height:"18%"}} />
        <button onClick={() => r.push("/reminders")} className="absolute" style={{right:"2%", top:"40%", width:"15%", height:"30%"}} />
    </div>
  );
}
