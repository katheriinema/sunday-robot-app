"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyReturn() {
  const r = useRouter();
  const [status, setStatus] = useState("Checking session...");

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("No session found. Please sign in.");
        return;
      }
      try {
        const raw = localStorage.getItem("pending_child");
        if (raw) {
          const pending = JSON.parse(raw);
          const { data, error } = await supabase.from("children").insert({
            parent_id: user.id,
            name: pending.name,
            birthday: pending.birthday,
          }).select('id').single();
          if (!error && data) {
            // Store child_id for notifications
            localStorage.setItem("sunday_child_id", data.id);
            localStorage.removeItem("pending_child");
          }
        }
      } catch {}
      setStatus("All set! Redirecting...");
      setTimeout(() => r.push("/living-room"), 700);
    };
    run();
  }, [r]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow border border-emerald-200 p-6 w-full max-w-md text-center">
        <div className="text-emerald-900 font-semibold">{status}</div>
      </div>
    </div>
  );
}


