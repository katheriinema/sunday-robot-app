"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import GlobalNavigation from "@/components/GlobalNavigation";

type Mood = 1 | 2 | 3 | 4; // 1=sad, 4=very happy

type Sticker = {
  id: string;
  x: number;
  y: number;
  emoji: string;
};

type ImageItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
};

type Entry = {
  mood: Mood | null;
  title: string;
  feelingsHtml: string;
  gratitudeHtml: string;
  images: ImageItem[]; // draggable positioned images
  stickers: Sticker[];
};

const DEFAULT_ENTRY: Entry = {
  mood: null,
  title: "",
  feelingsHtml: "",
  gratitudeHtml: "",
  images: [],
  stickers: [],
};

async function loadEntry(dateStr: string): Promise<Entry> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      const raw = localStorage.getItem(`sundayDiary:${dateStr}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Migrate old images without width/height
          if (parsed.images && Array.isArray(parsed.images)) {
            parsed.images = parsed.images.map((img: any) => {
              if (!img.width || !img.height) {
                return { ...img, width: 200, height: 200 };
              }
              return img;
            });
          }
          // Ensure title field exists
          if (!parsed.title) {
            parsed.title = "";
          }
          if (parsed.contentHtml && (!parsed.feelingsHtml && !parsed.gratitudeHtml)) {
            return { ...DEFAULT_ENTRY, ...parsed, feelingsHtml: parsed.contentHtml, gratitudeHtml: "" } as Entry;
          }
          return parsed as Entry;
        }
      }
      return { ...DEFAULT_ENTRY };
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
      const raw = localStorage.getItem(`sundayDiary:${dateStr}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed as Entry;
        }
      }
      return { ...DEFAULT_ENTRY };
    }

    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('child_id', childData.id)
      .eq('date', dateStr)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error loading diary entry:", error);
    }

    if (data) {
      // Map database columns to Entry format
      const images = (data.images as any) || [];
      // Migrate old images without width/height to have default dimensions
      const migratedImages = images.map((img: any) => {
        if (!img.width || !img.height) {
          return { ...img, width: 200, height: 200 };
        }
        return img;
      });
      
      // Try to get title from entry_data JSONB or from a separate title field
      let title = "";
      if (data.title) {
        title = data.title;
      } else if (data.entry_data && typeof data.entry_data === 'object' && (data.entry_data as any).title) {
        title = (data.entry_data as any).title;
      }
      
      return {
        mood: data.mood ?? null,
        title: title || "",
        feelingsHtml: data.feelings_html || "",
        gratitudeHtml: data.gratitude_html || "",
        images: migratedImages,
        stickers: (data.stickers as any) || [],
      };
    }

    // Try localStorage as fallback
    const raw = localStorage.getItem(`sundayDiary:${dateStr}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Migrate old images without width/height
        if (parsed.images && Array.isArray(parsed.images)) {
          parsed.images = parsed.images.map((img: any) => {
            if (!img.width || !img.height) {
              return { ...img, width: 200, height: 200 };
            }
            return img;
          });
        }
        // Ensure title field exists
        if (!parsed.title) {
          parsed.title = "";
        }
        return parsed as Entry;
      }
    }
  } catch (error) {
    console.error("Error loading entry:", error);
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`sundayDiary:${dateStr}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Migrate old images without width/height
          if (parsed.images && Array.isArray(parsed.images)) {
            parsed.images = parsed.images.map((img: any) => {
              if (!img.width || !img.height) {
                return { ...img, width: 200, height: 200 };
              }
              return img;
            });
          }
          // Ensure title field exists
          if (!parsed.title) {
            parsed.title = "";
          }
          return parsed as Entry;
        }
      }
    } catch {}
  }
  return { ...DEFAULT_ENTRY };
}

async function saveEntry(dateStr: string, entry: Entry): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage if not authenticated
      try {
        localStorage.setItem(`sundayDiary:${dateStr}`, JSON.stringify(entry));
        return true;
      } catch {
        return false;
      }
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
      // No child found, save to localStorage only
      try {
        localStorage.setItem(`sundayDiary:${dateStr}`, JSON.stringify(entry));
        return true;
      } catch {
        return false;
      }
    }

    // First try to update existing entry
    const { data: existing } = await supabase
      .from('diary_entries')
      .select('id')
      .eq('child_id', childData.id)
      .eq('date', dateStr)
      .maybeSingle();

    try {
      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update({
            mood: entry.mood,
            title: entry.title || null,
            feelings_html: entry.feelingsHtml,
            gratitude_html: entry.gratitudeHtml,
            images: entry.images,
            stickers: entry.stickers,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('diary_entries')
          .insert({
            child_id: childData.id,
            date: dateStr,
            mood: entry.mood,
            title: entry.title || null,
            feelings_html: entry.feelingsHtml,
            gratitude_html: entry.gratitudeHtml,
            images: entry.images,
            stickers: entry.stickers,
          });
        
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error saving diary entry:", error);
      // Fallback to localStorage on error
      try {
        localStorage.setItem(`sundayDiary:${dateStr}`, JSON.stringify(entry));
      } catch {}
      return false;
    }

    // Also save to localStorage as backup
    try {
      localStorage.setItem(`sundayDiary:${dateStr}`, JSON.stringify(entry));
    } catch {}

    return true;
  } catch (error) {
    console.error("Error saving entry:", error);
    // Fallback to localStorage
    try {
      localStorage.setItem(`sundayDiary:${dateStr}`, JSON.stringify(entry));
      return true;
    } catch {
      return false;
    }
  }
}

