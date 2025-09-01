"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import IndependenceCongrats from "@/components/IndependenceCongrats";
import SurpriseCTA from "@/components/SurpriseCTA";
import LatestQuestions from "@/components/LatestQuestions";
import SparkleEffect from "@/components/SparkleEffect";
import ConfettiEffect from "@/components/ConfettiEffect";

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

export default function Page() {
  const { user } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Fetch questions
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id,title,body,created_at,user_id,same_count')
        .order('created_at', { ascending: false });
      if (!error && data) setQuestions(data);
      setLoading(false);
    })();
  }, []);

  // Auto-focus ask input when ask form is shown
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Submit handler
  async function submit() {
    setErrorMsg('');
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Savol sarlavhasi bo\'lishi mumkin emas.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('questions').insert({
      title: title.trim(),
      body: body.trim(),
      user_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      return;
    }
    setTitle('');
    setBody('');
    // Show confetti celebration!
    setShowConfetti(true);
    setShowSuccess(true);
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
    // Optionally, refresh questions
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('id,title,body,created_at,user_id,same_count')
      .order('created_at', { ascending: false });
    if (!fetchError && data) setQuestions(data);
  }

  // Split the main prompt into words for individual animation
  const promptWords = ['Xo\'sh,', 'nima', 'baloni', 'bilmoqchisiz?'];
  const emojis = ['🤔', '💭', '✨', '😊'];

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      {/* Confetti celebration effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* Sparkle effect for extra playfulness */}
      <SparkleEffect />
      
      {/* Floating background elements for playfulness */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-bounce-slow">🤔</div>
        <div className="absolute top-40 right-20 text-3xl opacity-10 animate-bounce-slower">💭</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-bounce-slowest">✨</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce-slow">😊</div>
      </div>

      <div className="flex flex-row justify-center items-start min-h-screen pt-[72px]">
        <IndependenceCongrats />
        {/* Main center column */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh]">
          {/* Playful main heading with word-by-word animation */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in" style={{color:'#0C4A6E', letterSpacing:'-0.01em'}}>
              {promptWords.map((word, index) => (
                <span
                  key={index}
                  className={`inline-block mx-1 transition-all duration-300 hover:scale-110 hover:rotate-2 cursor-default ${
                    hoveredWord === index ? 'animate-pulse' : ''
                  }`}
                  onMouseEnter={() => setHoveredWord(index)}
                  onMouseLeave={() => setHoveredWord(null)}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    transform: hoveredWord === index ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)',
                    textShadow: hoveredWord === index ? '0 4px 12px rgba(14, 165, 233, 0.4)' : 'none'
                  }}
                >
                  {word}
                  <span className="ml-2 opacity-60 animate-bounce-slow" style={{animationDelay: `${index * 300}ms`}}>
                    {emojis[index]}
                  </span>
                </span>
              ))}
            </h1>
            
            {/* Playful subtitle */}
            <p className="text-xl md:text-2xl text-sky-600 font-medium animate-fade-in-up opacity-80" style={{animationDelay: '800ms'}}>
              Savollaringizni so'rang, biz sizga yordam beramiz! 🌟
            </p>
          </div>

          <div className="p-10 flex flex-col gap-8 w-full max-w-xl animate-fade-in-up" style={{background: 'transparent', boxShadow: 'none', animationDelay: '400ms'}}>
            {/* Enhanced input with playful placeholder */}
            <div className="relative group">
              <input
                className="input text-2xl md:text-3xl py-6 px-4 font-bold border-2 border-sky-200 focus:border-sky-500 transition-all duration-300 outline-none rounded-xl shadow-sm focus:shadow-lg bg-transparent group-hover:shadow-md"
                type="text"
                placeholder="Savolingizni yozing... 🤔"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                ref={titleRef}
                disabled={submitting}
                maxLength={100}
                style={{
                  fontWeight:'600', 
                  background: submitting ? '#f1f5f9' : 'transparent',
                  transform: title ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              />
              {/* Character counter with emoji */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-sky-400 font-medium">
                {title.length}/100 {title.length > 80 ? '🚨' : title.length > 50 ? '📝' : '✍️'}
              </div>
            </div>

            {/* Enhanced button with playful text */}
            <button
              className="btn w-full text-center text-2xl md:text-3xl py-4 font-bold bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
              onClick={submit}
              disabled={submitting || !title.trim()}
              style={{
                background: submitting || !title.trim() 
                  ? 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)' 
                  : 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
                transform: submitting || !title.trim() ? 'scale(1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Yuborilmoqda…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-bounce-slow">🚀</span>
                  Odamlardan so'raymiz!
                </span>
              )}
            </button>

            {/* Enhanced error message */}
            {errorMsg && (
              <div className="text-red-500 text-lg animate-shake bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                {errorMsg}
              </div>
            )}

            {/* Fun tip */}
            {!title && !submitting && (
              <div className="text-center text-sky-600 text-sm opacity-70 animate-pulse">
                💡 Maslahat: Savolingizni aniq va tushunarli yozing!
              </div>
            )}

            {/* Success message */}
            {showSuccess && (
              <div className="text-center text-green-600 text-lg font-medium animate-fade-in-up bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-center gap-2">
                <span className="animate-bounce-slow">🎉</span>
                Savolingiz muvaffaqiyatli yuborildi! Javobni kutib turing! 🚀
              </div>
            )}
          </div>

          {/* Show sign in/up prompt if user tries to submit while not logged in */}
          {showSignupPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-xs w-full animate-scale-in">
                <div className="text-2xl mb-2">🔐</div>
                <div className="text-xl font-bold text-sky-700 mb-2 text-center">Savol yuborish uchun kirish yoki ro'yxatdan o'tish kerak</div>
                <div className="flex gap-4 w-full">
                  <a href="/auth" className="flex-1 py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-center transition-all hover:scale-105">Kirish</a>
                  <a href="/auth?signup=1" className="flex-1 py-2 px-4 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold text-center transition-all hover:scale-105">Ro'yxatdan o'tish</a>
                </div>
                <button className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowSignupPrompt(false)}>Bekor qilish</button>
              </div>
            </div>
          )}
        </div>
        {/* Right sidebar */}
        <div className="hidden md:block fixed right-0 h-full w-80 px-4 pt-4 overflow-y-auto z-30 bg-white/95 shadow-2xl animate-fade-in-right">
          <LatestQuestions questions={questions} loading={loading} />
        </div>
      </div>
    </div>
  );
}