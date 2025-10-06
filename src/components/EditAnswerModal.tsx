'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { useToast } from '@/components/ToastContext';

type Answer = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
};

interface EditAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: Answer;
  onAnswerUpdated: (updatedAnswer: Answer) => void;
}

export default function EditAnswerModal({
  isOpen,
  onClose,
  answer,
  onAnswerUpdated
}: EditAnswerModalProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ body?: string }>({});
  const { addToast } = useToast();

  // Initialize form with answer data
  useEffect(() => {
    if (answer) {
      setBody(answer.body || '');
      setErrors({});
    }
  }, [answer]);

  const validateForm = () => {
    const newErrors: { body?: string } = {};

    if (!body.trim()) {
      newErrors.body = strings.question.editModal.bodyRequired;
    } else if (body.trim().length < 3) {
      newErrors.body = strings.question.editModal.bodyTooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await supabase
        .from('answers')
        .update({
          body: body.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', answer.id);

      if (error) {
        throw error;
      }

      // Update the answer object and notify parent
      const updatedAnswer = {
        ...answer,
        body: body.trim()
      };

      onAnswerUpdated(updatedAnswer);
      addToast(strings.question.editModal.updateSuccess, 'success');
      onClose();
    } catch (error: any) {
      console.error('Error updating answer:', error);
      addToast(strings.question.editModal.updateError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✏️</div>
              <h2 className="text-xl font-semibold text-primary">
                {strings.question.actions.editAnswer}
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="icon-btn text-neutral hover:text-primary"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Body Field */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-primary mb-2">
                Javob matni *
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={strings.question.editModal.answerBodyPlaceholder}
                className={`textarea ${errors.body ? 'border-error' : ''}`}
                disabled={isSubmitting}
                maxLength={2000}
                rows={8}
              />
              {errors.body && (
                <p className="mt-1 text-sm text-error">{errors.body}</p>
              )}
              <p className="mt-1 text-xs text-neutral">
                {body.length}/2000 belgi
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-secondary"
              >
                {strings.question.actions.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn"
              >
                {isSubmitting ? strings.question.actions.saving : strings.question.actions.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}