'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { useToast } from '@/components/ToastContext';
import { useConfirmation } from '@/lib/useConfirmation';
import AppModal from './AppModal';

type Content = {
  id: string;
  title?: string;
  body: string | null;
  created_at: string;
  user_id: string;
  same_count?: number;
};

interface ContentActionsProps {
  content: Content;
  type: 'question' | 'answer';
  currentUserId?: string;
  onUpdated: (updated: any) => void;
  onDeleted: (id: string) => void;
}

export function ContentActions({ content, type, currentUserId, onUpdated, onDeleted }: ContentActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  if (!currentUserId || content.user_id !== currentUserId) return null;

  const handleDelete = () => {
    const isQuestion = type === 'question';
    confirm(
      async () => {
        setIsDeleting(true);
        try {
          const { error } = await supabase
            .from(isQuestion ? 'questions' : 'answers')
            .delete()
            .eq('id', content.id);

          if (error) throw error;
          onDeleted(content.id);
          addToast(isQuestion ? "Savol o'chirildi" : "Javob o'chirildi", 'success');
        } catch {
          addToast(isQuestion ? "Savolni o'chirishda xatolik" : "Javobni o'chirishda xatolik", 'error');
        } finally {
          setIsDeleting(false);
        }
      },
      {
        title: isQuestion ? strings.question.deleteConfirm.questionTitle : strings.question.deleteConfirm.answerTitle,
        message: isQuestion ? strings.question.deleteConfirm.questionMessage : strings.question.deleteConfirm.answerMessage,
        confirmText: strings.question.deleteConfirm.confirmDelete,
        cancelText: strings.question.deleteConfirm.cancelDelete,
        confirmButtonStyle: 'danger',
        icon: '⚠️'
      }
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setShowEditModal(true)} disabled={isDeleting} className="icon-btn text-accent hover:bg-accent/10" title={strings.question.actions.edit}>
          <span className="text-sm">✏️</span>
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="icon-btn text-error hover:bg-error/10" title={strings.question.actions.delete}>
          <span className="text-sm">{isDeleting ? '⏳' : '🗑️'}</span>
        </button>
      </div>
      <EditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} content={content} type={type} onUpdated={onUpdated} />
    </>
  );
}

function EditModal({ isOpen, onClose, content, type, onUpdated }: { isOpen: boolean; onClose: () => void; content: Content; type: 'question' | 'answer'; onUpdated: (updated: any) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (content) {
      setTitle(content.title || '');
      setBody(content.body || '');
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((type === 'question' && !title.trim()) || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const updates: Record<string, string> = { body: body.trim(), updated_at: new Date().toISOString() };
      if (type === 'question') updates.title = title.trim();

      const { error } = await supabase.from(type === 'question' ? 'questions' : 'answers').update(updates).eq('id', content.id);
      if (error) throw error;

      onUpdated({ ...content, ...updates });
      addToast(strings.question.editModal.updateSuccess, 'success');
      onClose();
    } catch {
      addToast(strings.question.editModal.updateError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon="✏️"
      title={type === 'question' ? strings.question.editModal.questionTitle : strings.question.actions.editAnswer}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'question' && (
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Savol sarlavhasi *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" disabled={isSubmitting} maxLength={200} />
            <p className="mt-1 text-xs text-neutral">{title.length}/200</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">{type === 'question' ? 'Savol matni *' : 'Javob matni *'}</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="textarea" disabled={isSubmitting} maxLength={2000} rows={type === 'question' ? 6 : 8} />
          <p className="mt-1 text-xs text-neutral">{body.length}/2000</p>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">{strings.question.actions.cancel}</button>
          <button type="submit" disabled={isSubmitting} className="btn">{isSubmitting ? strings.question.actions.saving : strings.question.actions.saveChanges}</button>
        </div>
      </form>
    </AppModal>
  );
}

