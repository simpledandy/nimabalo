"use client";

import Link from 'next/link';
import { strings } from '@/lib/strings';
import { timeAgo } from '@/lib/timeUtils';

type Question = { 
  id: string; 
  title: string; 
  body: string | null; 
  created_at: string; 
  user_id: string; 
  same_count?: number;
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
};

interface QuestionCardProps {
  question: Question;
  questionAuthor: Profile | null;
  hoveredElement: string | null;
  onMouseEnter: (elementId: string) => void;
  onMouseLeave: () => void;
}

export default function QuestionCard({ 
  question, 
  questionAuthor, 
  hoveredElement, 
  onMouseEnter, 
  onMouseLeave 
}: QuestionCardProps) {
  return (
    <div 
      className="card hover-lift relative overflow-hidden"
      onMouseEnter={() => onMouseEnter('question')}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute top-4 right-4 text-2xl opacity-20 animate-bounce-slow">❓</div>
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary leading-tight">
          {question.title}
        </h1>
        {question.body && (
          <div className="prose prose-lg max-w-none mb-4">
            <p className="text-neutral leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{question.body}</p>
          </div>
        )}
        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">📅</span>
            <span>{strings.question.askedTime} {timeAgo(question.created_at)}</span>
          </div>
          {questionAuthor && (
            <div className="flex items-center gap-2">
              <span className="animate-pulse">👤</span>
              <Link 
                href={questionAuthor.username ? `/${questionAuthor.username}` : `/user/${question.user_id}`}
                className="text-accent hover:text-secondary transition-colors font-medium"
              >
                {questionAuthor.full_name || questionAuthor.username || strings.profile.userProfile}
              </Link>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex justify-center gap-3 sm:gap-4 flex-wrap">
          {/* Same count information */}
          {question.same_count && question.same_count > 0 && (
            <div className="w-full text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20">
                <span className="text-lg">🤝</span>
                <span className="font-medium text-sm sm:text-base">
                  {question.same_count} kishiga ham qiziq
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
