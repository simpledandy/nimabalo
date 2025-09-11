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

export default function LatestQuestions({ 
  questions, 
  loading, 
  onQuestionsUpdate,
  showAuthModal,
  setShowAuthModal
}: { 
  questions: Question[]; 
  loading: boolean; 
  onQuestionsUpdate: (questions: Question[]) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}) {
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
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
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
          // Update the same_count in the questions array
          onQuestionsUpdate(questions.map(q => 
            q.id === id ? { ...q, same_count: Math.max(0, (q.same_count || 0) - 1) } : q
          ));
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
          // Update the same_count in the questions array
          onQuestionsUpdate(questions.map(q => 
            q.id === id ? { ...q, same_count: (q.same_count || 0) + 1 } : q
          ));
        }
      }
    } finally {
      setLoadingReactions(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <>
      <div className="text-sm sm:text-base font-bold mb-4 pl-2 text-accent">So'nggi savollar</div>
      <ul className="space-y-2">
        {loading && <li className="card text-xs sm:text-sm">Yuklanmoqda…</li>}
        {!loading && questions.length === 0 && <li className="card text-xs sm:text-sm">Hali savollar yo'q.</li>}
        {!loading && questions.map((q) => (
          <li key={q.id} className="card hover-lift transition-shadow cursor-pointer text-xs sm:text-sm px-3 py-3 bg-light">
            <Link href={`/q/${q.id}`} className="block">
              <h3 className="font-semibold mb-1 text-primary" style={{fontSize:'0.9em'}}>{q.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-neutral">
                  Muallif: {q.user_id ? (
                    <Link 
                      href={`/profile/${q.user_id}`}
                      className="text-accent hover:text-secondary transition-colors font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {authors[q.user_id] || '...'}
                    </Link>
                  ) : 'Anon'}
                </span>
              </div>
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-neutral opacity-60">
                {q.same_count ? `${q.same_count} kishida ham qiziq` : ''}
              </span>
              <div className="flex gap-1 sm:gap-2">
                {/* Answer Button - Primary action */}
                <Link 
                  href={`/q/${q.id}`}
                  className="btn px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] min-w-0"
                  title="Bu savolga javob bering"
                >
                  <span className="mr-1">💬</span>
                  <span className="hidden sm:inline">Javob</span>
                </Link>
                {/* Same Question Button - Secondary action */}
                <button
                  className={`btn-secondary px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] min-w-0 ${reactions[q.id] ? 'opacity-100' : 'opacity-90'} ${loadingReactions[q.id] ? 'opacity-50' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSame(q.id); }}
                  disabled={!user || loadingReactions[q.id]}
                  title={!user ? "Qiziqish bildirish uchun kirish kerak" : "Bu savol menga ham qiziq"}
                  aria-label={!user ? "Qiziqish bildirish uchun kirish kerak" : reactions[q.id] ? "Bu savol menga ham qiziq" : "Bu savol menga ham qiziq"}
                  aria-pressed={reactions[q.id]}
                  aria-busy={loadingReactions[q.id]}
                >
                  {loadingReactions[q.id] ? '...' : (
                    <>
                      <span className="mr-1">🤝</span>
                      <span className="hidden sm:inline">
                        {reactions[q.id] ? 'Menga ham qiziq ✓' : 'Menga ham qiziq'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
    </>
  );
}


