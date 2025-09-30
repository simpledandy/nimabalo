"use client";

import { useState } from 'react';
import { useReactions } from '@/lib/useReactions';
import AuthModal from './AuthModal';
import { strings } from '@/lib/strings';

interface SameQuestionButtonProps {
  questionId: string;
  sameCount: number;
  onSameCountChange: (newCount: number) => void;
}

export default function SameQuestionButton({ 
  questionId, 
  sameCount, 
  onSameCountChange 
}: SameQuestionButtonProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { 
    hasReacted, 
    isLoading, 
    count, 
    toggleReaction, 
    canReact 
  } = useReactions({
    questionId,
    reactionType: 'same_question',
    initialCount: sameCount
  });

  const handleSameQuestion = async () => {
    if (!canReact) {
      setShowAuthModal(true);
      return;
    }

    await toggleReaction();
    // Update parent component with new count
    onSameCountChange(count + (hasReacted ? -1 : 1));
  };

  return (
    <>
      <button
        onClick={handleSameQuestion}
        disabled={isLoading}
        className={`btn-secondary px-3 py-1 text-[11px] ${hasReacted ? 'opacity-100' : 'opacity-90'} ${isLoading ? 'opacity-50' : ''}`}
        title={strings.latestQuestions.tooltips.sameQuestion}
        aria-label={hasReacted ? strings.latestQuestions.tooltips.sameQuestion : strings.latestQuestions.tooltips.sameQuestion}
        aria-pressed={hasReacted}
        aria-busy={isLoading}
      >
        {isLoading ? strings.latestQuestions.buttons.sameQuestionLoading : (hasReacted ? strings.latestQuestions.buttons.sameQuestionActive : strings.latestQuestions.buttons.sameQuestion)}
      </button>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={strings.latestQuestions.tooltips.sameQuestionRequiresAuth}
      />
    </>
  );
}
