'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';

export default function AskPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { addToast } = useToast();

  if (!loading && !user) {
    return (
      <div className="card uzbek-pattern animate-scale-in hover-lift">
        <p className="mb-3 text-lg">Savol berish uchun tizimga kiring.</p>
        <Link href="/auth" className="btn">Kirishga o'tish</Link>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('questions').insert({
        user_id: user!.id,
        title: title.trim(),
        body: body.trim() || null,
      });
      if (error) throw error;
      addToast("Zo'r savol!", "success");
      router.push('/');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Nimadir xato ketdi');
      addToast('Nimadir xato ketdi', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 uzbek-pattern animate-fade-in-up">
      <h1 className="cozy-title">Nima balo so'ramoqchisiz?</h1>
      <div className="card space-y-4 hover-lift">
        <label className="block">
          <span className="cozy-subtitle">Sarlavha</span>
          <input
            className="input text-lg"
            type="text"
            placeholder="Savolingiz qisqacha..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            disabled={submitting}
            maxLength={100}
          />
        </label>
        <label className="block">
          <span className="cozy-subtitle">Batafsil (ixtiyoriy)</span>
          <textarea
            className="textarea"
            placeholder="Qo'shimcha ma'lumot..."
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={submitting}
            maxLength={500}
          />
        </label>
        {errorMsg && <div className="text-red-500 text-sm">{errorMsg === 'Something went wrong' ? 'Nimadir xato ketdi' : errorMsg}</div>}
        <button
          className="btn w-full text-lg"
          onClick={submit}
          disabled={submitting || !title.trim()}
        >
          {submitting ? 'Yuborilmoqda…' : 'Savolni yuborish'}
        </button>
      </div>
    </div>
  );
}