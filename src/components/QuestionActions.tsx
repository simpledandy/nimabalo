'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { useToast } from '@/components/ToastContext';
import { useConfirmation } from '@/lib/useConfirmation';
import EditQuestionModal from './EditQuestionModal';

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id: string;
};

interface QuestionActionsProps {
  question: Question;
  currentUserId: string;
  onQuestionUpdated: (updatedQuestion: Question) => void;
  onQuestionDeleted: (questionId: string) => void;
  className?: string;
}

export default function QuestionActions({
  question,
  currentUserId,
  onQuestionUpdated,
  onQuestionDeleted,
  className = ""
}: QuestionActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  // Only show actions if user owns the question
  if (question.user_id !== currentUserId) {
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
            .from('questions')
            .delete()
            .eq('id', question.id);

          if (error) {
            throw error;
          }

          onQuestionDeleted(question.id);
          addToast("Savol muvaffaqiyatli o'chirildi", 'success');
        } catch (error: any) {
          console.error('Error deleting question:', error);
          addToast("Savolni o'chirishda xatolik yuz berdi", 'error');
        } finally {
          setIsDeleting(false);
        }
      },
      {
        title: strings.question.deleteConfirm.questionTitle,
        message: strings.question.deleteConfirm.questionMessage,
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
          title={strings.question.actions.editQuestion}
        >
          <span className="text-sm">✏️</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="icon-btn text-error hover:bg-error/10 hover:text-error"
          title={strings.question.actions.deleteQuestion}
        >
          <span className="text-sm">{isDeleting ? '⏳' : '🗑️'}</span>
        </button>
      </div>

      <EditQuestionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        question={question}
        onQuestionUpdated={onQuestionUpdated}
      />
    </>
  );
}