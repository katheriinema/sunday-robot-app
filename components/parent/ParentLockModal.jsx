"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParentLockModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError(false);
    
    try {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError(true);
        setLoading(false);
        return;
      }
      
      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      
      setLoading(false);
      
      if (signInError) {
        setError(true);
        setPassword("");
        setTimeout(() => setError(false), 2000);
      } else {
        onSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-sm p-6 relative animate-fadeIn ${error ? 'animate-shake' : ''}`}>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700">×</button>
        <h2 className="text-2xl font-bold text-emerald-900 mb-1">Parent Access</h2>
        <p className="text-slate-600 mb-4">Enter your password</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Password"
          className="w-full border border-emerald-300 rounded-lg px-3 py-2 mb-3"
          autoFocus
        />
        
        {error && <div className="text-rose-600 text-sm mb-2 text-center">Incorrect password</div>}

        <button
          onClick={handleSubmit}
          disabled={!password || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
        >
          {loading ? "Verifying..." : "Confirm"}
        </button>
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-shake { animation: shake 0.3s ease; }
        @keyframes shake { 0%{ transform: translateX(0);} 25%{ transform: translateX(-6px);} 50%{ transform: translateX(6px);} 75%{ transform: translateX(-6px);} 100%{ transform: translateX(0);} }
      `}</style>
    </div>
  );
}


