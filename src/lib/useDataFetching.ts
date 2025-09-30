import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { queryWithTimeout, handleSupabaseError } from '@/lib/supabaseUtils';

interface DataFetchingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface FetchOptions {
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useDataFetching<T = any>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
) {
  const [state, setState] = useState<DataFetchingState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (options.enabled === false) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      
      setState(prev => ({ ...prev, data, loading: false, error: null }));
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error, 'Data fetch');
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      if (options.onError) {
        options.onError(errorMessage);
      }
    }
  }, [fetchFn, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: true,
      error: null
    });
  }, []);

  return {
    ...state,
    refetch,
    reset
  };
}

// Specific hook for Supabase queries
export function useSupabaseQuery<T = any>(
  queryFn: () => any,
  options: FetchOptions = {}
) {
  return useDataFetching<T>(async () => {
    const query = queryFn();
    const result = await queryWithTimeout(query, options.timeout || 8000) as { data: T; error: any };
    const { data, error } = result;
    
    if (error) {
      throw error;
    }
    
    return data;
  }, options);
}

// Hook for fetching questions
export function useQuestions(options: FetchOptions = {}) {
  return useSupabaseQuery(
    () => supabase
      .from('questions')
      .select('id,title,body,created_at,user_id,same_count')
      .order('created_at', { ascending: false }),
    options
  );
}

// Hook for fetching user profile
export function useUserProfile(userId: string, options: FetchOptions = {}) {
  return useSupabaseQuery(
    () => supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    { ...options, enabled: !!userId }
  );
}

// Hook for fetching question details
export function useQuestionDetails(questionId: string, options: FetchOptions = {}) {
  return useSupabaseQuery(
    () => supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single(),
    { ...options, enabled: !!questionId }
  );
}

// Hook for fetching answers
export function useAnswers(questionId: string, options: FetchOptions = {}) {
  return useSupabaseQuery(
    () => supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false }),
    { ...options, enabled: !!questionId }
  );
}
