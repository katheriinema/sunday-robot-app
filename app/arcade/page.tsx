import Link from "next/link";

export default function Arcade() {
  return (
    <div className="p-6 max-w-5xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">🎮 Game Room</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/arcade/math" className="tile">🧮 Math Game</Link>
        <Link href="/arcade/runner" className="tile">🤖 Robot Runner</Link>
      </div>
    </div>
  );
}
