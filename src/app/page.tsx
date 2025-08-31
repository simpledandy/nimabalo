"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
};


export default function HomePage() {
  const { user } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Fetch questions
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id,title,body,created_at,user_id')
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
      setErrorMsg('Savol sarlavhasi bo‘sh bo‘lishi mumkin emas.');
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
      setErrorMsg('Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
      return;
    }
    setTitle('');
    setBody('');
    // Optionally, refresh questions
    const { data, error: fetchError } = await supabase
      .from('questions')
      .select('id,title,body,created_at,user_id')
      .order('created_at', { ascending: false });
    if (!fetchError && data) setQuestions(data);
  }

  // Main prompt text
  const mainPrompt = 'Nima balo?';

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-white to-sky-50">
      <div className="flex flex-row justify-center items-start min-h-screen pt-[72px]">
        {/* Main center column */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh]">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-10 text-center animate-fade-in" style={{color:'#0C4A6E', letterSpacing:'-0.01em'}}>{mainPrompt}</h1>
          <div className="p-10 flex flex-col gap-8 w-full max-w-xl animate-fade-in-up" style={{background: 'transparent', boxShadow: 'none'}}>
            <input
              className="input text-2xl md:text-3xl py-6 px-4 font-bold border-2 border-sky-200 focus:border-sky-500 transition-all duration-200 outline-none rounded-xl shadow-sm focus:shadow-lg bg-transparent"
              type="text"
              placeholder="Savolingizni yozing..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              ref={titleRef}
              disabled={submitting}
              maxLength={100}
              style={{fontWeight:'600', background: submitting ? '#f1f5f9' : 'transparent'}}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            />
            <button
              className="btn w-full text-2xl md:text-3xl py-4 font-bold bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all duration-200 shadow-md text-center"
              onClick={submit}
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Yuborilmoqda…' : 'So‘raymiz'}
            </button>
            {errorMsg && <div className="text-red-500 text-lg animate-shake">{errorMsg}</div>}
          </div>
          {/* Show sign in/up prompt if user tries to submit while not logged in */}
          {showSignupPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-xs w-full">
                <div className="text-xl font-bold text-sky-700 mb-2">Savol yuborish uchun kirish yoki ro'yxatdan o'tish kerak</div>
                <div className="flex gap-4 w-full">
                  <a href="/auth" className="flex-1 py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-center transition-all">Kirish</a>
                  <a href="/auth?signup=1" className="flex-1 py-2 px-4 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold text-center transition-all">Ro'yxatdan o'tish</a>
                </div>
                <button className="mt-2 text-xs text-gray-400 hover:text-gray-600" onClick={() => setShowSignupPrompt(false)}>Bekor qilish</button>
              </div>
            </div>
          )}
        </div>
        {/* Right sidebar: Latest questions */}
        <div className="hidden md:block fixed right-0 h-full w-80 px-4 pt-4 overflow-y-auto z-30 bg-white/95 shadow-2xl animate-fade-in-right">
          <div className="text-sm font-bold mb-4 pl-2" style={{color:'#1EB2A6'}}>So‘nggi savollar</div>
          <ul className="space-y-2">
            {loading && <li className="card text-xs">Yuklanmoqda…</li>}
            {!loading && questions.length === 0 && <li className="card text-xs">Hali savollar yo‘q.</li>}
            {!loading && questions.map((q) => (
              <li key={q.id} className="card hover:shadow-xl transition-shadow cursor-pointer text-xs px-3 py-2" style={{background:'#f8fafc'}}>
                <h3 className="font-semibold mb-1" style={{color:'#0C4A6E', fontSize:'1em'}}>{q.title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

