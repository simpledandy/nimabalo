import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface FormSubmissionState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

interface FormSubmissionOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormSubmission(options: FormSubmissionOptions = {}) {
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    error: null,
    success: false
  });

  const submit = useCallback(async (
    submissionFn: () => Promise<any>,
    successCallback?: () => void
  ) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null, success: false }));

    try {
      const result = await submissionFn();
      
      setState(prev => ({ ...prev, isSubmitting: false, success: true }));
      
      if (successCallback) {
        successCallback();
      }
      
      if (options.onSuccess) {
        options.onSuccess();
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || options.errorMessage || 'An error occurred';
      
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: errorMessage,
        success: false
      }));
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      error: null,
      success: false
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    submit,
    reset,
    clearError
  };
}

// Specific hook for Supabase operations
export function useSupabaseSubmission(options: FormSubmissionOptions = {}) {
  const formSubmission = useFormSubmission(options);

  const insert = useCallback(async (
    table: string,
    data: any,
    successCallback?: () => void
  ) => {
    return formSubmission.submit(async () => {
      const { error } = await supabase.from(table).insert(data);
      if (error) throw error;
      return { data: null, error: null };
    }, successCallback);
  }, [formSubmission]);

  const update = useCallback(async (
    table: string,
    data: any,
    filter: any,
    successCallback?: () => void
  ) => {
    return formSubmission.submit(async () => {
      const { error } = await supabase.from(table).update(data).match(filter);
      if (error) throw error;
      return { data: null, error: null };
    }, successCallback);
  }, [formSubmission]);

  const deleteRecord = useCallback(async (
    table: string,
    filter: any,
    successCallback?: () => void
  ) => {
    return formSubmission.submit(async () => {
      const { error } = await supabase.from(table).delete().match(filter);
      if (error) throw error;
      return { data: null, error: null };
    }, successCallback);
  }, [formSubmission]);

  return {
    ...formSubmission,
    insert,
    update,
    delete: deleteRecord
  };
}
