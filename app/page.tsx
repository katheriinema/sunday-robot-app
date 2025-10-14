"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Welcome() {
  const r = useRouter();
  
  useEffect(() => {
    // Skip onboarding and set completion flag
    const userName = localStorage.getItem("sundayUserName") || "Friend";
    const hasCompletedOnboarding = localStorage.getItem("sundayOnboardingCompleted");
    
    // Always set onboarding as completed and store a default name
    if (!hasCompletedOnboarding) {
      localStorage.setItem("sundayUserName", userName);
      localStorage.setItem("sundayOnboardingCompleted", "true");
    }
    
    // Welcome back existing users
    const u = new SpeechSynthesisUtterance(`Hi! I'm Sunday. Welcome back, ${userName}! Tap to enter my room.`);
    u.lang = "en-US";
    speechSynthesis.cancel(); 
    speechSynthesis.speak(u);
  }, [r]);

  const resetOnboarding = () => {
    localStorage.removeItem("sundayUserName");
    localStorage.removeItem("sundayOnboardingCompleted");
    r.push("/onboarding");
  };

  return (
    <main className="grid place-items-center h-dvh bg-amber-50">
      <div className="text-center space-y-4">
        <button className="btn text-xl" onClick={() => r.push("/living-room")}>
          Enter Sunday's World
        </button>
        <div className="text-sm text-gray-600">
          <button 
            onClick={resetOnboarding}
            className="underline hover:no-underline"
          >
            🔄 Reset Onboarding (Test First Visit)
          </button>
        </div>
      </div>
    </main>
  );
}
