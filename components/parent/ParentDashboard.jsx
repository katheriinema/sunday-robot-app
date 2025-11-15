"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParentDashboard({ onBack }) {
  const [robotSettings, setRobotSettings] = useState({
    speaking: true,
    mode: "Playful",
  });
  const [tasks, setTasks] = useState([]); // {id, name, time, date, remind, details}
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskRemind, setNewTaskRemind] = useState(true);
  const [newTaskDetails, setNewTaskDetails] = useState("");
  const [newTaskRecurrent, setNewTaskRecurrent] = useState(false);

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(() => today.toISOString().slice(0,10));

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [childId, setChildId] = useState(null);
  const [childName, setChildName] = useState("");
  const [showWeekView, setShowWeekView] = useState(false);
  const [showDailyView, setShowDailyView] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday
    const sunday = new Date(d.getFullYear(), d.getMonth(), diff);
    return sunday.toISOString().slice(0, 10);
  });

  // Fetch default child (first child) for current parent
  useEffect(() => {
    const loadChild = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!user || error) return;
        const { data } = await supabase
          .from('children')
          .select('id, name')
          .eq('parent_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (data?.id) {
          setChildId(data.id);
          setChildName(data.name || "");
        }
      } catch (error) {
        // Silently handle network errors
      }
    };
    loadChild();
  }, []);

  // Get 7 days (Sun-Sat) for week view
  const getWeekDays = useMemo(() => {
    if (!weekStartDate) return [];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, [weekStartDate]);

  // Load tasks for selected date (including recurrent tasks)
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
          setLoadingTasks(false);
          return;
        }
        setLoadingTasks(true);
        
        if (showWeekView) {
          // Load all tasks for the parent (including recurrent)
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', user.id)
            .order('time', { ascending: true });
          setLoadingTasks(false);
          if (!error && data) setTasks(data);
        } else if (showDailyView) {
          // Fetch tasks for selected date OR recurrent tasks
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', user.id)
            .or(`date.eq."${selectedDate}",recurrent.eq.true`)
            .order('time', { ascending: true });
          setLoadingTasks(false);
          if (!error && data) setTasks(data);
        } else {
          // Month view: Load all tasks (including recurrent) so calendar can show accurate counts for all days
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('parent_id', user.id)
            .order('time', { ascending: true });
          setLoadingTasks(false);
          if (!error && data) setTasks(data);
        }
      } catch (error) {
        // Silently handle network errors
        setLoadingTasks(false);
      }
    };
    loadTasks();
  }, [selectedDate, showWeekView, showDailyView, getWeekDays]);

  const toggle = (key) => {
    const next = { ...robotSettings, [key]: !robotSettings[key] };
    setRobotSettings(next);
    console.log("Robot settings updated:", next);
  };
  const changeMode = (m) => {
    const next = { ...robotSettings, mode: m };
    setRobotSettings(next);
    console.log("Robot settings updated:", next);
  };

  const addTask = async () => {
    if (!newTaskName || !newTaskTime) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Build insert object, excluding undefined/null values that shouldn't be sent
    // For recurrent tasks, use a placeholder date since the database requires date to be non-null
    // The recurrent flag will indicate it should appear on all days
    const insert = {
      parent_id: user.id,
      title: newTaskName,
      time: newTaskTime,
      remind: newTaskRemind,
      recurrent: newTaskRecurrent,
      date: newTaskRecurrent ? '1970-01-01' : selectedDate, // Use placeholder date for recurrent tasks
    };
    
    // Only include child_id if it exists
    if (childId) {
      insert.child_id = childId;
    }
    
    // Only include details if it's not empty
    if (newTaskDetails && newTaskDetails.trim()) {
      insert.details = newTaskDetails;
    }
    
    console.log("Inserting task:", insert);
    const { data, error } = await supabase.from('tasks').insert(insert).select('*').single();
    
    if (error) {
      console.error("Error adding task:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      alert(`Failed to save task: ${error.message || 'Unknown error'}`);
      return;
    }
    
    if (data) {
      setTasks((prev) => [...prev, data]);
      setAdding(false);
      setNewTaskName("");
      setNewTaskTime("");
      setNewTaskRemind(true);
      setNewTaskDetails("");
      setNewTaskRecurrent(false);
      console.log("Task added successfully:", data);
    }
  };
  const removeTask = (id) => {
    const run = async () => {
      await supabase.from('tasks').delete().eq('id', id);
      setTasks((prev) => prev.filter(t => t.id !== id));
      console.log("Deleted task", id);
    };
    run();
  };

  const toggleRemind = (id) => {
    const run = async () => {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      const newVal = !t.remind;
      await supabase.from('tasks').update({ remind: newVal }).eq('id', id);
      setTasks((prev) => prev.map(x => x.id === id ? { ...x, remind: newVal } : x));
      console.log("Updated task remind:", id, newVal);
    };
    run();
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setNewTaskName(task.title);
    setNewTaskTime(task.time);
    setNewTaskRemind(task.remind);
    setNewTaskDetails(task.details || "");
    setNewTaskRecurrent(task.recurrent || false);
    setAdding(false);
    // Set selected date to task's date if it's not recurrent
    if (!task.recurrent && task.date && task.date !== '1970-01-01') {
      setSelectedDate(task.date);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTaskName("");
    setNewTaskTime("");
    setNewTaskRemind(true);
    setNewTaskDetails("");
    setNewTaskRecurrent(false);
  };

  const saveEdit = async () => {
    if (!editingId || !newTaskName || !newTaskTime) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const update = {
      title: newTaskName,
      details: newTaskDetails,
      time: newTaskTime,
      remind: newTaskRemind,
      recurrent: newTaskRecurrent,
      date: newTaskRecurrent ? '1970-01-01' : selectedDate, // Use placeholder date for recurrent tasks
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', editingId)
      .select('*')
      .single();
    
    if (!error && data) {
      setTasks((prev) => prev.map(t => t.id === editingId ? data : t));
      cancelEdit();
      console.log("Updated task:", editingId);
    }
  };

  // Calendar helpers
  const monthLabel = useMemo(() => new Date(currentYear, currentMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }), [currentYear, currentMonth]);
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDayIndex = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]); // 0 Sun
  const weeks = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i+7));
    return rows;
  }, [firstDayIndex, daysInMonth]);

  const isToday = (d) => {
    if (!d) return false;
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d;
  };
  const dateStringFor = (d) => new Date(currentYear, currentMonth, d).toISOString().slice(0,10);
  const tasksForDate = (dateStr) => tasks.filter(t => 
    (t.date === dateStr) || (t.recurrent && t.date === '1970-01-01')
  );
  
  // Convert 24-hour time (HH:MM) to 12-hour time (h:MM AM/PM)
  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-2xl border border-emerald-200 w-full ${showWeekView ? 'max-w-6xl' : 'max-w-2xl'} p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-emerald-900">Parent Dashboard</h2>
          <button onClick={onBack} className="border border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-semibold px-4 py-2 rounded-lg">Back</button>
        </div>

        {/* Section 1: Robot Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Robot Controls</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <input type="checkbox" checked={robotSettings.speaking} onChange={() => toggle('speaking')} />
              <span>Speaking Enabled</span>
            </label>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <label className="block text-sm text-emerald-900 mb-1">Interaction Mode</label>
              <select value={robotSettings.mode} onChange={(e) => changeMode(e.target.value)} className="w-full border border-emerald-300 rounded-lg px-3 py-2">
                <option>Playful</option>
                <option>Educational</option>
                <option>Calm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Calendar + Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-emerald-900">Tasks / Reminders</h3>
            <button onClick={() => { setShowWeekView(!showWeekView); setShowDailyView(false); }} className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">
              {showWeekView ? 'Monthly View' : 'Weekly View'}
            </button>
          </div>
          
          {!showWeekView && !showDailyView ? (
            <>
              {/* Month Calendar */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }} className="px-2 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100">←</button>
                  <div className="font-semibold text-emerald-900">{monthLabel}</div>
                  <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }} className="px-2 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100">→</button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-emerald-900 mb-1">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weeks.flatMap((row, i) =>
                    row.map((d, j) => {
                      const ds = d ? dateStringFor(d) : null;
                      const count = ds ? tasksForDate(ds).length : 0;
                      const selected = ds === selectedDate;
                      return (
                        <button key={`${i}-${j}`} disabled={!d} onClick={() => ds && setSelectedDate(ds)} className={`h-10 rounded text-sm border ${selected ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-emerald-200 hover:bg-emerald-50'} ${isToday(d) && !selected ? 'ring-2 ring-emerald-400' : ''}`}>
                          {d || ''}
                          {count > 0 && <span className={`ml-1 text-[10px] ${selected ? 'text-white' : 'text-emerald-600'}`}>({count})</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="mb-3 text-center">
                <button onClick={() => { setShowDailyView(true); setShowWeekView(false); setSelectedDate(today.toISOString().slice(0, 10)); setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); }} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">
                  Daily View
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 7-Day Week View (Google Calendar style) */}
              <div className="bg-white border border-emerald-200 rounded-lg mb-3 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border-b border-emerald-200">
                  <button onClick={() => {
                    const d = new Date(weekStartDate);
                    d.setDate(d.getDate() - 7);
                    setWeekStartDate(d.toISOString().slice(0, 10));
                  }} className="px-3 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100">← Previous</button>
                  <div className="font-semibold text-emerald-900">
                    {new Date(weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - 
                    {(() => {
                      const lastDay = new Date(weekStartDate);
                      lastDay.setDate(lastDay.getDate() + 6);
                      return lastDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    })()}
                  </div>
                  <button onClick={() => {
                    const d = new Date(weekStartDate);
                    d.setDate(d.getDate() + 7);
                    setWeekStartDate(d.toISOString().slice(0, 10));
                  }} className="px-3 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-100">Next →</button>
                </div>
                <div className="grid grid-cols-7 border-b border-emerald-200">
                  {getWeekDays.map((dateStr, idx) => {
                    const d = new Date(dateStr);
                    const isTodayDate = dateStr === today.toISOString().slice(0, 10);
                    const dayTasks = tasks.filter(t => 
                      (t.date === dateStr) || (t.recurrent && t.date === '1970-01-01')
                    );
                    return (
                      <div key={dateStr} className={`border-r border-emerald-200 last:border-r-0 ${isTodayDate ? 'bg-emerald-50' : ''}`}>
                        <div className={`text-center p-2 border-b border-emerald-200 ${isTodayDate ? 'bg-emerald-100 font-semibold' : ''}`}>
                          <div className="text-xs text-slate-500">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][idx]}</div>
                          <div className={`text-lg ${isTodayDate ? 'text-emerald-900' : 'text-slate-700'}`}>{d.getDate()}</div>
                        </div>
                        <div className="p-2 min-h-[200px] max-h-[400px] overflow-y-auto space-y-1.5">
                          {dayTasks.map((t) => (
                            <div 
                              key={t.id} 
                              onClick={() => startEdit(t)}
                              className="bg-emerald-100 border border-emerald-300 rounded p-1.5 text-xs cursor-pointer hover:bg-emerald-200 transition-colors relative group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-emerald-900 truncate">{t.title} {t.recurrent && <span className="text-[10px]">(Every day)</span>}</div>
                                  <div className="text-emerald-700 text-[10px]">{formatTime12h(t.time)}</div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete "${t.title}"?`)) {
                                      removeTask(t.id);
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 hover:bg-red-100 rounded px-1 py-0.5 text-[10px] font-bold"
                                  title="Delete task"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                          {dayTasks.length === 0 && (
                            <div className="text-slate-400 text-xs text-center pt-2">No tasks</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mb-3 text-center flex gap-2 justify-center">
                <button onClick={() => { setShowDailyView(true); setShowWeekView(false); setSelectedDate(today.toISOString().slice(0, 10)); setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); }} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg">
                  Daily View
                </button>
              </div>
            </>
          )}

          {/* Daily View */}
          {showDailyView && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-900">
                      {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h4>
                    <p className="text-sm text-slate-600">Tasks for this day</p>
                  </div>
                  <button onClick={() => { setShowDailyView(false); }} className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">
                    Back to Calendar
                  </button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {tasksForDate(selectedDate).length === 0 ? (
                    <div className="text-center text-slate-500 py-4">No tasks for this day</div>
                  ) : (
                    tasksForDate(selectedDate).map((t) => (
                      <div key={t.id} className="bg-white border border-emerald-300 rounded-lg p-3 flex items-center justify-between hover:bg-emerald-50">
                        <div className="flex-1">
                          <div className="font-semibold text-emerald-900">
                            {t.title} {t.recurrent && <span className="text-xs text-emerald-600">(Every day)</span>}
                          </div>
                          <div className="text-sm text-emerald-700">{formatTime12h(t.time)}</div>
                          {t.details && (
                            <div className="text-xs text-slate-600 mt-1">{t.details}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleRemind(t.id)}
                            className={`text-xs px-2 py-1 rounded ${t.remind ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {t.remind ? '🔔 On' : '🔕 Off'}
                          </button>
                          <button 
                            onClick={() => startEdit(t)}
                            className="text-xs px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => removeTask(t.id)}
                            className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Add Task (only in month view, not in week view) */}
          {!showWeekView && !editingId && (
            <div className="mb-3">
              {!adding && (
                <button onClick={() => setAdding(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Add Task</button>
              )}
              {adding && (
                <div className="flex flex-col gap-3 items-stretch">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Task name" className="flex-1 border border-emerald-300 rounded-lg px-3 py-2" />
                    <input value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} type="time" className="w-36 border border-emerald-300 rounded-lg px-3 py-2" />
                  </div>
                  <textarea value={newTaskDetails} onChange={(e) => setNewTaskDetails(e.target.value)} placeholder="Details (what does this task entail?)" rows={3} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center gap-2 border border-emerald-300 rounded-lg px-3 py-2">
                      <input type="checkbox" checked={newTaskRemind} onChange={(e) => setNewTaskRemind(e.target.checked)} /> Remind {childName || "kid"}
                    </label>
                    <label className="flex items-center gap-2 border border-emerald-300 rounded-lg px-3 py-2">
                      <input type="checkbox" checked={newTaskRecurrent} onChange={(e) => setNewTaskRecurrent(e.target.checked)} /> Recurrent (every day)
                    </label>
                    <div className="flex gap-2">
                      <button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Confirm</button>
                      <button onClick={() => setAdding(false)} className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Task Form (shown in all views when editing) */}
          {editingId && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-emerald-900 mb-3">Edit Task</h4>
              <div className="flex flex-col gap-3 items-stretch">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Task name" className="flex-1 border border-emerald-300 rounded-lg px-3 py-2" />
                  <input value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} type="time" className="w-36 border border-emerald-300 rounded-lg px-3 py-2" />
                </div>
                <textarea value={newTaskDetails} onChange={(e) => setNewTaskDetails(e.target.value)} placeholder="Details (what does this task entail?)" rows={3} className="w-full border border-emerald-300 rounded-lg px-3 py-2" />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="flex items-center gap-2 border border-emerald-300 rounded-lg px-3 py-2 bg-white">
                    <input type="checkbox" checked={newTaskRemind} onChange={(e) => setNewTaskRemind(e.target.checked)} /> Remind {childName || "kid"}
                  </label>
                  <label className="flex items-center gap-2 border border-emerald-300 rounded-lg px-3 py-2 bg-white">
                    <input type="checkbox" checked={newTaskRecurrent} onChange={(e) => setNewTaskRecurrent(e.target.checked)} /> Recurrent (every day)
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg">Save</button>
                    <button onClick={cancelEdit} className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <style jsx global>{`
        /* Ensure scrollbar is visible */
        .parent-task-list::-webkit-scrollbar {
          width: 8px;
        }
        .parent-task-list::-webkit-scrollbar-track {
          background: #ecfdf5;
          border-radius: 4px;
        }
        .parent-task-list::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }
        .parent-task-list::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}


