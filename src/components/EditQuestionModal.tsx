'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { useToast } from '@/components/ToastContext';

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id: string;
};

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onQuestionUpdated: (updatedQuestion: Question) => void;
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  onQuestionUpdated
}: EditQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const { addToast } = useToast();

  // Initialize form with question data
  useEffect(() => {
    if (question) {
      setTitle(question.title || '');
      setBody(question.body || '');
      setErrors({});
    }
  }, [question]);

  const validateForm = () => {
    const newErrors: { title?: string; body?: string } = {};

    if (!title.trim()) {
      newErrors.title = strings.question.editModal.titleRequired;
    } else if (title.trim().length < 3) {
      newErrors.title = strings.question.editModal.titleTooShort;
    }

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
        .from('questions')
        .update({
          title: title.trim(),
          body: body.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id);

      if (error) {
        throw error;
      }

      // Update the question object and notify parent
      const updatedQuestion = {
        ...question,
        title: title.trim(),
        body: body.trim() || null
      };

      onQuestionUpdated(updatedQuestion);
      addToast(strings.question.editModal.updateSuccess, 'success');
      onClose();
    } catch (error: any) {
      console.error('Error updating question:', error);
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
                {strings.question.editModal.questionTitle}
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
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-primary mb-2">
                Savol sarlavhasi *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={strings.question.editModal.questionTitlePlaceholder}
                className={`input ${errors.title ? 'border-error' : ''}`}
                disabled={isSubmitting}
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-neutral">
                {title.length}/200 belgi
              </p>
            </div>

            {/* Body Field */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-primary mb-2">
                Savol matni *
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={strings.question.editModal.questionBodyPlaceholder}
                className={`textarea ${errors.body ? 'border-error' : ''}`}
                disabled={isSubmitting}
                maxLength={2000}
                rows={6}
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