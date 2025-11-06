"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile fields
  const [childName, setChildName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const age = useMemo(() => {
    if (!birthday) return null as number | null;
    const b = new Date(birthday);
    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years--;
    return years;
  }, [birthday]);

  const dialogues = [
    "Hi there! I’m Sunday.",
    "I’m so happy you’re here! This is our cozy room where we can learn and relax.",
    "Before we start, let’s set up your profile."
  ];

  // Typewriter for current step
  useEffect(() => {
    const text = dialogues[step] || "";
    setIsTyping(true);
    let i = 0;
    const id = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(id);
        if (step === dialogues.length - 1) {
          // open profile modal after final line
          setTimeout(() => setShowProfileModal(true), 500);
        }
      }
    }, 35);
    return () => clearInterval(id);
  }, [step]);

  const nextLine = () => {
    if (step < dialogues.length - 1) setStep(step + 1);
  };

  const handleProfileContinue = () => {
    if (!childName || !birthday) return;
    if (age !== null && age < 18 && !parentEmail) return; // require parent email
    localStorage.setItem("pending_child", JSON.stringify({ name: childName, birthday }));
    localStorage.setItem("sundayUserName", childName);
    if (age !== null && age < 18 && parentEmail) {
      localStorage.setItem("parent_prefill_email", parentEmail);
      router.push("/onboarding/parent");
      return;
    }
    // If 18 or older, skip parent and proceed to room
    router.push("/living-room");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <Image 
        src="/assets/bg/living-room.png" 
        alt="Sunday's living room" 
        fill 
        className="object-cover" 
        priority 
        unoptimized
      />

      {/* Chat bubble */}
      <div className="absolute bottom-48 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white rounded-3xl px-6 py-4 shadow-xl max-w-sm mx-4">
          <div className="relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            <div className="text-gray-800 text-lg font-medium min-h-[2rem]">
              <div className="animate-fadeIn">{displayText}{isTyping && <span className="animate-pulse">|</span>}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next button until final line */}
      {step < dialogues.length - 1 && !isTyping && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
          <button onClick={nextLine} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">Next</button>
        </div>
      )}

      {/* Profile modal */}
      {showProfileModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-emerald-900 mb-1">Welcome! Let’s set up your profile</h2>
            <p className="text-slate-600 mb-4">We’ll keep this info safe.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-emerald-900 mb-1">What should I call you?</label>
                <input value={childName} onChange={(e) => setChildName(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-emerald-900 mb-1">Birthday</label>
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
              </div>
              {age !== null && age < 18 && (
                <div>
                  <label className="block text-sm text-emerald-900 mb-1">Parent email (required)</label>
                  <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
                </div>
              )}
            </div>
            <button onClick={handleProfileContinue} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
 
