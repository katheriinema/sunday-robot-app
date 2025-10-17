"use client";
import { useParams } from "next/navigation";
import localBooks from "@/data/books.json";
import { useState, useEffect, useRef } from "react";

export default function Reader() {
  const { id } = useParams<{id:string}>();
  const book = localBooks.find(b => b.id === id);
  const [definition, setDefinition] = useState<{word: string, definition: string} | null>(null);
  const [popupPosition, setPopupPosition] = useState({x: 0, y: 0});
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Cache for definitions to avoid repeated API calls
  const definitionCache = useRef<{[key: string]: string}>({});

  useEffect(() => { 
    if (book) {
      speak(book.pages[0].text);
    }
  }, [book]);

  if (!book) return <div className="grid place-items-center h-dvh text-xl">Book not found 😢</div>;

  // Speech synthesis function
  const speak = (text: string) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = book.lang || "en-US";
    u.rate = 0.8; // Slightly slower for better comprehension
    u.pitch = 1.0;
    u.volume = 1.0;
    
    u.onstart = () => setIsPlaying(true);
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(u);
  };

  // Play/pause entire book
  const togglePlayPause = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      playEntireBook();
    }
  };

  // Play entire book from current position
  const playEntireBook = () => {
    if (!book) return;
    
    // Start from current page or beginning
    const startIndex = currentPageIndex;
    let currentIndex = startIndex;
    
    const playNextPage = () => {
      if (currentIndex < book.pages.length) {
        const pageText = book.pages[currentIndex].text;
        setCurrentPageIndex(currentIndex);
        
        const utterance = new SpeechSynthesisUtterance(pageText);
        utterance.lang = book.lang || "en-US";
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          currentIndex++;
          if (currentIndex < book.pages.length) {
            // Small pause between pages
            setTimeout(playNextPage, 500);
          } else {
            setIsPlaying(false);
            setCurrentPageIndex(0); // Reset to beginning
          }
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      }
    };
    
    setIsPlaying(true);
    playNextPage();
  };

  // Stop audio
  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Load definitions once and cache them
  const [definitions, setDefinitions] = useState<{[key: string]: string}>({});
  const [definitionsLoaded, setDefinitionsLoaded] = useState(false);

  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        const response = await fetch('/assets/books/sunday-lost-signal/definitions.json');
        const defs = await response.json();
        setDefinitions(defs);
        setDefinitionsLoaded(true);
      } catch (error) {
        console.error('Failed to load definitions:', error);
        setDefinitionsLoaded(true);
      }
    };
    
    loadDefinitions();
  }, []);

  // Dictionary lookup function with story-specific definitions
  const lookupWord = async (word: string) => {
    try {
      // Clean the word (remove punctuation, convert to lowercase)
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      
      // Skip very short words or numbers
      if (cleanWord.length < 2 || /^\d+$/.test(cleanWord)) {
        return null; // Don't allow clicking on short words
      }
      
      // Check cache first
      if (definitionCache.current[cleanWord]) {
        return definitionCache.current[cleanWord];
      }
      
      // Check if word exists in definitions
      if (definitions[cleanWord]) {
        // Cache the result
        definitionCache.current[cleanWord] = definitions[cleanWord];
        return definitions[cleanWord];
      }
      
      return null;
    } catch (error) {
      console.error('Definitions lookup failed:', error);
      return null;
    }
  };

  // Handle word click with loading state
  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    
    // Check if already cached
    if (definitionCache.current[cleanWord]) {
      setDefinition({ word, definition: definitionCache.current[cleanWord] });
      positionPopup(event);
      return;
    }
    
    // Show loading state
    setLoading(true);
    setDefinition({ word, definition: "Loading definition..." });
    positionPopup(event);
    
    try {
      const definition = await lookupWord(word);
      
      if (definition) {
        setDefinition({ word, definition });
      } else {
        // No definition available - close popup
        setDefinition(null);
      }
    } catch (error) {
      setDefinition(null);
    } finally {
      setLoading(false);
    }
  };

  // Position popup helper
  const positionPopup = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 100;
    
    let x = rect.right + 10;
    let y = rect.top;
    
    if (x + popupWidth > window.innerWidth - 20) {
      x = rect.left - popupWidth - 10;
    }
    
    if (x < 20) {
      x = rect.left + rect.width / 2;
    }
    
    if (y < 20) {
      y = rect.bottom + 10;
    }
    
    if (y + popupHeight > window.innerHeight - 20) {
      y = rect.top - popupHeight - 10;
    }
    
    setPopupPosition({ x, y });
  };

  // Close popup when clicking outside
  const closePopup = () => {
    setDefinition(null);
  };

  // Split text into words and make them clickable only if they have definitions
  const renderTextWithClickableWords = (text: string) => {
    const words = text.split(/(\s+)/);
    
    return words.map((word, index) => {
      // Only make words clickable if they have definitions
      if (word.match(/^[a-zA-Z]+$/)) {
        const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
        
        // Only make clickable if it actually has a definition in our JSON file
        if (definitionsLoaded && definitions[cleanWord]) {
          return (
            <span
              key={index}
              className="cursor-pointer hover:bg-yellow-200 hover:text-gray-800 transition-colors duration-200 rounded px-1 border-b-2 border-blue-300"
              onClick={(e) => handleWordClick(word, e)}
              title="Click for definition"
              style={{ userSelect: 'none' }}
            >
              {word}
            </span>
          );
        } else {
          // Word has no definition - render as normal text with no selection
          return (
            <span
              key={index}
              style={{ userSelect: 'none' }}
            >
              {word}
            </span>
          );
        }
      }
      return word;
    });
  };

  // Keyboard navigation for speech
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        // Speak all text when spacebar is pressed
        const allText = book.pages.map(page => page.text).join(' ');
        speak(allText);
      }
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [book]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Book Cover Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white rounded-2xl shadow-2xl p-6 mx-4 mt-4 mb-0 border-4 border-amber-200 relative">
        {/* Back to Bookshelf Button */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Speaker Button */}
          <button
            onClick={togglePlayPause}
            className={`inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            title={isPlaying ? "Pause Audio" : "Play Audio"}
          >
            {isPlaying ? (
              <span className="text-xl">⏸️</span>
            ) : (
              <span className="text-xl">🔊</span>
            )}
          </button>
          
          {/* Back Button */}
          <a 
            href="/books" 
            className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            title="Back to Bookshelf"
          >
            <span className="text-xl">←</span>
          </a>
        </div>
        
        <div className="flex items-center gap-6 pr-28">
              <img
                src={book.cover}
                alt={book.title}
            className="w-40 h-48 object-contain rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRkZGNkU0Ii8+Cjx0ZXh0IHg9IjY0IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjRkY4QzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5KWPC90ZXh0Pgo8L3N2Zz4K";
                }}
              />
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
            </div>
          </div>
        </div>

      {/* Continuous Scrolling Book Container */}
      <div className="book-container mt-0">
        <div className="book-content">
          <div className="text-content">
        {book.pages.map((page, index) => (
          <div key={index} className="text-block">
            <p>{renderTextWithClickableWords(page.text)}</p>
              </div>
        ))}
                </div>
              </div>
              </div>
              
      {/* Definition Popup */}
      {definition && (
        <div 
          className="fixed z-50 bg-white border-2 border-amber-300 rounded-lg shadow-xl p-4 max-w-xs"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-amber-800 text-lg">{definition.word}</h3>
                <button 
              onClick={closePopup}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
                </button>
              </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                Loading...
                  </span>
            ) : (
              definition.definition
            )}
          </p>
                </div>
      )}

      {/* Back to Room Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="/living-room" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          <span className="text-xl">🏠</span>
          Back to Room
        </a>
      </div>
    </div>
  );
}
