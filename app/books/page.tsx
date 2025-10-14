"use client";
import { useEffect, useState } from "react";
import localBooks from "@/data/books.json";
import Link from "next/link";
import Image from "next/image";

export default function Bookshelf() {
  const [onlineBooks, setOnlineBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("https://openlibrary.org/search.json?q=children&has_fulltext=true&limit=12");
        const data = await res.json();
        setOnlineBooks(data.docs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Bookshelf</h1>

      {/* Our Books */}
      <h2 className="text-2xl font-semibold mb-3">Our Stories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {localBooks.map(b=>(
          <Link key={b.id} href={`/read/${b.id}`} className="block">
            <div className="relative">
              <Image 
                src={b.cover} 
                alt={b.title} 
                width={320} 
                height={420} 
                className="rounded-lg shadow w-full aspect-[3/4] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQyMCIgdmlld0JveD0iMCAwIDMyMCA0MjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iNDIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iMjEwIiBmb250LmZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkpY8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <span className="text-2xl">📖</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center font-medium">{b.title}</div>
          </Link>
        ))}
      </div>

      {/* Online Books */}
      <h2 className="text-2xl font-semibold mb-3">More Books Online</h2>
      {loading ? (
        <div className="text-center text-lg">📚 Loading online books...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {onlineBooks.map(b=>(
            <a key={b.key} href={`/read/${b.key}`} className="block">
              <img src={`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`} alt={b.title} className="rounded-lg shadow object-cover w-full aspect-[3/4]" />
              <div className="mt-2 text-center text-sm">{b.title}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}