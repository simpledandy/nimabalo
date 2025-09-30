'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { strings } from '@/lib/strings';
import SparkleEffect from '@/components/SparkleEffect';
import ConfettiEffect from '@/components/ConfettiEffect';
import QuestionSkeleton from '@/components/QuestionSkeleton';
import NotFoundPage from '@/components/NotFoundPage';
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

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { user } = useSession();

  const [q, setQ] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionAuthor, setQuestionAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      const [{ data: qData }, { data: aData }] = await Promise.all([
        supabase.from('questions').select('*').eq('id', id).single(),
        supabase.from('answers').select('*').eq('question_id', id).order('created_at', { ascending: false }),
      ]);
      if (qData) {
        setQ(qData);
        // Fetch question author info
        if (qData.user_id) {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', qData.user_id)
            .single();
          setQuestionAuthor(authorData);
        }
      }
      if (aData) setAnswers(aData);
      setLoading(false);
    })();
  }, [id]);

  const handleAnswerPosted = (newAnswers: Answer[]) => {
    setAnswers(newAnswers);
  };

  const handleShowConfetti = () => {
    setShowConfetti(true);
  };

  if (loading) return <QuestionSkeleton />;
  
  if (!q) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4">
      <NotFoundPage
        title={strings.errors.questionNotFound}
        message={strings.errors.questionNotFoundMessage}
        icon="😕"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      {/* Confetti celebration effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* Sparkle effect for extra playfulness */}
      <SparkleEffect />
      
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-3xl opacity-10 animate-bounce-slow">💭</div>
        <div className="absolute top-40 right-20 text-2xl opacity-10 animate-bounce-slower">🤔</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-bounce-slowest">✨</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce-slow">💡</div>
      </div>

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
            question={q}
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
            questionId={id}
            onAnswerPosted={handleAnswerPosted}
            onShowConfetti={handleShowConfetti}
          />
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTopButton />
    </div>
  );
}