import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseSubmission } from './useFormSubmission';

interface ReactionState {
  hasReacted: boolean;
  isLoading: boolean;
  count: number;
}

interface UseReactionsOptions {
  questionId: string;
  reactionType?: string;
  initialCount?: number;
}

export function useReactions({
  questionId,
  reactionType = 'same_question',
  initialCount = 0
}: UseReactionsOptions) {
  const { user } = useSession();
  const [state, setState] = useState<ReactionState>({
    hasReacted: false,
    isLoading: false,
    count: initialCount
  });

  const { insert, delete: deleteRecord } = useSupabaseSubmission({
    errorMessage: 'Failed to update reaction'
  });

  // Check if user has already reacted when component mounts
  useEffect(() => {
    if (!user || !questionId) return;
    
    const checkReaction = async () => {
      const { data } = await supabase
        .from('user_reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .eq('reaction_type', reactionType)
        .single();
      
      setState(prev => ({ ...prev, hasReacted: !!data }));
    };
    
    checkReaction();
  }, [user, questionId, reactionType]);

  const toggleReaction = useCallback(async () => {
    if (!user) {
      // Could trigger auth modal here
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (state.hasReacted) {
        // Remove reaction
        await deleteRecord('user_reactions', {
          user_id: user.id,
          question_id: questionId,
          reaction_type: reactionType
        });
        
        setState(prev => ({ 
          ...prev, 
          hasReacted: false, 
          count: prev.count - 1,
          isLoading: false
        }));
      } else {
        // Add reaction
        await insert('user_reactions', {
          user_id: user.id,
          question_id: questionId,
          reaction_type: reactionType
        });
        
        setState(prev => ({ 
          ...prev, 
          hasReacted: true, 
          count: prev.count + 1,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Error updating reaction:', error);
    }
  }, [user, questionId, reactionType, state.hasReacted, insert, deleteRecord]);

  const updateCount = useCallback((newCount: number) => {
    setState(prev => ({ ...prev, count: newCount }));
  }, []);

  return {
    ...state,
    toggleReaction,
    updateCount,
    canReact: !!user
  };
}
