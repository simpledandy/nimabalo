"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { strings } from '@/lib/strings';
import LatestQuestions from './LatestQuestions';

interface AppSidebarProps {
  questions?: any[];
  loading?: boolean;
  onQuestionsUpdate?: (questions: any[]) => void;
  showAuthModal?: boolean;
  setShowAuthModal?: (show: boolean) => void;
  variant?: 'home' | 'feed';
  className?: string;
}

export default function AppSidebar({
  questions = [],
  loading = false,
  onQuestionsUpdate,
  showAuthModal = false,
  setShowAuthModal,
  variant = 'home',
  className = ""
}: AppSidebarProps) {
  const renderHomeSidebar = () => (
    <LatestQuestions 
      questions={questions} 
      loading={loading} 
      onQuestionsUpdate={onQuestionsUpdate!}
      showAuthModal={showAuthModal}
      setShowAuthModal={setShowAuthModal!}
      showClickableHeader={true}
      stackedButtons={true}
    />
  );

  const renderFeedSidebar = () => (
    <>
      {/* Ask Question Card */}
      <div className="card hover-lift text-center">
        <div className="text-4xl mb-4 animate-bounce-slow">🚀</div>
        <h3 className="text-xl font-bold text-primary mb-3">{strings.questionsFeed.askQuestionCard.title}</h3>
        <p className="text-neutral mb-4 text-sm">
          {strings.questionsFeed.askQuestionCard.description}
        </p>
        <Link href="/" className="btn w-full">
          {strings.questionsFeed.askQuestionCard.button}
        </Link>
      </div>

      {/* Stats Card */}
      <div className="card hover-lift">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-primary">{strings.questionsFeed.stats.title}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-neutral">{strings.questionsFeed.stats.totalQuestions}</span>
            <span className="font-bold text-accent">{questions.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral">{strings.questionsFeed.stats.today}</span>
            <span className="font-bold text-secondary">
              {questions.filter(q => {
                const today = new Date().toDateString();
                return new Date(q.created_at).toDateString() === today;
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="card hover-lift">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h3 className="text-lg font-bold text-primary">{strings.questionsFeed.tips.title}</h3>
        </div>
        <div className="space-y-2 text-sm text-neutral">
          {strings.questionsFeed.tips.tips.map((tip, index) => (
            <p key={index}>• {tip}</p>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed right-0 h-full w-80 px-4 pt-4 z-30 bg-white/95 shadow-2xl animate-fade-in-right ${className}`}>
        <div className="h-full overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {variant === 'home' ? renderHomeSidebar() : renderFeedSidebar()}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden px-4 pb-8 ${className}`}>
        <div className="max-w-xl mx-auto space-y-6">
          {variant === 'home' ? renderHomeSidebar() : renderFeedSidebar()}
        </div>
      </div>
    </>
  );
}