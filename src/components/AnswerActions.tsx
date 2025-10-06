'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { useToast } from '@/components/ToastContext';
import { useConfirmation } from '@/lib/useConfirmation';
import EditAnswerModal from './EditAnswerModal';

type Answer = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
};

interface AnswerActionsProps {
  answer: Answer;
  currentUserId: string;
  onAnswerUpdated: (updatedAnswer: Answer) => void;
  onAnswerDeleted: (answerId: string) => void;
  className?: string;
}

export default function AnswerActions({
  answer,
  currentUserId,
  onAnswerUpdated,
  onAnswerDeleted,
  className = ""
}: AnswerActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  // Only show actions if user owns the answer
  if (answer.user_id !== currentUserId) {
    return null;
  }

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    confirm(
      async () => {
        setIsDeleting(true);
        try {
          const { error } = await supabase
            .from('answers')
            .delete()
            .eq('id', answer.id);

          if (error) {
            throw error;
          }

          onAnswerDeleted(answer.id);
          addToast("Javob muvaffaqiyatli o'chirildi", 'success');
        } catch (error: any) {
          console.error('Error deleting answer:', error);
          addToast("Javobni o'chirishda xatolik yuz berdi", 'error');
        } finally {
          setIsDeleting(false);
        }
      },
      {
        title: strings.question.deleteConfirm.answerTitle,
        message: strings.question.deleteConfirm.answerMessage,
        confirmText: strings.question.deleteConfirm.confirmDelete,
        cancelText: strings.question.deleteConfirm.cancelDelete,
        confirmButtonStyle: 'danger',
        icon: '⚠️'
      }
    );
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={handleEdit}
          disabled={isDeleting}
          className="icon-btn text-accent hover:bg-accent/10 hover:text-accent"
          title={strings.question.actions.editAnswer}
        >
          <span className="text-sm">✏️</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="icon-btn text-error hover:bg-error/10 hover:text-error"
          title={strings.question.actions.deleteAnswer}
        >
          <span className="text-sm">{isDeleting ? '⏳' : '🗑️'}</span>
        </button>
      </div>

      <EditAnswerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        answer={answer}
        onAnswerUpdated={onAnswerUpdated}
      />
    </>
  );
}
