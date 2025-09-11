"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import AuthModal from './AuthModal';

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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user has already reacted when component mounts
  useEffect(() => {
    if (!user) return;
    
    const checkReaction = async () => {
      const { data } = await supabase
        .from('user_reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .eq('reaction_type', 'same_question')
        .single();
      
      setHasReacted(!!data);
    };
    
    checkReaction();
  }, [user, questionId]);

  const handleSameQuestion = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('user_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .eq('reaction_type', 'same_question');
        
        if (!error) {
          setHasReacted(false);
          onSameCountChange(sameCount - 1);
        }
      } else {
        // Add reaction
        const { error } = await supabase
          .from('user_reactions')
          .insert({
            user_id: user.id,
            question_id: questionId,
            reaction_type: 'same_question'
          });
        
        if (!error) {
          setHasReacted(true);
          onSameCountChange(sameCount + 1);
        }
      }
    } catch (error) {
      console.error('Error updating same question reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSameQuestion}
        disabled={isLoading}
        className={`btn-secondary px-3 py-1 text-[11px] ${hasReacted ? 'opacity-100' : 'opacity-90'} ${isLoading ? 'opacity-50' : ''}`}
        title={"Xuddi shu savol menda ham bor"}
        aria-label={hasReacted ? "Sizda ham xuddi shu savol bor" : "Menda ham xuddi shu savol bor"}
        aria-pressed={hasReacted}
        aria-busy={isLoading}
      >
        {isLoading ? '...' : (hasReacted ? 'Menda ham shu savol ✓' : 'Menda ham shu savol')}
      </button>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Savolga munosabat bildirish uchun tizimga kiring"
      />
    </>
  );
}
