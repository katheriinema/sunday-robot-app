"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LivingRoom() {
  const r = useRouter();
  const [showGameModal, setShowGameModal] = useState(false);
  
  const handleGameAreaClick = () => {
    setShowGameModal(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowGameModal(false);
    }
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

        {/* Game Selection Modal */}
        {showGameModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-6"
            onClick={handleBackdropClick}
          >
            {/* Game Selection Modal */}
            <div className="bg-white bg-opacity-10 rounded-2xl shadow-lg max-w-3xl w-full max-h-[70vh] overflow-y-auto border border-white border-opacity-20 backdrop-blur-md">
              {/* Header with Close Button */}
              <div className="sticky top-0 bg-white bg-opacity-10 rounded-t-2xl p-5 border-b border-white border-opacity-20 flex justify-between items-center backdrop-blur-md">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Choose Your Game
                </h1>
                <button 
                  onClick={() => setShowGameModal(false)}
                  className="text-2xl text-white hover:text-gray-200 transition-colors duration-200 p-1 drop-shadow-lg"
                >
                  ×
                </button>
              </div>

              {/* Game Cards */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sunday Logic Card */}
                  <Link href="/arcade/math" className="group">
                    <div className="relative bg-white bg-opacity-5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 overflow-hidden border border-white border-opacity-20 hover:border-blue-300 backdrop-blur-sm">
                      {/* Content */}
                      <div className="relative p-6 text-center">
                        {/* Game Icon */}
                        <div className="w-24 h-24 mx-auto mb-4 bg-blue-400 bg-opacity-25 rounded-xl flex items-center justify-center border border-blue-300 border-opacity-50 backdrop-blur-sm shadow-lg">
                          <div className="text-4xl text-blue-100 font-bold drop-shadow-lg">M</div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">Sunday Logic</h2>
                        <p className="text-gray-200 text-sm drop-shadow-sm">Math puzzles and brain training</p>
                      </div>
                    </div>
                  </Link>

                  {/* Robot Runner Card */}
                  <Link href="/arcade/runner" className="group">
                    <div className="relative bg-white bg-opacity-5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 overflow-hidden border border-white border-opacity-20 hover:border-green-300 backdrop-blur-sm">
                      {/* Content */}
                      <div className="relative p-6 text-center">
                        {/* Game Icon */}
                        <div className="w-24 h-24 mx-auto mb-4 bg-green-400 bg-opacity-25 rounded-xl flex items-center justify-center border border-green-300 border-opacity-50 backdrop-blur-sm shadow-lg">
                          <div className="text-4xl text-green-100 font-bold drop-shadow-lg">R</div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">Robot Runner</h2>
                        <p className="text-gray-200 text-sm drop-shadow-sm">Endless running adventure</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
