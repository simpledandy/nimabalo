"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import AppModal from './AppModal';

type Answer = { 
  id: string; 
  body: string; 
  created_at: string; 
  user_id: string; 
};

interface AnswerFormProps {
  user: { id: string } | null;
  questionId: string;
  onAnswerPosted: (answers: Answer[]) => void;
  onShowConfetti: () => void;
}

export default function AnswerForm({ user, questionId, onAnswerPosted, onShowConfetti }: AnswerFormProps) {
  const [answerText, setAnswerText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  async function postAnswer() {
    if (!user) return;
    setPosting(true);
    setErr('');
    try {
      const body = answerText.trim();
      if (body.length < 2) throw new Error(strings.question.errors.answerTooShort);
      const { error } = await supabase.from('answers').insert({
        question_id: questionId,
        user_id: user.id,
        body,
      });
      if (error) throw error;
      setAnswerText('');
      // Show celebration effects!
      onShowConfetti();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });
      if (data) {
        onAnswerPosted(data);
      }
    } catch (e) {
      const error = e as Error;
      setErr(error.message ?? strings.question.errors.answerSubmitError);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card space-y-4 hover-lift">
      <div className="flex items-center gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-primary">{strings.question.writeAnswer}</h3>
        <span className="text-2xl animate-bounce-slow">✍️</span>
      </div>
      
      {!user ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-4xl mb-4 animate-bounce-slow">💭</div>
          <p className="text-base sm:text-lg text-neutral mb-4">{strings.question.showKnowledge}</p>
          <div className="space-y-4">
            <textarea
              className="textarea min-h-[120px] text-base sm:text-lg"
              placeholder={strings.question.answerPlaceholder}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              style={{
                transform: answerText ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            />
            <button
              onClick={() => setShowAuthModal(true)}
              disabled={answerText.trim().length < 2}
              className="btn w-full text-base sm:text-lg py-3 sm:py-4 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="animate-bounce-slow">🚀</span>
              {strings.question.answerButton}
            </button>
            <div className="text-center text-accent text-sm opacity-70">
              {strings.question.answerTip}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <textarea
              className="textarea min-h-[120px] text-base sm:text-lg"
              placeholder={strings.question.answerPlaceholder}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              style={{
                transform: answerText ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            />
            {/* Character counter */}
            <div className="absolute bottom-3 right-3 text-xs sm:text-sm text-accent font-medium">
              {answerText.length} {answerText.length > 500 ? '🚨' : answerText.length > 200 ? '📝' : '✍️'}
            </div>
          </div>
          
          {err && (
            <div className="text-error text-base sm:text-lg animate-shake bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2">
              <span>⚠️</span>
              {err}
            </div>
          )}

          {/* Success message */}
          {showSuccess && (
            <div className="text-center text-success text-base sm:text-lg font-medium animate-fade-in-up bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-center gap-2">
              <span className="animate-bounce-slow">🎉</span>
              {strings.question.answerSuccess}
            </div>
          )}

          <button
            onClick={postAnswer}
            disabled={posting || answerText.trim().length < 2}
            className="btn w-full text-base sm:text-lg py-3 sm:py-4 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: posting || answerText.trim().length < 2 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            }}
          >
            {posting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {strings.question.answerSubmitting}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-bounce-slow">🚀</span>
                {strings.question.answerButton}
              </span>
            )}
          </button>

          {/* Helpful tip */}
          {!answerText && !posting && (
            <div className="text-center text-accent text-sm opacity-70 animate-pulse">
              {strings.question.answerTip}
            </div>
          )}
        </>
      )}

      {/* Auth Modal */}
      <AppModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        icon="🔐"
        title={strings.authModal.titles.answerQuestion}
        subtitle={strings.authModal.messages.answerQuestion}
      >
        <div className="flex flex-col gap-3 w-full">
          <a 
            href="/auth" 
            className="btn w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            <span className="mr-2">🔑</span>
            Tizimga kirish
          </a>
          <a 
            href="/auth?signup=1" 
            className="btn-secondary w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            <span className="mr-2">✨</span>
            Ro'yxatdan o'tish
          </a>
        </div>
      </AppModal>
    </div>
  );
}
