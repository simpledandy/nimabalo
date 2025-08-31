'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';

type Question = { id: string; title: string; body: string | null; created_at: string; user_id: string; };
type Answer = { id: string; body: string; created_at: string; user_id: string; };

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { user } = useSession();

  const [q, setQ] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: qData }, { data: aData }] = await Promise.all([
        supabase.from('questions').select('*').eq('id', id).single(),
        supabase.from('answers').select('*').eq('question_id', id).order('created_at', { ascending: false }),
      ]);
      if (qData) setQ(qData);
      if (aData) setAnswers(aData);
      setLoading(false);
    })();
  }, [id]);

  async function postAnswer() {
    setPosting(true);
    setErr('');
    try {
      const body = answerText.trim();
      if (body.length < 2) throw new Error('Javob juda qisqa.');
      const { error } = await supabase.from('answers').insert({
        question_id: id,
        user_id: user!.id,
        body,
      });
      if (error) throw error;
      setAnswerText('');
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .order('created_at', { ascending: false });
      if (data) setAnswers(data);
    } catch (e: any) {
      setErr(e.message ?? 'Javobni yuborishda xatolik yuz berdi');
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <div className="card">Yuklanmoqda…</div>;
  if (!q) return <div className="card">Savol topilmadi.</div>;

  return (
    <div className="space-y-5">
      <div className="card">
        <h1 className="text-2xl font-bold">{q.title}</h1>
        {q.body && <p className="mt-2 whitespace-pre-wrap">{q.body}</p>}
        <p className="text-xs text-gray-500 mt-3">So'ralgan vaqti: {new Date(q.created_at).toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Javoblar ({answers.length})</h2>
        {answers.length === 0 && <div className="card">Hali javoblar yo'q.</div>}
        <ul className="space-y-3">
          {answers.map(a => (
            <li key={a.id} className="card">
              <p className="whitespace-pre-wrap">{a.body}</p>
              <p className="text-xs text-gray-500 mt-2">
                Javob berilgan vaqti: {new Date(a.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-2">
        <h3 className="font-medium">Bir balo deb qo'ying...</h3>
        {!user ? (
          <p className="text-sm text-gray-600">Javob yozish uchun tizimga kiring.</p>
        ) : (
          <>
            <textarea
              className="textarea"
              placeholder="Foydali javob yozing…"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              onClick={postAnswer}
              disabled={posting || answerText.trim().length < 2}
              className="btn disabled:opacity-60"
            >
              {posting ? 'Yuborilmoqda…' : 'Javob yuborish'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
