"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ParentLockModal from "./ParentLockModal";
import ParentDashboard from "./ParentDashboard";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ParentAccessManager({ open, onClose }: Props) {
  const [isParent, setIsParent] = useState<boolean | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when closed
      setJustSignedIn(false);
      return;
    }
    const check = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        setIsParent(!!user && !error);
      } catch (error) {
        // Silently handle network errors
        setIsParent(false);
      }
    };
    check();
  }, [open]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setLoading(false);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      if (!data?.user) {
        setError("Sign in failed. Please try again.");
        return;
      }
      
      // Successfully signed in, go directly to dashboard (skip password verification)
      setIsParent(true);
      setJustSignedIn(true);
      setShowDashboard(true);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setLoading(false);
      console.error("Sign in error:", err);
      // Handle network errors (Failed to fetch)
      if (err?.message?.includes("Failed to fetch") || err?.name === "TypeError" || err?.message?.includes("fetch")) {
        setError("Unable to connect to authentication service. Please check your internet connection and ensure Supabase is properly configured.");
      } else {
        setError(err?.message || "An error occurred. Please try again.");
      }
    }
  };

  const handleUnlock = () => {
    setShowDashboard(true);
  };

  const handleCloseAll = () => {
    setShowDashboard(false);
    setJustSignedIn(false);
    setEmail("");
    setPassword("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      {!showDashboard && isParent === true && !justSignedIn && (
        <ParentLockModal onSuccess={handleUnlock} onClose={handleCloseAll} />
      )}
      {!showDashboard && isParent === false && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-sm p-6 relative">
            <button onClick={handleCloseAll} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700">×</button>
            <h2 className="text-2xl font-bold text-emerald-900 mb-1">Parent Sign In</h2>
            <p className="text-slate-600 mb-4">Please sign in to access parent settings.</p>
            
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Parent email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full border border-emerald-300 rounded-lg px-3 py-2"
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                className="w-full border border-emerald-300 rounded-lg px-3 py-2"
              />
            </div>
            
            {error && <div className="mt-3 text-sm text-rose-600 text-center">{error}</div>}

            <button
              onClick={handleSignIn}
              disabled={loading || !email || !password}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      )}
      {showDashboard && (
        <ParentDashboard onBack={handleCloseAll} />
      )}
    </div>
  );
}


