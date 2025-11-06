"use client";
import { useMemo, useState, useEffect } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

type Cell = "X" | "O" | "";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: Cell[]): Cell | "draw" | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((c) => c)) return "draw";
  return null;
}

function findBestMove(board: Cell[], player: Cell, opponent: Cell): number | null {
  // 1) Win if possible
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board];
      copy[i] = player;
      if (getWinner(copy) === player) return i;
    }
  }
  // 2) Block opponent win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board];
      copy[i] = opponent;
      if (getWinner(copy) === opponent) return i;
    }
  }
  // 3) Take center
  if (!board[4]) return 4;
  // 4) Take a corner
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5) Take a side
  const sides = [1, 3, 5, 7].filter((i) => !board[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return null;
}

export default function SundayTicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(""));
  const [yourTurn, setYourTurn] = useState(true); // You are X, Sunday is O
  const [status, setStatus] = useState("Your turn (X)");
  const winner = useMemo(() => getWinner(board), [board]);

  useEffect(() => {
    if (winner) {
      if (winner === "X") setStatus("You win! 🎉");
      else if (winner === "O") setStatus("Sunday wins! 🤖");
      else setStatus("It's a draw!");
      return;
    }

    if (!yourTurn) {
      setStatus("Sunday is thinking…");
      const timeout = setTimeout(() => {
        const move = findBestMove(board, "O", "X");
        if (move !== null) {
          const next = [...board];
          next[move] = "O";
          setBoard(next);
        }
        setYourTurn(true);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setStatus("Your turn (X)");
    }
  }, [yourTurn, board, winner]);

  const handleClick = (idx: number) => {
    if (!yourTurn || winner || board[idx]) return;
    const next = [...board];
    next[idx] = "X";
    setBoard(next);
    setYourTurn(false);
  };

  const reset = () => {
    setBoard(Array(9).fill(""));
    setYourTurn(true);
    setStatus("Your turn (X)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <GlobalNavigation />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-800">Sunday Tic Tac Toe</h1>
          <p className="text-indigo-600">Play against Sunday! Ages 5–13</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 p-6">
          <div className="text-center text-lg font-semibold text-slate-700 mb-4">{status}</div>
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`aspect-square rounded-2xl text-4xl font-bold flex items-center justify-center border-2 transition-colors
                  ${cell === "X" ? "bg-amber-100 border-amber-300 text-amber-700" : cell === "O" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={reset} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl shadow">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}



