'use client';


import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';


type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};


export default function HomePage() {
  const { user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState('');
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

  // Fetch profile if logged in
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    })();
  }, [user]);

  // Auto-focus ask input when ask form is shown
  useEffect(() => {
    if (showAsk && titleRef.current) {
      titleRef.current.focus();
    }
  }, [showAsk]);

  async function submit() {
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('questions').insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim() || null,
      });
      if (error) throw error;
      setTitle('');
      setBody('');
      setShowAsk(false);
      // Refresh questions
      setLoading(true);
      const { data } = await supabase
        .from('questions')
        .select('id,title,body,created_at,user_id')
        .order('created_at', { ascending: false });
      if (data) setQuestions(data);
      setLoading(false);
      // Show random tip after sharing
      setTip(randomTip());
      setShowTip(true);
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Noma’lum xatolik');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveProfile() {
    if (!user || !profile) return;
    setProfileMsg('');
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: profile.username?.trim() || null,
      full_name: profile.full_name?.trim() || null,
      avatar_url: profile.avatar_url || null,
    });
    setProfileMsg(error ? `Xatolik: ${error.message}` : 'Saqlangan!');
  }

  // Cozy greeting
  const greeting = user && profile?.full_name
    ? `Salom, ${profile.full_name.split(' ')[0]}! Nimabalo haqida so'ramoqchisiz?`
    : 'Nimabalo sizni o‘ylantiryapti?';

  // Remove hydration tip logic; tip is now only shown after sharing
  

  return (
    <div className="space-y-8 uzbek-pattern max-w-2xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold cozy-title">{greeting}</h1>
        {/*<p className="text-lg text-gray-700">Nimabalo'da savol bering, javob oling, do‘stlaringizni taklif qiling va yulduzlar hamda badge’lar oling!</p>*/}
      </div>

      {/* Ask form, always visible. If not logged in, show sign up prompt on submit. */}
      <div className="card space-y-4">
        <h2 className="cozy-subtitle">Savol berish</h2>
        <label className="block">
          <span className="text-base">Sarlavha</span>
          <input
            className="input text-lg"
            type="text"
            placeholder="Savolingiz qisqacha..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            ref={titleRef}
            disabled={submitting}
            maxLength={100}
          />
        </label>
        <label className="block">
          <span className="text-base">Batafsil (ixtiyoriy)</span>
          <textarea
            className="input min-h-[60px]"
            placeholder="Batafsilroq yozing..."
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={submitting}
            maxLength={500}
          />
        </label>
        <button
          className="btn w-full text-lg"
          onClick={submit}
          disabled={submitting || !title.trim()}
        >
          {submitting ? 'Yuborilmoqda...' : 'Savolni joylash'}
        </button>
        {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
      </div>

      {/* Sign up prompt modal for unauthenticated users */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative text-center">
            <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowSignupPrompt(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Savolingizni yuborish uchun ro‘yxatdan o‘ting</h2>
            <p className="mb-4 text-gray-600">Nimabalo’da savol berish va javob olish uchun hisob yarating yoki tizimga kiring.</p>
            <a href="/auth" className="btn w-full">Ro‘yxatdan o‘tish / Kirish</a>
          </div>
        </div>
      )}

      {/* Profile section, inline, only if logged in */}
      {user && profile && (
        <div className="card space-y-3">
          <h2 className="cozy-subtitle">Profil</h2>
          <div className="grid gap-3">
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-mono text-base">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">To‘liq ism</div>
              <input
                className="input"
                type="text"
                value={profile.full_name || ''}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                disabled={submitting}
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">Foydalanuvchi nomi</div>
              <input
                className="input"
                type="text"
                value={profile.username || ''}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                disabled={submitting}
              />
            </div>
            <button className="btn w-full" onClick={saveProfile} disabled={submitting}>
              Saqlash
            </button>
            {profileMsg && <div className="text-green-600 text-sm">{profileMsg}</div>}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div>
        <h2 className="cozy-subtitle mb-2">Bularga bir balo deb qo'ying 😁</h2>
        {loading && <div className="card">Yuklanmoqda…</div>}
        {!loading && questions.length === 0 && (
          <div className="card">Hali savollar yo‘q. Birinchi bo‘ling!</div>
        )}
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="card hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveQ(q)}>
              <h3 className="text-xl font-semibold text-blue-700 mb-1">{q.title}</h3>
              {q.body && (
                <p className="text-base text-gray-600 line-clamp-2 mt-1">
                  {q.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Addictive random tip, only after sharing */}
      {showTip && (
        <div className="text-center text-sm text-gray-500 mt-8">
          <button className="btn-secondary px-4 py-2 text-base" tabIndex={-1} style={{pointerEvents:'none'}}>
            {tip}
          </button>
          <div className="mt-2">
            <span className="font-semibold">Do‘stingizni nimabaloga taklif qiling!</span> <span className="text-blue-600">Referral havolangiz: <b>nimabalo.uz/?ref=YOURCODE</b></span>
          </div>
        </div>
      )}

      {/* Cozy modal for question detail (lazy, no navigation) */}
      {activeQ && (
        <QuestionDetailModal q={activeQ} onClose={() => setActiveQ(null)} user={user} />
      )}
    </div>
  );
}

// Random tip for engagement
function randomTip() {
  const tips = [
    'Birinchi savolingizni bering va syurpriz!',
    'Do‘stingizni taklif qiling -> syurpriz!',
    'Ko‘proq savol bering, syurprizlar oling.',
    'Profilingizni to‘ldiring va syurpriz!',
    'Nimabalo’da faol bo‘ling va xursand bo‘ling!',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// Modal for question detail (no navigation)
function QuestionDetailModal({ q, onClose, user }: { q: Question, onClose: () => void, user: any }) {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', q.id)
        .order('created_at', { ascending: false });
      if (data) setAnswers(data);
      setLoading(false);
    })();
  }, [q.id]);

  async function postAnswer() {
    setPosting(true);
    setErr('');
    try {
      const body = answerText.trim();
      if (body.length < 2) throw new Error('Javob juda qisqa.');
      const { error } = await supabase.from('answers').insert({
        question_id: q.id,
        user_id: user!.id,
        body,
      });
      if (error) throw error;
      setAnswerText('');
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', q.id)
        .order('created_at', { ascending: false });
      if (data) setAnswers(data);
    } catch (e: any) {
      setErr(e.message ?? 'Javob yuborilmadi');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2">{q.title}</h2>
        {q.body && <div className="mb-4 text-gray-700">{q.body}</div>}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Javoblar</h3>
          {loading ? (
            <div>Yuklanmoqda…</div>
          ) : answers.length === 0 ? (
            <div>Hali javoblar yo‘q.</div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {answers.map(a => (
                <li key={a.id} className="bg-gray-100 rounded p-2 text-sm">
                  {a.body}
                </li>
              ))}
            </ul>
          )}
        </div>
        {user && (
          <div className="space-y-2">
            <textarea
              className="input w-full min-h-[40px]"
              placeholder="Javob yozing..."
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              disabled={posting}
              maxLength={500}
            />
            <button className="btn w-full" onClick={postAnswer} disabled={posting || !answerText.trim()}>
              {posting ? 'Yuborilmoqda...' : 'Javob berish'}
            </button>
            {err && <div className="text-red-500 text-sm">{err}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
