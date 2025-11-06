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

  useEffect(() => {
    if (!open) return;
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

  const handleUnlock = () => {
    setShowDashboard(true);
  };

  const handleCloseAll = () => {
    setShowDashboard(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      {!showDashboard && isParent === true && (
        <ParentLockModal onSuccess={handleUnlock} onClose={handleCloseAll} />
      )}
      {!showDashboard && isParent === false && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 w-full max-w-sm p-6 relative">
            <p className="text-slate-700">Please sign in as a parent first.</p>
            <button onClick={handleCloseAll} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
      {showDashboard && (
        <ParentDashboard onBack={handleCloseAll} />
      )}
    </div>
  );
}


