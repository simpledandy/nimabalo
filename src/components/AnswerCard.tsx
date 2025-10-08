"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { timeAgo } from '@/lib/timeUtils';
import AnswerPreview from './AnswerPreview';
import { ContentActions } from './ContentActions';

type Answer = { 
  id: string; 
  body: string; 
  created_at: string; 
  user_id: string; 
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
};

interface AnswerCardProps {
  answer: Answer;
  index: number;
  sortBy: 'newest' | 'oldest' | 'longest' | 'shortest';
  hoveredElement: string | null;
  onMouseEnter: (elementId: string) => void;
  onMouseLeave: () => void;
  currentUserId?: string;
  onAnswerUpdated?: (updatedAnswer: Answer) => void;
  onAnswerDeleted?: (answerId: string) => void;
}

export default function AnswerCard({ 
  answer, 
  index, 
  sortBy, 
  hoveredElement, 
  onMouseEnter, 
  onMouseLeave,
  currentUserId,
  onAnswerUpdated,
  onAnswerDeleted
}: AnswerCardProps) {
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);

  useEffect(() => {
    if (!answer.user_id) {
      setLoadingAuthor(false);
      return;
    }

    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', answer.user_id)
          .single();
        
        if (data) {
          setAuthorProfile(data);
        }
      } catch (error) {
        console.error('Error fetching answer author:', error);
      } finally {
        setLoadingAuthor(false);
      }
    })();
  }, [answer.user_id]);

  const getAuthorDisplayName = () => {
    if (loadingAuthor) return '...';
    if (!authorProfile) return strings.latestQuestions.anonymousUser;
    return authorProfile.full_name || authorProfile.username || strings.latestQuestions.anonymousUser;
  };

  const getAuthorLink = () => {
    if (!authorProfile) return `/user/${answer.user_id}`;
    return authorProfile.username ? `/${authorProfile.username}` : `/user/${answer.user_id}`;
  };

  return (
    <div
      className={`card hover-lift relative overflow-hidden transition-all duration-300 ${
        hoveredElement === `answer-${answer.id}` ? 'scale-[1.02] shadow-lg' : ''
      }`}
      onMouseEnter={() => onMouseEnter(`answer-${answer.id}`)}
      onMouseLeave={onMouseLeave}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Answer number badge */}
      <div className="absolute top-4 left-4 bg-accent text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-md animate-scale-in">
        #{index + 1}
        {sortBy === 'longest' && answer.body.length > 200 && (
          <span className="ml-1 text-warm">⭐</span>
        )}
        {sortBy === 'newest' && (
          <span className="ml-1 text-success">🆕</span>
        )}
      </div>
      <div className="absolute top-4 right-4 text-xl opacity-20 animate-bounce-slow">💭</div>
      <div className="relative z-10 pt-8">
        <div className="mb-4">
          <AnswerPreview text={answer.body} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-neutral pt-3 border-t border-gray-100 gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⏰</span>
            <span>{strings.question.answerTime} {timeAgo(answer.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <span className="text-accent">👤</span>
              <Link 
                href={getAuthorLink()}
                className="text-accent hover:text-secondary transition-colors font-medium"
              >
                {getAuthorDisplayName()}
              </Link>
            </div>
            {/* Edit/Delete Actions */}
            {currentUserId && onAnswerUpdated && onAnswerDeleted && (
              <ContentActions
                content={answer}
                type="answer"
                currentUserId={currentUserId}
                onUpdated={onAnswerUpdated}
                onDeleted={onAnswerDeleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
