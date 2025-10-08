"use client";

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { handleSupabaseError } from './supabaseUtils';

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const result = await supabase
          .from('questions')
          .select('id,title,body,created_at,user_id,same_count')
          .order('created_at', { ascending: false });
        
        const { data, error } = result;
        
        if (isMounted) {
          if (error) {
            console.error('Error fetching questions:', handleSupabaseError(error, 'Fetch questions'));
            setError('Failed to load questions');
          } else if (data) {
            setQuestions(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching questions:', handleSupabaseError(err, 'Fetch questions'));
        if (isMounted) {
          setError('Failed to load questions');
          setLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id,title,body,created_at,user_id,same_count')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error refreshing questions:', err);
    }
  };

  return { questions, loading, error, setQuestions, refreshQuestions };
}
