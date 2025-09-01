"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';

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
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);

  const handleSameQuestion = async () => {
    if (!user) {
      // Redirect to auth or show login prompt
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);
    try {
      // First, check if user already reacted
      const { data: existingReaction } = await supabase
        .from('user_reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .eq('reaction_type', 'same_question')
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('user_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        setHasReacted(false);
        onSameCountChange(sameCount - 1);
      } else {
        // Add reaction
        await supabase
          .from('user_reactions')
          .insert({
            user_id: user.id,
            question_id: questionId,
            reaction_type: 'same_question'
          });
        
        setHasReacted(true);
        onSameCountChange(sameCount + 1);
      }
    } catch (error) {
      console.error('Error updating same question reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSameQuestion}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
        hasReacted 
          ? 'bg-sky-500 text-white shadow-lg' 
          : 'bg-sky-100 text-sky-600 hover:bg-sky-200'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span className={`text-lg ${hasReacted ? 'animate-bounce-slow' : ''}`}>
        {hasReacted ? '👍' : '🤔'}
      </span>
      <span>
        {hasReacted ? 'Siz ham so‘radingiz!' : 'Men ham so‘rayman'}
      </span>
      {sameCount > 0 && (
        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold">
          {sameCount}
        </span>
      )}
    </button>
  );
}
