"use client";
import { useMemo, useState } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

type Coord = { row: number; col: number } | null;

const INITIAL_BOARD: string[][] = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"],
];

const PIECE_TO_UNICODE: Record<string, string> = {
  // white
  "K": "\u2654",
  "Q": "\u2655",
  "R": "\u2656",
  "B": "\u2657",
  "N": "\u2658",
  "P": "\u2659",
  // black
  "k": "\u265A",
  "q": "\u265B",
  "r": "\u265C",
  "b": "\u265D",
  "n": "\u265E",
  "p": "\u265F",
};

function cloneBoard(board: string[][]): string[][] {
  return board.map(row => [...row]);
}

function isWhite(piece: string): boolean {
  return !!piece && piece === piece.toUpperCase();
}

export default function SundayChess() {
  const [board, setBoard] = useState<string[][]>(() => cloneBoard(INITIAL_BOARD));
  const [selected, setSelected] = useState<Coord>(null);
  const [whiteToMove, setWhiteToMove] = useState(true);

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    // If nothing selected yet
    if (!selected) {
      if (!piece) return; // cannot select empty
      // simple turn gating (no legality enforcement)
      if (whiteToMove && !isWhite(piece)) return;
      if (!whiteToMove && isWhite(piece)) return;
      setSelected({ row, col });
      return;
    }

    // If clicking the same color piece, change selection
    const fromPiece = board[selected.row][selected.col];
    if (piece && isWhite(piece) === isWhite(fromPiece)) {
      setSelected({ row, col });
      return;
    }

    // Move (no legality enforcement)
    const next = cloneBoard(board);
    next[row][col] = fromPiece;
    next[selected.row][selected.col] = "";
    setBoard(next);
    setSelected(null);
    setWhiteToMove(!whiteToMove);
  };

  const reset = () => {
    setBoard(cloneBoard(INITIAL_BOARD));
    setSelected(null);
    setWhiteToMove(true);
  };

  const turnLabel = whiteToMove ? "White to move" : "Black to move";

  // rank/file labels
  const files = useMemo(() => ["a","b","c","d","e","f","g","h"], []);
  const ranks = useMemo(() => [8,7,6,5,4,3,2,1], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <GlobalNavigation />
      <div className="w-full max-w-5xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Sunday Chess (beta)</h1>
          <p className="text-slate-600 mt-1">Simple board with basic moves. No rules enforced.</p>
        </div>

        <div className="grid md:grid-cols-[minmax(0,_1fr)_300px] gap-6 items-start">
          {/* Board */}
          <div className="w-full flex justify-center">
            <div className="select-none">
              {/* Files header */}
              <div className="flex justify-center ml-6 mb-1 text-xs text-slate-500">
                {files.map((f) => (
                  <div key={f} className="w-12 h-4 flex items-center justify-center">{f}</div>
                ))}
              </div>

              {/* Board grid with rank labels */}
              <div>
                {board.map((rowArr, rIdx) => (
                  <div key={rIdx} className="flex">
                    <div className="w-6 h-12 mr-0.5 flex items-center justify-center text-xs text-slate-500">
                      {ranks[rIdx]}
                    </div>
                    {rowArr.map((cell, cIdx) => {
                      const dark = (rIdx + cIdx) % 2 === 1;
                      const isSel = selected && selected.row === rIdx && selected.col === cIdx;
                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          onClick={() => handleSquareClick(rIdx, cIdx)}
                          className={`w-12 h-12 flex items-center justify-center text-2xl font-semibold border border-slate-300 ${dark ? "bg-emerald-700/80 text-emerald-50" : "bg-emerald-100"} ${isSel ? "ring-4 ring-amber-400" : ""}`}
                        >
                          <span>{cell ? PIECE_TO_UNICODE[cell] : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Files footer */}
              <div className="flex justify-center ml-6 mt-1 text-xs text-slate-500">
                {files.map((f) => (
                  <div key={f} className="w-12 h-4 flex items-center justify-center">{f}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
            <div className="text-slate-700 font-semibold mb-2">{turnLabel}</div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl shadow"
              >
                Reset
              </button>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Tip: Click a piece, then a destination square. Captures allowed. No checks, castling, en passant, or promotion yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



