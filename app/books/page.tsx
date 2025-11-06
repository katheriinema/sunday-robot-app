"use client";
import localBooks from "@/data/books.json";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

export default function Bookshelf() {
  const [sundayScrollPosition, setSundayScrollPosition] = useState(0);
  const [externalScrollPosition, setExternalScrollPosition] = useState(0);
  const [userName, setUserName] = useState("Friend");
  const sundayScrollRef = useRef<HTMLDivElement>(null);
  const externalScrollRef = useRef<HTMLDivElement>(null);

  // Get user name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("sundayUserName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // For now, we'll use the same books for both shelves
  // You can later separate them into different arrays
  const sundaysBooks = localBooks;
  const externalBooks: any[] = []; // Empty for now, can be populated later

  const scrollShelf = (direction: 'left' | 'right', shelf: 'sunday' | 'external') => {
    const scrollAmount = 300;
    const ref = shelf === 'sunday' ? sundayScrollRef : externalScrollRef;
    const setPosition = shelf === 'sunday' ? setSundayScrollPosition : setExternalScrollPosition;
    
    if (ref.current) {
      const newPosition = direction === 'left' 
        ? Math.max(0, (shelf === 'sunday' ? sundayScrollPosition : externalScrollPosition) - scrollAmount)
        : (shelf === 'sunday' ? sundayScrollPosition : externalScrollPosition) + scrollAmount;
      
      ref.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setPosition(newPosition);
    }
  };

  return (
    <div className="relative min-h-screen">
      <GlobalNavigation />
      {/* Bookshelf Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/bg/bookshelf.png" 
          alt="Wooden bookshelf" 
          className="w-full h-full object-cover object-[center_30%]"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl px-8 py-4 shadow-lg border-2 border-amber-400">
              <h1 className="text-3xl font-semibold text-amber-800">
                {userName}'s Bookshelf
              </h1>
            </div>
          </div>

          {/* Bookshelf Section */}
          <section className="bookshelf space-y-16">
            
            {/* Sunday's Books Shelf */}
            <div className="shelf-section">
              <h2 className="text-xl font-medium text-white mb-2 drop-shadow-lg text-left -mt-6 ml-16">
                Sunday's Books
              </h2>
              <div className="shelf relative p-6 pt-0 mt-8">
                <button 
                  onClick={() => scrollShelf('left', 'sunday')}
                  className="arrow left absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-amber-800 hover:text-amber-900 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
                >
                  ‹
                </button>
                <div 
                  ref={sundayScrollRef}
                  className="books-container flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {sundaysBooks.map((book, index) => (
                    <Link 
                      key={book.id} 
                      href={`/read/${book.id}`} 
                      className="book-card group flex-shrink-0 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative">
                        <div className="w-32 h-52 bg-white rounded shadow-lg border-2 border-white overflow-hidden relative">
                          {/* Shadow behind book */}
                          <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded transform rotate-1"></div>
                          <Image 
                            src={book.cover} 
                            alt={book.title} 
                            width={128} 
                            height={208} 
                            className={`w-full h-full object-cover object-[center_bottom] relative z-10`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRkZGNkU0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRkY4QzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5KWPC90ZXh0Pgo8L3N2Zz4K";
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <button 
                  onClick={() => scrollShelf('right', 'sunday')}
                  className="arrow right absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-amber-800 hover:text-amber-900 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Sunday Diary */}
            <div className="shelf-section">
              <h2 className="text-xl font-medium text-white mb-2 drop-shadow-lg text-left mt-2 ml-16">
                Sunday Diary
              </h2>
              <div className="shelf relative p-6 pt-0 mt-8">
                <button 
                  onClick={() => scrollShelf('left', 'external')}
                  className="arrow left absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-amber-800 hover:text-amber-900 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
                >
                  ‹
                </button>
                <div 
                  ref={externalScrollRef}
                  className="books-container flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <Link 
                    href="/books/diary" 
                    className="group flex-shrink-0 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
                  >
                    <div className="relative">
                      <div className="w-32 h-52 bg-white rounded shadow-lg border-2 border-white overflow-hidden relative">
                        {/* Shadow behind book */}
                        <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded transform rotate-1"></div>
                        <img 
                          src="/assets/file.svg"
                          alt="Journal placeholder cover"
                          className="w-full h-full object-contain relative z-10 bg-gray-50"
                        />
                      </div>
                    </div>
                  </Link>
                </div>
                <button 
                  onClick={() => scrollShelf('right', 'external')}
                  className="arrow right absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-amber-800 hover:text-amber-900 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
                >
                  ›
                </button>
              </div>
            </div>

          </section>
        </div>
        
      </div>
    </div>
  );
}