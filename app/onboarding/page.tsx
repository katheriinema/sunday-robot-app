"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const dialogues = [
    "Hey there! It's me — Sunday!",
    "I'm so happy you downloaded my app! We can play and learn together here too.",
    "Before we start, what should I call you?"
  ];

  const finalGreeting = `Nice to see you again, ${name}! Let's have some fun! Click on the bookshelf, chess table, or plant to discover things we can do together!`;

  // Typewriter effect
  useEffect(() => {
    if (step < dialogues.length) {
      setIsTyping(true);
      const currentDialogue = dialogues[step];
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index <= currentDialogue.length) {
          setDisplayText(currentDialogue.slice(0, index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
          
          // Show input field after third dialogue
          if (step === 2) {
            setTimeout(() => setShowInput(true), 500);
          }
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [step]);

  // Handle final greeting
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        // Store name and completion status in localStorage
        localStorage.setItem("sundayUserName", name);
        localStorage.setItem("sundayOnboardingCompleted", "true");
        // Redirect to home
        router.push("/living-room");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, name, router]);

  const handleNext = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    }
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      setIsCompleted(true);
      setShowInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen background */}
      <Image 
        src="/assets/bg/living-room.png" 
        alt="Sunday's cozy living room" 
        fill 
        className="object-cover" 
        priority 
        unoptimized
      />
      
      {/* Sunday Robot */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`sunday-avatar ${isCompleted ? 'sunday-happy' : 'sunday-idle'}`}>
          <Image 
            src={isCompleted ? "/assets/sunday_happy.png" : "/assets/sunday_idle.png"}
            alt="Sunday Robot"
            width={200}
            height={200}
            className="drop-shadow-lg"
            unoptimized
          />
        </div>
      </div>

      {/* Chat Bubble */}
      <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 z-20">
        <div className="chat-bubble bg-white rounded-3xl px-6 py-4 shadow-xl max-w-sm mx-4">
          <div className="relative">
            {/* Chat bubble tail */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            
            {/* Text content */}
            <div className="text-gray-800 text-lg font-medium min-h-[2rem]">
              {isCompleted ? (
                <div className="text-center">
                  <div className="animate-fadeIn">{finalGreeting}</div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  {displayText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Name Input Field */}
      {showInput && !isCompleted && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30 animate-fadeIn">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name..."
              className="text-lg font-medium text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent w-64 text-center"
              autoFocus
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Button (for dialogue steps) */}
      {step < dialogues.length - 1 && !showInput && !isTyping && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={handleNext}
            className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg animate-fadeIn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
