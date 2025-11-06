"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Task = {
  id: string;
  title: string;
  time: string;
  date: string | null;
  recurrent: boolean;
  details: string | null;
  remind: boolean;
};

export default function TaskNotification() {
  const [notification, setNotification] = useState<Task | null>(null);
  const [dismissedTasks, setDismissedTasks] = useState<Set<string>>(new Set());
  const [childName, setChildName] = useState("");

  // Get child name from localStorage (set during onboarding)
  useEffect(() => {
    const name = localStorage.getItem("sundayUserName");
    if (name) setChildName(name);
  }, []);

  // Convert 24-hour time to 12-hour format for comparison
  const formatTime12h = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check for tasks that need notification
  useEffect(() => {
    const checkTasks = async () => {
      try {
        let childId: string | null = null;

        // Try to get child_id from localStorage first (stored during onboarding)
        const storedChildId = localStorage.getItem("sunday_child_id");
        if (storedChildId) {
          childId = storedChildId;
        } else {
          // Fallback: Get child ID from parent's account
          const { data: { user }, error: authError1 } = await supabase.auth.getUser();
          if (!user || authError1) return;

          // Get first child for this parent
          const { data: childData } = await supabase
            .from('children')
            .select('id, name')
            .eq('parent_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (!childData?.id) return;
          childId = childData.id;
          if (childData.name) setChildName(childData.name);
          // Store for next time
          localStorage.setItem("sunday_child_id", childId);
        }

        // Get today's date
        const today = new Date().toISOString().slice(0, 10);

        // Try to get parent_id for RLS (parent session may still be active)
        const { data: { user }, error: authError2 } = await supabase.auth.getUser();
        
        if (!user || authError2) return; // Need parent session for RLS to work

        // Fetch tasks for this parent (RLS will filter)
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_id', user.id)
          .eq('remind', true)
          .or(`date.eq."${today}",recurrent.eq.true`);

        if (error || !tasks || tasks.length === 0) return;

        // Filter to only show tasks for this child (if child_id is set)
        // or tasks with no specific child (null child_id)
        const filteredTasks = childId 
          ? tasks.filter(t => !t.child_id || t.child_id === childId)
          : tasks;

        if (filteredTasks.length === 0) return;

        // Get current time (HH:MM format)
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        // Check each task
        for (const task of filteredTasks) {
          // Skip if already dismissed
          if (dismissedTasks.has(task.id)) continue;

          // Check if task time matches current time (within 1 minute window)
          const [taskHour, taskMinute] = task.time.split(':').map(Number);
          if (taskHour === currentHour && taskMinute === currentMinute) {
            // Show notification - stays until kid marks it done
            setNotification(task);
            break; // Only show one at a time
          }
        }
      } catch (err) {
        console.error("Error checking tasks:", err);
      }
    };

    // Check every minute
    const interval = setInterval(checkTasks, 60000);
    checkTasks(); // Initial check

    return () => clearInterval(interval);
  }, [dismissedTasks]);

  const handleMarkDone = async () => {
    if (!notification) return;
    
    try {
      // Mark task as done by updating it (you could add a "completed" field later)
      // For now, we'll just dismiss it after marking
      const { error } = await supabase
        .from('tasks')
        .update({ remind: false }) // Disable reminder after completion
        .eq('id', notification.id);
      
      if (!error) {
        setDismissedTasks(prev => new Set([...prev, notification.id]));
        setNotification(null);
      }
    } catch (err) {
      // If update fails, just dismiss locally
      setDismissedTasks(prev => new Set([...prev, notification.id]));
      setNotification(null);
    }
  };

  if (!notification) return null;

  const displayTime = formatTime12h(notification.time);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg mx-4 mt-4 rounded-xl p-4 max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="font-semibold text-lg mb-1">
              ⏰ Time for {notification.title}!
            </div>
            <div className="text-emerald-50 text-sm font-normal">
              {displayTime} • {notification.recurrent ? "Daily" : "Today"}
            </div>
            {notification.details && (
              <div className="text-emerald-100 text-sm mt-2 font-normal">{notification.details}</div>
            )}
          </div>
          <button
            onClick={handleMarkDone}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0 transition-colors"
            aria-label="Mark as done"
          >
            ✓ Done
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
