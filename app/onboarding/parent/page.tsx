"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingParent() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const introText = "Let's get your parents involved!";

  useEffect(() => {
    setIsTyping(true);
    let i = 0;
    const id = setInterval(() => {
      if (i <= introText.length) {
        setDisplayText(introText.slice(0, i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(id);
        setTimeout(() => setShowForm(true), 500);
      }
    }, 35);
    return () => clearInterval(id);
  }, []);

  // Prefill email if stored
  useEffect(() => {
    const prefill = localStorage.getItem("parent_prefill_email");
    if (prefill) {
      setEmail(prefill);
      localStorage.removeItem("parent_prefill_email");
    }
  }, []);

  const insertChildIfPending = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const raw = localStorage.getItem("pending_child");
      if (!raw) return;
      const pending = JSON.parse(raw);
      const parentId = user.id;
      const { data, error } = await supabase.from("children").insert({
        parent_id: parentId,
        name: pending.name,
        birthday: pending.birthday,
      }).select('id').single();
      if (!error && data) {
        // Store child_id for notifications
        localStorage.setItem("sunday_child_id", data.id);
        localStorage.removeItem("pending_child");
      }
    } catch {}
  };

  const handleSignup = async () => {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding/verify` }
    });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Check your email to verify your account. Then return to continue.");
  };

  const handleSignin = async () => {
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    await insertChildIfPending();
    r.push("/living-room");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Living room background */}
      <Image 
        src="/assets/bg/living-room.png" 
        alt="Sunday's living room" 
        fill 
        className="object-cover" 
        priority 
        unoptimized
      />

      {/* Chat bubble (replaced by form when ready) */}
      {!showForm && (
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
      )}

      {/* Parent account form */}
      {showForm && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-emerald-200 w-full max-w-md p-6 mx-4">
            <h1 className="text-2xl font-bold text-emerald-900 mb-1">Parent Account</h1>
            <p className="text-slate-600 mb-4">Sign {mode === 'signup' ? 'up' : 'in'} to manage your child's profile.</p>

            <div className="space-y-3">
              <input placeholder="Parent email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
              <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
            </div>

            {message && <div className="mt-3 text-sm text-rose-600">{message}</div>}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button disabled={loading} onClick={handleSignup} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg">Sign Up</button>
              <button disabled={loading} onClick={handleSignin} className="border border-emerald-300 text-emerald-900 hover:bg-emerald-50 disabled:opacity-60 font-semibold px-4 py-2 rounded-lg">Sign In</button>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              {mode === 'signup' ? (
                <button onClick={() => setMode('signin')} className="underline">Have an account? Sign in</button>
              ) : (
                <button onClick={() => setMode('signup')} className="underline">Need an account? Sign up</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


