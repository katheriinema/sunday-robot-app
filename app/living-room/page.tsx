"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LivingRoom() {
  const r = useRouter();
  
  const handleGameAreaClick = () => {
    r.push("/arcade");
  };

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
        
        {/* Custom-shaped clickable areas matching the drawing */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Bookshelf */}
          <polygon
            points="135,210 428,222 427,656 135,678"
            fill="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={() => r.push("/books")}
          />
          
          {/* Game Table */}
          <polygon
            points="470,605 480,722 846,758 861,600"
            fill="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={handleGameAreaClick}
          />
          
          {/* Plant */}
          <polygon
            points="1346,225 1523,225 1474,651 1389,650"
            fill="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={() => r.push("/reminders")}
          />
        </svg>
    </div>
  );
}
