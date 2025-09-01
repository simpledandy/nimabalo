"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
};

export default function LatestQuestions({ questions, loading }: { questions: Question[]; loading: boolean }) {
  const { user } = useSession();
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});

  const userIds = useMemo(() => Array.from(new Set(questions.map(q => q.user_id).filter(Boolean))) as string[], [questions]);

  useEffect(() => {
    if (userIds.length === 0) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);
      if (!error && data) {
        const map: Record<string, string> = {};
        (data as Profile[]).forEach(p => {
          map[p.id] = (p.full_name?.trim() || p.username?.trim() || 'Anon');
        });
        setAuthors(map);
      }
    })();
  }, [userIds]);

  useEffect(() => {
    if (!user || questions.length === 0) return;
    (async () => {
      const questionIds = questions.map(q => q.id);
      const { data, error } = await supabase
        .from('user_reactions')
        .select('question_id')
        .eq('user_id', user.id)
        .eq('reaction_type', 'same_question')
        .in('question_id', questionIds);
      if (!error && data) {
        const map: Record<string, boolean> = {};
        data.forEach(r => { map[r.question_id] = true; });
        setReactions(map);
      }
    })();
  }, [user, questions]);

  async function toggleSame(id: string) {
    if (!user) return;
    setLoadingReactions(prev => ({ ...prev, [id]: true }));
    try {
      const hasReacted = reactions[id];
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('user_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', id)
          .eq('reaction_type', 'same_question');
        if (!error) {
          setReactions(prev => ({ ...prev, [id]: false }));
        }
      } else {
        // Add reaction
        const { error } = await supabase
          .from('user_reactions')
          .insert({
            user_id: user.id,
            question_id: id,
            reaction_type: 'same_question'
          });
        if (!error) {
          setReactions(prev => ({ ...prev, [id]: true }));
        }
      }
    } finally {
      setLoadingReactions(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <>
      <div className="text-sm font-bold mb-4 pl-2" style={{color:'#1EB2A6'}}>So‘nggi savollar</div>
      <ul className="space-y-2">
        {loading && <li className="card text-xs">Yuklanmoqda…</li>}
        {!loading && questions.length === 0 && <li className="card text-xs">Hali savollar yo‘q.</li>}
        {!loading && questions.map((q) => (
          <li key={q.id} className="card hover-lift transition-shadow cursor-pointer text-xs px-3 py-3" style={{background:'#f8fafc'}}>
            <Link href={`/q/${q.id}`} className="block">
              <h3 className="font-semibold mb-1" style={{color:'#0C4A6E', fontSize:'1em'}}>{q.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Muallif: {q.user_id ? (authors[q.user_id] || '...') : 'Anon'}</span>
              </div>
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {q.same_count ? `${q.same_count} kishida ham shunday savol bor` : ''}
              </span>
              <button
                className={`btn-secondary px-3 py-1 text-[11px] ${reactions[q.id] ? 'opacity-100' : 'opacity-90'} ${loadingReactions[q.id] ? 'opacity-50' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSame(q.id); }}
                disabled={!user || loadingReactions[q.id]}
                title={!user ? "Reaksiya berish uchun kirish kerak" : "Xuddi shu savol menda ham bor"}
              >
                {loadingReactions[q.id] ? '...' : (reactions[q.id] ? 'Menda ham shu savol ✓' : 'Menda ham shu savol')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}


