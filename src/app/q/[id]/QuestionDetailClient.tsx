'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { strings } from '@/lib/strings';
import ConfettiEffect from '@/components/ConfettiEffect';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import QuestionCard from '@/components/QuestionCard';
import AnswersList from '@/components/AnswersList';
import AnswerForm from '@/components/AnswerForm';

type Question = { 
  id: string; 
  title: string; 
  body: string | null; 
  created_at: string; 
  user_id: string; 
  same_count?: number;
};

type Answer = { 
  id: string; 
  body: string; 
  created_at: string; 
  user_id: string; 
};

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

interface QuestionDetailClientProps {
  question: Question;
  initialAnswers: Answer[];
  questionAuthor: Profile | null;
  questionId: string;
}

export default function QuestionDetailClient({ 
  question, 
  initialAnswers, 
  questionAuthor, 
  questionId 
}: QuestionDetailClientProps) {
  const { user } = useSession();
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const handleAnswerPosted = (newAnswers: Answer[]) => {
    setAnswers(newAnswers);
  };

  const handleShowConfetti = () => {
    setShowConfetti(true);
  };

  return (
    <>
      {/* Confetti celebration effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      <div className="container mx-auto px-4 py-6 sm:py-8 pt-28 sm:pt-32 max-w-4xl">
        {/* Back to Questions Button */}
        <div className="mb-6 animate-fade-in-up">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-light text-primary rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <span className="text-lg animate-bounce-slow">←</span>
            <span className="hidden sm:inline">{strings.question.backToQuestions}</span>
            <span className="sm:hidden">{strings.question.backToQuestionsMobile}</span>
          </a>
        </div>
        
        <div className="space-y-6 animate-fade-in-up">
          {/* Question Card */}
          <QuestionCard
            question={question}
            questionAuthor={questionAuthor}
            hoveredElement={hoveredElement}
            onMouseEnter={setHoveredElement}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* Answers Section */}
          <AnswersList
            answers={answers}
            hoveredElement={hoveredElement}
            onMouseEnter={setHoveredElement}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* Answer Form */}
          <AnswerForm
            user={user}
            questionId={questionId}
            onAnswerPosted={handleAnswerPosted}
            onShowConfetti={handleShowConfetti}
          />
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTopButton />
    </>
  );
}
