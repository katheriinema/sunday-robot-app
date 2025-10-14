"use client";
import { useParams } from "next/navigation";
import localBooks from "@/data/books.json";
import { useState, useEffect } from "react";

export default function Reader() {
  const { id } = useParams<{id:string}>();
  const book = localBooks.find(b => b.id === id);
  const [page, setPage] = useState(0);

  useEffect(() => { if (book) speak(book.pages[0].text); }, [book]);

  if (!book) return <div className="grid place-items-center h-dvh text-xl">Book not found 😢</div>;

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = book.lang || "en-US";
    speechSynthesis.speak(u);
  };

  const next = () => { if (page < book.pages.length - 1) { setPage(page + 1); speak(book.pages[page+1].text); } };
  const prev = () => { if (page > 0) { setPage(page - 1); speak(book.pages[page-1].text); } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Book Cover Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border-4 border-amber-200">
          <div className="flex items-center gap-6">
            <div className="w-32 h-40 rounded-xl overflow-hidden shadow-lg border-2 border-amber-300">
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRkZGNkU0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjRkY4QzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5KWPC90ZXh0Pgo8L3N2Zz4K";
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 text-amber-800 font-serif">{book.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  📖 Our Story
                </span>
                <span className="text-gray-500 text-sm">
                  {book.pages.length} pages
                </span>
              </div>
              <a href="/books" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors">
                ← Back to Bookshelf
              </a>
            </div>
          </div>
        </div>

        {/* Book Pages */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-amber-200 overflow-hidden">
          {/* Page Content */}
          <div className="p-12 min-h-[500px] flex flex-col justify-center">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <div className="text-6xl mb-6">📖</div>
                <p className="text-xl leading-relaxed text-gray-800 font-serif">
                  {book.pages[page].text}
                </p>
              </div>
              
              {/* Page Controls */}
              <div className="flex justify-center gap-6 mt-8">
                <button 
                  onClick={prev} 
                  disabled={page===0} 
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  ⬅ Back
                </button>
                <button 
                  onClick={()=>speak(book.pages[page].text)} 
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔊 Speak
                </button>
                <button 
                  onClick={next} 
                  disabled={page===book.pages.length-1} 
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  Next ➡
                </button>
              </div>
              
              {/* Page Counter */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                  <span className="text-amber-800 font-medium">
                    Page {page+1} of {book.pages.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
