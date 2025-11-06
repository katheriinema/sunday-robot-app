"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import GlobalNavigation from "@/components/GlobalNavigation";

type EntryIndex = { date: string; title: string | null; mood: number | null };

async function getAllDiaryDates(): Promise<EntryIndex[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      return getAllDiaryDatesFromLocalStorage();
    }

    // Get child_id for this parent
    const { data: childData } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!childData?.id) {
      // No child found, try localStorage
      return getAllDiaryDatesFromLocalStorage();
    }

    const { data, error } = await supabase
      .from('diary_entries')
      .select('date, mood, title')
      .eq('child_id', childData.id)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error loading diary entries:", error);
      // Fallback to localStorage
      return getAllDiaryDatesFromLocalStorage();
    }

    if (data && data.length > 0) {
      return data.map((row) => {
        return {
          date: row.date,
          title: row.title || null,
          mood: row.mood ?? null,
        };
      });
    }

    // If no entries in Supabase, try localStorage
    return getAllDiaryDatesFromLocalStorage();
  } catch (error) {
    console.error("Error loading entries:", error);
    return getAllDiaryDatesFromLocalStorage();
  }
}

function getAllDiaryDatesFromLocalStorage(): EntryIndex[] {
  const items: EntryIndex[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || "";
      if (key.startsWith("sundayDiary:")) {
        const date = key.split(":")[1];
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        items.push({
          date,
          title: parsed?.title || null,
          mood: parsed?.mood ?? null,
        });
      }
    }
  } catch {}
  return items.sort((a, b) => a.date.localeCompare(b.date)).reverse();
}

export default function DiaryEntries() {
  const [entries, setEntries] = useState<EntryIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDiaryDates().then((loadedEntries) => {
      setEntries(loadedEntries);
      setLoading(false);
    });
  }, []);

  const moodEmoji = (m: number | null) => (m === 1 ? "😞" : m === 2 ? "😐" : m === 3 ? "😊" : m === 4 ? "🤩" : "");

  // Format date helper
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate().toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
      <GlobalNavigation />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Diary Entries
            </h1>
            <p className="text-slate-600">Your memories and thoughts</p>
          </div>
          <div className="flex gap-2">
            <a href="/books/diary" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              ✨ New Entry
            </a>
            <a href="/books" className="border-2 border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-semibold px-6 py-3 rounded-xl transition-all">
              📚 Back to Shelf
            </a>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-8 text-center text-slate-600 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📔</div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">No entries yet</h2>
            <p className="text-slate-600 mb-6">Create your first diary entry to get started!</p>
            <a href="/books/diary" className="inline-block bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Create First Entry
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e, index) => {
              const formattedDate = formatDate(e.date);
              return (
                <Link key={e.date} href={`/books/diary?date=${e.date}`} className="block group">
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                        {moodEmoji(e.mood)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-emerald-900 text-xl group-hover:text-emerald-700 transition-colors">
                          {e.title ? `${formattedDate} - ${e.title}` : formattedDate}
                        </div>
                        {e.title && (
                          <div className="text-sm text-slate-500 mt-1">{formattedDate}</div>
                        )}
                      </div>
                      <div className="text-emerald-400 group-hover:text-emerald-600 transition-colors transform group-hover:translate-x-1">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



