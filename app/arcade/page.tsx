"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Arcade() {
  const router = useRouter();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.push("/living-room");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Living Room Background */}
      <div className="absolute inset-0">
        <Image 
          src="/assets/bg/living-room.png" 
          alt="Sunday's living room" 
          fill 
          className="object-cover" 
          priority 
          unoptimized
        />
      </div>
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6"
        onClick={handleBackdropClick}
      >
        {/* Game Selection Modal */}
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header with Close Button */}
          <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b-2 border-gray-100 flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">
              Choose Your Game
            </h1>
            <button 
              onClick={() => router.push("/living-room")}
              className="text-3xl text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>

          {/* Game Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Sunday Logic Card */}
              <Link href="/arcade/math" className="group">
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-purple-300">
                  {/* Content */}
                  <div className="relative p-8 text-center">
                    {/* Game Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg overflow-hidden">
                      <img 
                        src="/assets/apps/math.png" 
                        alt="Sunday Logic" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Sunday Logic</h2>
                    <p className="text-gray-600 mb-4">Math puzzles and brain training</p>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              </Link>

              {/* Robot Runner Card */}
              <Link href="/arcade/runner" className="group">
                <div className="relative bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-green-300">
                  {/* Content */}
                  <div className="relative p-8 text-center">
                    {/* Game Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg overflow-hidden">
                      <img 
                        src="/assets/apps/circuit.png" 
                        alt="Robot Runner" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Robot Runner</h2>
                    <p className="text-gray-600 mb-4">Endless running adventure</p>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              </Link>

              {/* Flappy Sunday Card */}
              <Link href="/arcade/flappy-sunday" className="group">
                <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden border-4 border-transparent hover:border-yellow-300">
                  {/* Content */}
                  <div className="relative p-8 text-center">
                    {/* Game Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg overflow-hidden">
                      <img 
                        src="/assets/apps/flappy.png" 
                        alt="Flappy Sunday" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Flappy Sunday</h2>
                    <p className="text-gray-600 mb-4">Help Sunday fly through obstacles!</p>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
