"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ParentAccessManager from "@/components/parent/ParentAccessManager";
import TaskNotification from "@/components/TaskNotification";
import GlobalNavigation from "@/components/GlobalNavigation";

export default function LivingRoom() {
  const r = useRouter();
  const [parentOpen, setParentOpen] = useState(false);
  
  const handleGameAreaClick = () => {
    r.push("/arcade");
  };

  return (
    <div className="relative min-h-screen w-full select-none">
      <GlobalNavigation />
      <Image 
        src="/assets/bg/living-room.png" 
        alt="Sunday's living room" 
        fill 
        className="object-cover" 
        priority 
        unoptimized
        />
        
        {/* Custom-shaped clickable areas matching the drawing */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
          {/* Bookshelf */}
          <polygon
            points="135,210 428,222 427,656 135,678"
            fill="transparent"
            stroke="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              r.push("/books");
            }}
          />
          
          {/* Game Table */}
          <polygon
            points="470,605 480,722 846,758 861,600"
            fill="transparent"
            stroke="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGameAreaClick();
            }}
          />
          
          {/* Plant */}
          <polygon
            points="1346,225 1523,225 1474,651 1389,650"
            fill="transparent"
            stroke="transparent"
            className="pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              r.push("/care-corner");
            }}
          />
        </svg>

        <TaskNotification />
    </div>
  );
}
