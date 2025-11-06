"use client";
import { useState } from "react";

export default function CreatePINModal({ onCreated, onClose }) {
  const [digits, setDigits] = useState([]);
  const [error, setError] = useState("");

  const pushDigit = (d) => {
    if (digits.length >= 4) return;
    setDigits([...digits, d]);
    setError("");
  };
  const backspace = () => {
    setDigits(digits.slice(0, -1));
  };
  const confirm = () => {
    if (digits.length !== 4) return;
    const pinValue = digits.join("");
    try {
      localStorage.setItem("parent_pin", pinValue);
      onCreated();
    } catch (e) {
      setError("Unable to save PIN");
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-sm p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700">×</button>
        <h2 className="text-2xl font-bold text-emerald-900 mb-1">Create Parent PIN</h2>
        <p className="text-slate-600 mb-4">Choose a 4-digit PIN to access Parent Mode</p>

        <div className="flex justify-center gap-3 mb-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < digits.length ? 'bg-emerald-600' : 'bg-emerald-200'}`} />
          ))}
        </div>

        {error && <div className="text-rose-600 text-sm mb-2">{error}</div>}

        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => pushDigit(n)} className="py-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold">{n}</button>
          ))}
          <button onClick={backspace} className="py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">⌫</button>
          <button onClick={() => pushDigit(0)} className="py-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold">0</button>
          <button onClick={confirm} disabled={digits.length !== 4} className={`py-3 rounded-lg font-semibold ${digits.length === 4 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-400 cursor-not-allowed'}`}>Confirm</button>
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}



