"use client";
import { useEffect, useMemo, useState } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

type Cell = 0 | 1 | 2; // 0 empty, 1 = You (red), 2 = Sunday (yellow)

const ROWS = 6;
const COLS = 7;

function createBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]);
}

function getAvailableRow(board: Cell[][], col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return null;
}

function dropPiece(board: Cell[][], col: number, player: Cell): Cell[][] | null {
  const row = getAvailableRow(board, col);
  if (row === null) return null;
  const next = board.map((rowArr) => [...rowArr]) as Cell[][];
  next[row][col] = player;
  return next;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function checkWinner(board: Cell[][]): Cell | null {
  const dirs = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diag down-right
    [1, -1], // diag down-left
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (cell === 0) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (!inBounds(nr, nc)) break;
          if (board[nr][nc] === cell) count++;
          else break;
        }
        if (count >= 4) return cell;
      }
    }
  }
  return null;
}

function isDraw(board: Cell[][]): boolean {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) return false;
  }
  return true;
}

// Simple friendly AI: win > block > center > near-center > random legal
function chooseAiMove(board: Cell[][]): number | null {
  const AI: Cell = 2;
  const YOU: Cell = 1;

  // legal columns
  const legal: number[] = [];
  for (let c = 0; c < COLS; c++) if (getAvailableRow(board, c) !== null) legal.push(c);
  if (!legal.length) return null;

  // 1) Win if possible
  for (const c of legal) {
    const test = dropPiece(board, c, AI);
    if (test && checkWinner(test) === AI) return c;
  }
  // 2) Block opponent win
  for (const c of legal) {
    const test = dropPiece(board, c, YOU);
    if (test && checkWinner(test) === YOU) return c;
  }
  // 3) Center preference
  const order = [3, 2, 4, 1, 5, 0, 6].filter((c) => legal.includes(c));
  if (order.length) return order[0];
  return legal[0] ?? null;
}

export default function SundayConnectFour() {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [yourTurn, setYourTurn] = useState(true); // You start
  const winner = useMemo(() => checkWinner(board), [board]);
  const draw = useMemo(() => !winner && isDraw(board), [board, winner]);

  useEffect(() => {
    if (winner || draw) return;
    if (!yourTurn) {
      const t = setTimeout(() => {
        const move = chooseAiMove(board);
        if (move !== null) {
          const next = dropPiece(board, move, 2);
          if (next) setBoard(next);
        }
        setYourTurn(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [yourTurn, board, winner, draw]);

  const handleColumn = (col: number) => {
    if (!yourTurn || winner || draw) return;
    const next = dropPiece(board, col, 1);
    if (!next) return;
    setBoard(next);
    setYourTurn(false);
  };

  const reset = () => {
    setBoard(createBoard());
    setYourTurn(true);
  };

  const status = winner
    ? winner === 1
      ? "You win! 🎉"
      : "Sunday wins! 🤖"
    : draw
    ? "It's a draw!"
    : yourTurn
    ? "Your turn (red)"
    : "Sunday is thinking… (yellow)";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100 flex items-center justify-center p-6">
      <GlobalNavigation />
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-sky-800">Sunday Connect Four</h1>
          <p className="text-sky-700">Drop discs to make four in a row. Ages 5–13.</p>
        </div>

        <div className="grid md:grid-cols-[minmax(0,_1fr)_280px] gap-6 items-start">
          {/* Board */}
          <div className="flex justify-center">
            <div className="bg-sky-500 rounded-3xl p-3 shadow-2xl border-4 border-sky-300">
              {/* Column selectors */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {Array.from({ length: COLS }, (_, c) => (
                  <button
                    key={c}
                    onClick={() => handleColumn(c)}
                    className="h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                  >
                    ↓
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-2">
                {board.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="w-14 h-14 bg-sky-200 rounded-full flex items-center justify-center shadow-inner"
                    >
                      <div
                        className={`w-12 h-12 rounded-full transition-colors ${
                          cell === 1
                            ? "bg-red-500"
                            : cell === 2
                            ? "bg-yellow-400"
                            : "bg-white"
                        }`}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-xl border border-sky-200 p-5">
            <div className="text-slate-700 font-semibold mb-3 text-center md:text-left">{status}</div>
            <div className="flex gap-3 justify-center md:justify-start">
              <button onClick={reset} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl shadow">
                Reset
              </button>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Tip: Click a column to drop a disc. Make 4 in a row before Sunday!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



