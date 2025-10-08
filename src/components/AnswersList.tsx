"use client";

import { useState, useEffect } from 'react';
import { strings, formatString } from '@/lib/strings';
import AnswerCard from './AnswerCard';
import AnswerSorting from './AnswerSorting';

type Answer = { 
  id: string; 
  body: string; 
  created_at: string; 
  user_id: string; 
};

interface AnswersListProps {
  answers: Answer[];
  hoveredElement: string | null;
  onMouseEnter: (elementId: string) => void;
  onMouseLeave: () => void;
  currentUserId?: string;
  onAnswerUpdated?: (updatedAnswer: Answer) => void;
  onAnswerDeleted?: (answerId: string) => void;
}

export default function AnswersList({ 
  answers, 
  hoveredElement, 
  onMouseEnter, 
  onMouseLeave,
  currentUserId,
  onAnswerUpdated,
  onAnswerDeleted
}: AnswersListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest' | 'shortest'>('newest');
  const [sortAnimation, setSortAnimation] = useState(false);

  // Trigger sort animation when sort changes
  useEffect(() => {
    if (answers.length > 1) {
      setSortAnimation(true);
      setTimeout(() => setSortAnimation(false), 500);
    }
  }, [sortBy, answers.length]);

  // Sort answers based on current sort option
  const sortedAnswers = [...answers].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'longest':
        return b.body.length - a.body.length;
      case 'shortest':
        return a.body.length - b.body.length;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-primary">{strings.question.answers}</h2>
          <div className="bg-accent px-2 sm:px-3 py-1 rounded-full text-white font-medium flex items-center gap-1 transition-all duration-300 animate-scale-in">
            <span className="animate-bounce-slow">💬</span>
            <span className="font-bold text-sm sm:text-base">{answers.length}</span>
          </div>
        </div>
        {answers.length > 1 && (
          <div className={`transition-all duration-300 ${sortAnimation ? 'scale-110' : 'scale-100'}`}>
            <AnswerSorting onSortChange={setSortBy} currentSort={sortBy} />
          </div>
        )}
        {sortAnimation && (
          <div className="absolute -top-2 -right-2 bg-success text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce-slow z-10 shadow-lg">
            {strings.answerSorting.sorted}
          </div>
        )}
      </div>
      
      {answers.length > 0 && (
        <div className="text-xs sm:text-sm text-neutral flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span>{formatString(strings.question.totalAnswers, { count: answers.length })}</span>
          </div>
        </div>
      )}
      
      {answers.length === 0 ? (
        <div className="card text-center py-12 sm:py-16 animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="text-6xl sm:text-8xl mb-6 animate-bounce-slow">🤷‍♂️</div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">{strings.question.noAnswers}</h3>
            <p className="text-neutral mb-6 text-base sm:text-lg">{strings.question.noAnswersSubtitle}</p>
          </div>
        </div>
      ) : (
        <div className={`space-y-4 transition-all duration-300 ${
          sortAnimation ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          {sortedAnswers.map((answer, index) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              index={index}
              sortBy={sortBy}
              hoveredElement={hoveredElement}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              currentUserId={currentUserId}
              onAnswerUpdated={onAnswerUpdated}
              onAnswerDeleted={onAnswerDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
