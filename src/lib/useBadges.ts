"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useSession } from './useSession';
import { BadgeType } from '@/components/BadgeModal';

interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  awarded_at: string;
}

export function useBadges() {
  const { user } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeType | null>(null);

  // Fetch user badges
  const fetchBadges = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });
      
      if (!error && data) {
        setBadges(data);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check for new badges based on user actions
  const checkForNewBadges = useCallback(async () => {
    if (!user) return;

    try {
      // Check for nth_user badge - award to all new users
      const hasNthUserBadge = badges.some(b => b.badge_type === 'nth_user');
      if (!hasNthUserBadge) {
        setNewBadge('nth_user');
        return;
      }

      // TODO: Re-enable other badge checks later
      /*
      // Check for first question badge
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('user_id', user.id);
      
      if (questions && questions.length === 1) {
        const hasFirstQuestionBadge = badges.some(b => b.badge_type === 'first_question');
        if (!hasFirstQuestionBadge) {
          setNewBadge('first_question');
          return;
        }
      }

      // Check for early adopter badges based on user count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (totalUsers !== null) {
        if (totalUsers <= 5) {
          const hasEarlyAdopterBadge = badges.some(b => b.badge_type === 'early_adopter_2_5');
          if (!hasEarlyAdopterBadge) {
            setNewBadge('early_adopter_2_5');
            return;
          }
        } else if (totalUsers <= 10) {
          const hasEarlyAdopterBadge = badges.some(b => b.badge_type === 'early_adopter_6_10');
          if (!hasEarlyAdopterBadge) {
            setNewBadge('early_adopter_6_10');
            return;
          }
        } else if (totalUsers <= 50) {
          const hasEarlyAdopterBadge = badges.some(b => b.badge_type === 'early_adopter_11_50');
          if (!hasEarlyAdopterBadge) {
            setNewBadge('early_adopter_11_50');
            return;
          }
        }
      }

      // Check for question master badge
      if (questions && questions.length >= 100) {
        const hasQuestionMasterBadge = badges.some(b => b.badge_type === 'question_master_100');
        if (!hasQuestionMasterBadge) {
          setNewBadge('question_master_100');
          return;
        }
      }

      // Check for answer hero badge
      const { data: answers } = await supabase
        .from('answers')
        .select('id')
        .eq('user_id', user.id);
      
      if (answers && answers.length >= 50) {
        const hasAnswerHeroBadge = badges.some(b => b.badge_type === 'answer_hero_50');
        if (!hasAnswerHeroBadge) {
          setNewBadge('answer_hero_50');
          return;
        }
      }
      */

    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  }, [user, badges]);

  // Award a badge (this would typically be done by database triggers)
  const awardBadge = useCallback(async (badgeType: BadgeType) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('badges')
        .insert({
          user_id: user.id,
          badge_type: badgeType
        })
        .select()
        .single();

      if (!error && data) {
        setBadges(prev => [data, ...prev]);
        setNewBadge(badgeType);
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }, [user]);

  // Clear new badge notification
  const clearNewBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  // Initial fetch and periodic checks
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (user && badges.length > 0) {
      checkForNewBadges();
    }
  }, [user, badges.length, checkForNewBadges]);

  return {
    badges,
    loading,
    newBadge,
    fetchBadges,
    awardBadge,
    clearNewBadge,
    checkForNewBadges
  };
}
