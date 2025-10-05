'use client';

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { useQuestions } from "@/lib/useQuestions";
import LatestQuestions from "@/components/LatestQuestions";
import AppSidebar from "@/components/AppSidebar";

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

interface QuestionsFeedClientProps {
  initialQuestions: Question[];
}

export default function QuestionsFeedClient({ initialQuestions }: QuestionsFeedClientProps) {
  const { user } = useSession();
  const { questions: hookQuestions, loading, setQuestions } = useQuestions();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Use initial questions from server, fallback to hook questions
  const questions = initialQuestions.length > 0 ? initialQuestions : hookQuestions;
  const isLoading = initialQuestions.length === 0 ? loading : false;

  // Create a proper callback function for the modal
  const handleShowAuthModal = (show: boolean) => {
    setShowAuthModal(show);
  };

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center items-start min-h-screen">
        {/* Questions Feed - Main content */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] px-4 lg:px-10">
          <div className="w-full max-w-4xl">
            <LatestQuestions 
              questions={questions} 
              loading={isLoading} 
              onQuestionsUpdate={setQuestions}
              showAuthModal={showAuthModal}
              setShowAuthModal={handleShowAuthModal}
              showClickableHeader={false}
            />
          </div>
        </div>
        
        {/* Right sidebar - hidden on mobile, visible on desktop */}
        <AppSidebar
          variant="feed"
          questions={questions}
          loading={isLoading}
          onQuestionsUpdate={setQuestions}
          showAuthModal={showAuthModal}
          setShowAuthModal={handleShowAuthModal}
        />
      </div>
    </>
  );
}
