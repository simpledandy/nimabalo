"use client";

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 text-4xl opacity-10 animate-bounce-slow">🤔</div>
      <div className="absolute top-40 right-20 text-3xl opacity-10 animate-bounce-slower">💭</div>
      <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-bounce-slowest">✨</div>
      <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce-slow">😊</div>
    </div>
  );
}
