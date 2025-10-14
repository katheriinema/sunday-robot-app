interface UIProps {
  children: React.ReactNode;
  className?: string;
}

export default function UI({ children, className = "" }: UIProps) {
  return (
    <div className={`min-h-screen bg-gray-100 p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}

// Navigation component
export function Navigation() {
  return (
    <nav className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <a href="/living-room" className="text-xl font-bold text-gray-800">
          🏠 Sunday
        </a>
        <div className="flex gap-4">
          <a href="/books" className="btn bg-blue-500 hover:bg-blue-600">
            📚 Books
          </a>
          <a href="/arcade" className="btn bg-purple-500 hover:bg-purple-600">
            🎮 Arcade
          </a>
          <a href="/reminders" className="btn bg-green-500 hover:bg-green-600">
            ⏰ Reminders
          </a>
        </div>
      </div>
    </nav>
  );
}

// Loading component
export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}
