export default function GodotFrame({ buildUrl }: { buildUrl: string }) {
  return (
    <div className="w-full h-screen bg-black">
      <iframe
        src={buildUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        title="Godot Game"
      />
    </div>
  );
}
