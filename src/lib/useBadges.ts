"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useSession } from './useSession';

interface Badge {
  id: string;
  user_id: string;
  badge_type: 'nth_user';
  awarded_at: string;
}

export function useBadges() {
  const { user } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState<boolean>(false);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [hasSeenBadge, setHasSeenBadge] = useState<boolean>(false);

  // Fetch user badges and position
  const fetchBadges = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user position
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', profile.created_at);
        
        setUserPosition(count || 0);
      }

      // Check if user has nth_user badge
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_type', 'nth_user')
        .single();
      
      if (!error && data) {
        setBadges([data]);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Award nth_user badge (only for new users)
  const awardBadge = useCallback(async () => {
    if (!user) return;

    try {
      // Check if badge already exists
      const { data: existingBadge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_type', 'nth_user')
        .single();

      if (existingBadge) {
        // Badge already exists, don't show modal
        setBadges([existingBadge]);
        return;
      }

      // Check if user has seen badge before (localStorage)
      const hasSeenBadgeKey = `badge-seen-${user.id}`;
      const hasSeenBefore = localStorage.getItem(hasSeenBadgeKey);
      
      if (hasSeenBefore) {
        // User has seen badge before, don't show modal
        return;
      }

      // Create new badge and show modal only for truly new users
      const { data, error } = await supabase
        .from('badges')
        .insert({
          user_id: user.id,
          badge_type: 'nth_user'
        })
        .select()
        .single();

      if (!error && data) {
        setBadges([data]);
        setNewBadge(true);
        setHasSeenBadge(true);
        // Mark as seen in localStorage
        localStorage.setItem(hasSeenBadgeKey, 'true');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }, [user]);

  // Check for new badges based on user actions
  const checkForNewBadges = useCallback(async () => {
    if (!user) return;

    try {
      // Check for nth_user badge - award to all new users
      const hasNthUserBadge = badges.some(b => b.badge_type === 'nth_user');
      if (!hasNthUserBadge) {
        // Award the badge first, then show the modal
        await awardBadge();
        return;
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  }, [user, badges, awardBadge]);

  // Clear new badge notification
  const clearNewBadge = useCallback(() => {
    setNewBadge(false);
    if (user) {
      const hasSeenBadgeKey = `badge-seen-${user.id}`;
      localStorage.setItem(hasSeenBadgeKey, 'true');
    }
  }, [user]);

  // Initial fetch and periodic checks
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (user && badges.length === 0) {
      checkForNewBadges();
    }
  }, [user, badges.length, checkForNewBadges]);

  // Check if user has unread notifications (badges)
  const hasUnreadNotifications = useCallback(() => {
    return badges.length > 0 && !hasSeenBadge;
  }, [badges.length, hasSeenBadge]);

  return {
    badges,
    loading,
    newBadge,
    userPosition,
    hasSeenBadge,
    hasUnreadNotifications: hasUnreadNotifications(),
    fetchBadges,
    awardBadge,
    clearNewBadge,
    checkForNewBadges
  };
}
