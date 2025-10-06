"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { strings, formatString } from '@/lib/strings';
import { queryWithTimeout, handleSupabaseError } from '@/lib/supabaseUtils';
import { timeAgo } from '@/lib/timeUtils';

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
  setShowAuthModal,
  showClickableHeader = false,
  stackedButtons = false
}: { 
  questions: Question[]; 
  loading: boolean; 
  onQuestionsUpdate: (questions: Question[]) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showClickableHeader?: boolean;
  stackedButtons?: boolean;
}) {
  const { user } = useSession();
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, Profile>>({});
  const [reactions, setReactions] = useState<Record<string, boolean>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});

  const userIds = useMemo(() => Array.from(new Set(questions.map(q => q.user_id).filter(Boolean))) as string[], [questions]);

  useEffect(() => {
    if (userIds.length === 0) return;
    
    let isMounted = true;
    
    (async () => {
      try {
        const query = supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);
        
        const { data, error } = await queryWithTimeout(query, 5000) as { data: any; error: any };
        
        if (isMounted && !error && data) {
          const authorMap: Record<string, string> = {};
          const profileMap: Record<string, Profile> = {};
          (data as Profile[]).forEach(p => {
            authorMap[p.id] = (p.full_name?.trim() || p.username?.trim() || strings.latestQuestions.anonymousUser);
            profileMap[p.id] = p;
          });
          setAuthors(authorMap);
          setAuthorProfiles(profileMap);
        }
      } catch (err) {
        console.error('Error fetching author profiles:', handleSupabaseError(err, 'Fetch author profiles'));
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [userIds]);

  useEffect(() => {
    if (!user || questions.length === 0) return;
    
    let isMounted = true;
    
    (async () => {
      try {
        const questionIds = questions.map(q => q.id);
        const query = supabase
          .from('user_reactions')
          .select('question_id')
          .eq('user_id', user.id)
          .eq('reaction_type', 'same_question')
          .in('question_id', questionIds);
        
        const { data, error } = await queryWithTimeout(query, 5000) as { data: any; error: any };
        
        if (isMounted && !error && data) {
          const map: Record<string, boolean> = {};
          data.forEach((r: { question_id: string }) => { map[r.question_id] = true; });
          setReactions(map);
        }
      } catch (err) {
        console.error('Error fetching user reactions:', handleSupabaseError(err, 'Fetch user reactions'));
      }
    })();
    
    return () => {
      isMounted = false;
    };
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
      {showClickableHeader ? (
        <Link 
          href="/questions" 
          className="text-sm sm:text-base font-bold mb-4 pl-2 text-accent hover:text-secondary transition-colors cursor-pointer flex items-center gap-2 group"
        >
          <span>{strings.latestQuestions.title}</span>
          <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
      ) : (
        <div className="text-sm sm:text-base font-bold mb-4 pl-2 text-accent">{strings.latestQuestions.title}</div>
      )}
      <ul className="space-y-2">
        {loading && <li className="card text-xs sm:text-sm">{strings.latestQuestions.loading}</li>}
        {!loading && questions.length === 0 && <li className="card text-xs sm:text-sm">{strings.latestQuestions.noQuestions}</li>}
        {!loading && questions.map((q) => (
          <li key={q.id} className="card hover-lift transition-shadow cursor-pointer text-xs sm:text-sm px-3 py-3 bg-light">
            <Link href={`/q/${q.id}`} className="block">
              <h3 className="font-semibold mb-1 text-primary" style={{fontSize:'0.9em'}}>{q.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-neutral">
                  {strings.latestQuestions.author}                   {q.user_id ? (
                    <Link 
                      href={authorProfiles[q.user_id]?.username ? `/${authorProfiles[q.user_id].username}` : `/user/${q.user_id}`}
                      className="text-accent hover:text-secondary transition-colors font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {authors[q.user_id] || '...'}
                    </Link>
                  ) : strings.latestQuestions.anonymousUser}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral opacity-60">
                  {timeAgo(q.created_at)}
                </span>
              </div>
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] text-neutral opacity-60">
                {q.same_count ? formatString(strings.latestQuestions.sameCount, { count: q.same_count }) : ''}
              </span>
              <div className={`${stackedButtons ? 'flex flex-col gap-1' : 'flex gap-1 sm:gap-2'}`}>
                {/* Answer Button - Primary action */}
                <Link 
                  href={`/q/${q.id}`}
                  className="btn px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] min-w-0"
                  title={strings.latestQuestions.buttons.answer}
                >
                  <span className="mr-1">💬</span>
                  <span className="hidden sm:inline">{strings.latestQuestions.buttons.answerText}</span>
                </Link>
                {/* Same Question Button - Secondary action */}
                <button
                  className={`btn-secondary px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] min-w-0 ${reactions[q.id] ? 'opacity-100' : 'opacity-90'} ${loadingReactions[q.id] ? 'opacity-50' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSame(q.id); }}
                  disabled={!user || loadingReactions[q.id]}
                  title={!user ? strings.latestQuestions.buttons.sameQuestionRequiresAuth : strings.latestQuestions.buttons.sameQuestion}
                  aria-label={!user ? strings.latestQuestions.buttons.sameQuestionRequiresAuth : reactions[q.id] ? strings.latestQuestions.buttons.sameQuestion : strings.latestQuestions.buttons.sameQuestion}
                  aria-pressed={reactions[q.id]}
                  aria-busy={loadingReactions[q.id]}
                >
                  {loadingReactions[q.id] ? '...' : (
                    <>
                      <span className="mr-1">🤝</span>
                      <span className="hidden sm:inline">
                        {reactions[q.id] ? strings.latestQuestions.buttons.sameQuestionActive : strings.latestQuestions.buttons.sameQuestion}
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