export default function SundayDiary() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const searchParams = useSearchParams();
  const initialDate = searchParams?.get("date") || todayStr;
  const [dateStr, setDateStr] = useState<string>(initialDate);
  const [entry, setEntry] = useState<Entry>(DEFAULT_ENTRY);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; kind: "sticker" | "image"; offsetX: number; offsetY: number; isResizing?: boolean; startWidth?: number; startHeight?: number; startX?: number; startY?: number } | null>(null);
  const feelingsRef = useRef<HTMLDivElement>(null);
  const gratitudeRef = useRef<HTMLDivElement>(null);

  // Load when date changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadEntry(dateStr).then((loaded) => {
      if (!cancelled) {
        setEntry(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [dateStr]);

  // After entry loads, populate the editors once (do not overwrite while typing)
  useEffect(() => {
    if (feelingsRef.current && feelingsRef.current.innerHTML !== entry.feelingsHtml) {
      feelingsRef.current.innerHTML = entry.feelingsHtml || "";
    }
    if (gratitudeRef.current && gratitudeRef.current.innerHTML !== entry.gratitudeHtml) {
      gratitudeRef.current.innerHTML = entry.gratitudeHtml || "";
    }
  }, [entry.feelingsHtml, entry.gratitudeHtml, dateStr]);

  // React to URL param changes (navigating between entries)
  useEffect(() => {
    const paramDate = searchParams?.get("date");
    if (paramDate && paramDate !== dateStr) {
      setDateStr(paramDate);
    }
    if (!paramDate && dateStr !== todayStr) {
      // if param removed, default to today without losing state
      // no-op: keep current date unless user changes via picker
    }
  }, [searchParams, dateStr, todayStr]);

  // Auto-save on change (silent, debounced)
  useEffect(() => {
    if (loading) return; // Don't auto-save while loading
    const timer = setTimeout(() => {
      saveEntry(dateStr, entry).catch(err => {
        console.error("Auto-save error:", err);
      });
    }, 1000); // Debounce by 1 second
    return () => clearTimeout(timer);
  }, [dateStr, entry, loading]);

  const saveNow = async () => {
    // Ensure we save the latest editor HTML from the DOM
    const latestFeelings = feelingsRef.current?.innerHTML ?? entry.feelingsHtml;
    const latestGratitude = gratitudeRef.current?.innerHTML ?? entry.gratitudeHtml;
    const toSave = { ...entry, feelingsHtml: latestFeelings, gratitudeHtml: latestGratitude };
    setSaving(true);
    const success = await saveEntry(dateStr, toSave);
    if (success) {
      setEntry(toSave);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 1500);
    } else {
      alert("Failed to save entry. It has been saved locally as backup.");
    }
    setSaving(false);
  };

  const addSticker = (emoji: string) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = rect ? rect.width / 2 - 20 : 100;
    const y = rect ? rect.height / 2 - 20 : 100;
    const s: Sticker = { id: `${Date.now()}-${Math.random()}`, x, y, emoji };
    setEntry((e) => ({ ...e, stickers: [...e.stickers, s] }));
  };

  const onStickerMouseDown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sticker = entry.stickers.find((s) => s.id === id);
    if (!sticker) return;
    const offsetX = e.clientX - (rect.left + sticker.x);
    const offsetY = e.clientY - (rect.top + sticker.y);
    dragRef.current = { id, kind: "sticker", offsetX, offsetY };
  };

  const onImageMouseDown = (id: string, e: React.MouseEvent, isResizeHandle: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const img = entry.images.find((s) => s.id === id);
    if (!img) return;
    
    if (isResizeHandle) {
      // Starting resize
      const offsetX = e.clientX - (rect.left + img.x + img.width);
      const offsetY = e.clientY - (rect.top + img.y + img.height);
      dragRef.current = { 
        id, 
        kind: "image", 
        offsetX, 
        offsetY,
        isResizing: true,
        startWidth: img.width,
        startHeight: img.height,
        startX: img.x,
        startY: img.y
      };
    } else {
      // Starting drag
      const offsetX = e.clientX - (rect.left + img.x);
      const offsetY = e.clientY - (rect.top + img.y);
      dragRef.current = { id, kind: "image", offsetX, offsetY, isResizing: false };
    }
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { id, kind, offsetX, offsetY, isResizing, startWidth, startHeight, startX, startY } = dragRef.current;
    
    if (kind === "sticker") {
      const x = Math.max(0, Math.min(rect.width - 40, e.clientX - rect.left - offsetX));
      const y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - offsetY));
      setEntry((prev) => ({
        ...prev,
        stickers: prev.stickers.map((s) => (s.id === id ? { ...s, x, y } : s)),
      }));
    } else if (kind === "image") {
      const img = entry.images.find((i) => i.id === id);
      if (!img) return;
      
      if (isResizing && startWidth && startHeight && startX !== undefined && startY !== undefined) {
        // Resizing - maintain aspect ratio
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const deltaX = mouseX - (startX + startWidth);
        const deltaY = mouseY - (startY + startHeight);
        
        // Use the larger change to maintain aspect ratio
        const aspectRatio = startWidth / startHeight;
        let newWidth = startWidth + deltaX;
        let newHeight = startHeight + deltaY;
        
        // Maintain aspect ratio based on which dimension changed more
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
        
        // Minimum size constraints
        const minSize = 50;
        if (newWidth < minSize) {
          newWidth = minSize;
          newHeight = minSize / aspectRatio;
        }
        if (newHeight < minSize) {
          newHeight = minSize;
          newWidth = minSize * aspectRatio;
        }
        
        // Maximum size constraints
        const maxSize = 800;
        if (newWidth > maxSize) {
          newWidth = maxSize;
          newHeight = maxSize / aspectRatio;
        }
        if (newHeight > maxSize) {
          newHeight = maxSize;
          newWidth = maxSize * aspectRatio;
        }
        
        // Ensure image stays within canvas bounds
        if (startX + newWidth > rect.width) {
          newWidth = rect.width - startX;
          newHeight = newWidth / aspectRatio;
        }
        if (startY + newHeight > rect.height) {
          newHeight = rect.height - startY;
          newWidth = newHeight * aspectRatio;
        }
        
        setEntry((prev) => ({
          ...prev,
          images: prev.images.map((img) => (img.id === id ? { ...img, width: newWidth, height: newHeight } : img)),
        }));
      } else {
        // Dragging
        const x = Math.max(0, Math.min(rect.width - img.width, e.clientX - rect.left - offsetX));
        const y = Math.max(0, Math.min(rect.height - img.height, e.clientY - rect.top - offsetY));
        setEntry((prev) => ({
          ...prev,
          images: prev.images.map((img) => (img.id === id ? { ...img, x, y } : img)),
        }));
      }
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const arr = Array.from(files).slice(0, 6);
    const newItems: ImageItem[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(f);
      });
      
      // Get actual image dimensions
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const rect = canvasRef.current?.getBoundingClientRect();
          const baseX = rect ? rect.width / 2 - 100 : 80;
          const baseY = rect ? rect.height / 2 - 100 : 80;
          
          // Use actual dimensions, but limit max size to 400px
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > maxSize || height > maxSize) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxSize;
              height = maxSize / aspectRatio;
            } else {
              height = maxSize;
              width = maxSize * aspectRatio;
            }
          }
          
          newItems.push({
            id: `${Date.now()}-${Math.random()}-${i}`,
            x: baseX + i * 20,
            y: baseY + i * 20,
            width,
            height,
            src: url,
          });
          resolve();
        };
        img.src = url;
      });
    }
    
    setEntry((e) => ({ ...e, images: [...e.images, ...newItems].slice(0, 18) }));
  };

  const moodFace = (value: Mood, label: string) => (
    <button
      key={value}
      onClick={() => setEntry((e) => ({ ...e, mood: value }))}
      className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl transition-all ${
        entry.mood === value ? "border-amber-500 bg-amber-100 scale-105" : "border-transparent bg-white/80"
      }`}
      aria-label={label}
    >
      {value === 1 ? "😞" : value === 2 ? "😐" : value === 3 ? "😊" : "🤩"}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <GlobalNavigation />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-emerald-900">Sunday Diary</h1>
            <span className="text-slate-500">Notebook</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-emerald-900 font-medium">Date</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="border border-emerald-300 rounded-lg px-3 py-2 bg-white text-slate-800"
            />
            <a href="/books/diary/entries" className="border border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-lg">
              My Entries
            </a>
            <button 
              onClick={saveNow} 
              disabled={saving || loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-lg"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {savedAt && <span className="text-emerald-700 text-sm">Saved</span>}
            {loading && <span className="text-slate-500 text-sm">Loading...</span>}
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl shadow border border-emerald-200 p-4 mb-6">
          <label className="block text-emerald-900 font-semibold mb-2">Entry Title</label>
          <input
            type="text"
            value={entry.title}
            onChange={(e) => setEntry((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Add a title for this entry..."
            className="w-full border border-emerald-300 rounded-lg px-3 py-2 bg-white text-slate-800"
          />
        </div>

        {/* Mood */}
        <div className="bg-white rounded-xl shadow border border-emerald-200 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-emerald-900 font-semibold">How do you feel today?</div>
            <div className="flex gap-3">
              {moodFace(1, "Sad")}
              {moodFace(2, "Okay")}
              {moodFace(3, "Happy")}
              {moodFace(4, "Super Happy")}
            </div>
          </div>
        </div>

        {/* Notebook Canvas */}
        <div
          ref={canvasRef}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="relative bg-white rounded-xl shadow border border-emerald-300 p-0 min-h-[520px] overflow-hidden"
        >
          {/* Lined paper background */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(16,185,129,0.12) 0, rgba(16,185,129,0.12) 1px, transparent 1px, transparent 28px)" }} />

          {/* Fixed prompts + editable sections */}
          <div className="relative p-6 space-y-8">
            <div>
              <div className="text-emerald-900 font-semibold select-none">Why do I feel this way?</div>
              <div
                ref={feelingsRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {/* content kept in DOM, saved explicitly */}}
                className="mt-2 outline-none text-slate-800"
                style={{ minHeight: 100 }}
              />
            </div>
            <div>
              <div className="text-emerald-900 font-semibold select-none">Three things I’m grateful for</div>
              <div
                ref={gratitudeRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {/* content kept in DOM, saved explicitly */}}
                className="mt-2 outline-none text-slate-800"
                style={{ minHeight: 100 }}
              />
            </div>
          </div>

          {/* Draggable Images */}
          {entry.images.map((img) => (
            <div
              key={img.id}
              className="absolute cursor-move select-none group"
              style={{ 
                left: img.x, 
                top: img.y, 
                width: img.width, 
                height: img.height,
                zIndex: 20 
              }}
              onMouseDown={(e) => {
                // Only start drag if not clicking on resize handle
                const target = e.target as HTMLElement;
                if (!target.classList.contains('resize-handle')) {
                  onImageMouseDown(img.id, e, false);
                }
              }}
            >
              <img 
                src={img.src} 
                alt="diary" 
                className="w-full h-full object-contain rounded-lg pointer-events-none" 
                style={{ width: img.width, height: img.height }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setEntry((v) => ({ ...v, images: v.images.filter((i) => i.id !== img.id) })); }}
                className="absolute -top-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-7 h-7 shadow hidden group-hover:flex items-center justify-center z-30"
                aria-label="Remove image"
              >
                ×
              </button>
              {/* Resize handle */}
              <div
                className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 hover:bg-emerald-600 rounded-tl-lg cursor-nwse-resize group-hover:opacity-100 opacity-70 transition-opacity"
                onMouseDown={(e) => onImageMouseDown(img.id, e, true)}
                style={{ cursor: 'nwse-resize' }}
              >
                <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 14l-4-4h8l-4 4z" />
                </svg>
              </div>
            </div>
          ))}

          {/* Draggable Stickers */}
          {entry.stickers.map((s) => (
            <div
              key={s.id}
              className="absolute w-10 h-10 cursor-grab active:cursor-grabbing select-none"
              style={{ left: s.x, top: s.y, zIndex: 30 }}
              onMouseDown={(e) => onStickerMouseDown(s.id, e)}
            >
              <div className="w-10 h-10 flex items-center justify-center text-2xl bg-white/80 rounded-lg">
                {s.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow border border-emerald-200 p-4">
            <div className="text-sm font-semibold text-emerald-900 mb-2">Add photos</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onUpload(e.target.files)}
              className="block w-full text-sm text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200"
            />
          </div>

          <div className="bg-white rounded-xl shadow border border-emerald-200 p-4">
            <div className="text-sm font-semibold text-emerald-900 mb-2">Stickers</div>
            <div className="flex flex-wrap gap-2">
              {["🌟","🎈","🍀","🦄","🚀","🎨","💖","🎵","🎉","🐾"].map((e) => (
                <button
                  key={e}
                  onClick={() => addSticker(e)}
                  className="px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-300 hover:bg-emerald-200"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


