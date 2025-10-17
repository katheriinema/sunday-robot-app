"use client";
import { useState, useEffect } from "react";

export default function Reminders() {
  const [stats, setStats] = useState({
    waterLevel: 75,
    lastWater: new Date(),
    sleepHours: 8,
    lastSleep: new Date(),
    exerciseMinutes: 30,
    lastExercise: new Date(),
    screenTime: 2,
    lastScreenBreak: new Date(),
    mood: "happy"
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: "water", message: "Sunday is getting thirsty! Drink some water to help him!", time: "2 hours ago", urgent: false },
    { id: 2, type: "sleep", message: "Sunday needs rest! Time for bed soon!", time: "1 hour ago", urgent: true },
    { id: 3, type: "exercise", message: "Sunday wants to play! Let's get moving!", time: "3 hours ago", urgent: false }
  ]);

  // Simulate time passing
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        waterLevel: Math.max(0, prev.waterLevel - 0.5),
        sleepHours: prev.sleepHours > 0 ? prev.sleepHours - 0.1 : 0
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case "water":
        setStats(prev => ({ ...prev, waterLevel: Math.min(100, prev.waterLevel + 25), lastWater: new Date() }));
        break;
      case "sleep":
        setStats(prev => ({ ...prev, sleepHours: 8, lastSleep: new Date() }));
        break;
      case "exercise":
        setStats(prev => ({ ...prev, exerciseMinutes: Math.min(60, prev.exerciseMinutes + 15), lastExercise: new Date() }));
        break;
      case "screenBreak":
        setStats(prev => ({ ...prev, screenTime: Math.max(0, prev.screenTime - 0.5), lastScreenBreak: new Date() }));
        break;
    }
  };

  const getStatusColor = (value: number, type: string) => {
    if (type === "water") return value > 50 ? "text-blue-500" : value > 25 ? "text-yellow-500" : "text-red-500";
    if (type === "sleep") return value > 6 ? "text-green-500" : value > 4 ? "text-yellow-500" : "text-red-500";
    if (type === "exercise") return value > 30 ? "text-green-500" : value > 15 ? "text-yellow-500" : "text-red-500";
    return "text-gray-500";
  };

  const getStatusEmoji = (value: number, type: string) => {
    if (type === "water") return value > 50 ? "😊" : value > 25 ? "😐" : "😰";
    if (type === "sleep") return value > 6 ? "😴" : value > 4 ? "😑" : "😵";
    if (type === "exercise") return value > 30 ? "💪" : value > 15 ? "🏃" : "😴";
    return "😐";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Sunday's Health Stats
        </h1>
        <p className="text-lg text-gray-600">Take care of yourself to take care of Sunday!</p>
      </div>

      {/* Sunday's Status */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sunday's Current Status</h2>
            <p className="text-gray-600">Help Sunday stay healthy by staying healthy yourself!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Water */}
            <div className="bg-blue-50 rounded-2xl p-6 text-center border-2 border-blue-200">
              <div className="text-4xl mb-3">💧</div>
              <h3 className="font-bold text-gray-800 mb-2">Hydration</h3>
              <div className={`text-2xl font-bold mb-2 ${getStatusColor(stats.waterLevel, "water")}`}>
                {Math.round(stats.waterLevel)}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {getStatusEmoji(stats.waterLevel, "water")} Last drink: {stats.lastWater.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => handleAction("water")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-colors duration-200"
              >
                💧 Drink Water
              </button>
            </div>

            {/* Sleep */}
            <div className="bg-purple-50 rounded-2xl p-6 text-center border-2 border-purple-200">
              <div className="text-4xl mb-3">😴</div>
              <h3 className="font-bold text-gray-800 mb-2">Sleep</h3>
              <div className={`text-2xl font-bold mb-2 ${getStatusColor(stats.sleepHours, "sleep")}`}>
                {Math.round(stats.sleepHours)}h
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {getStatusEmoji(stats.sleepHours, "sleep")} Last sleep: {stats.lastSleep.toLocaleDateString()}
              </div>
              <button 
                onClick={() => handleAction("sleep")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl transition-colors duration-200"
              >
                😴 Go to Sleep
              </button>
            </div>

            {/* Exercise */}
            <div className="bg-green-50 rounded-2xl p-6 text-center border-2 border-green-200">
              <div className="text-4xl mb-3">🏃‍♂️</div>
              <h3 className="font-bold text-gray-800 mb-2">Exercise</h3>
              <div className={`text-2xl font-bold mb-2 ${getStatusColor(stats.exerciseMinutes, "exercise")}`}>
                {Math.round(stats.exerciseMinutes)}min
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {getStatusEmoji(stats.exerciseMinutes, "exercise")} Last activity: {stats.lastExercise.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => handleAction("exercise")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition-colors duration-200"
              >
                🏃‍♂️ Exercise
              </button>
            </div>

            {/* Screen Time */}
            <div className="bg-orange-50 rounded-2xl p-6 text-center border-2 border-orange-200">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-gray-800 mb-2">Screen Time</h3>
              <div className={`text-2xl font-bold mb-2 ${stats.screenTime > 4 ? "text-red-500" : stats.screenTime > 2 ? "text-yellow-500" : "text-green-500"}`}>
                {Math.round(stats.screenTime)}h
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {stats.screenTime > 4 ? "😵" : stats.screenTime > 2 ? "😐" : "😊"} Last break: {stats.lastScreenBreak.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => handleAction("screenBreak")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-colors duration-200"
              >
                📱 Take Break
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📢 Sunday's Reminders</h2>
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-2xl border-2 ${
                  notification.urgent 
                    ? "bg-red-50 border-red-200" 
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {notification.type === "water" ? "💧" : 
                       notification.type === "sleep" ? "😴" : 
                       notification.type === "exercise" ? "🏃‍♂️" : "📱"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{notification.message}</p>
                      <p className="text-sm text-gray-600">{notification.time}</p>
                    </div>
                  </div>
                  {notification.urgent && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      URGENT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 text-4xl animate-bounce" style={{animationDelay: '0s'}}>🌱</div>
      <div className="fixed top-32 right-16 text-3xl animate-bounce" style={{animationDelay: '1s'}}>💧</div>
      <div className="fixed bottom-32 left-20 text-3xl animate-bounce" style={{animationDelay: '2s'}}>😴</div>
      <div className="fixed bottom-20 right-10 text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>🏃‍♂️</div>

      {/* Back Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="/living-room" 
          className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 text-lg"
        >
          <span className="text-2xl animate-pulse">🏠</span>
          <span>Back to Room</span>
        </a>
      </div>
    </div>
  );
}