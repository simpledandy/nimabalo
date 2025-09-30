"use client";

import { useState } from "react";
import { useSession } from "@/lib/useSession";
import { strings } from "@/lib/strings";
import { useQuestions } from "@/lib/useQuestions";
import LatestQuestions from "@/components/LatestQuestions";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import AppSidebar from "@/components/AppSidebar";

export default function QuestionsFeedPage() {
  const { user } = useSession();
  const { questions, loading, setQuestions } = useQuestions();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Create a proper callback function for the modal
  const handleShowAuthModal = (show: boolean) => {
    setShowAuthModal(show);
  };

  return (
    <PageLayout>
      <PageHeader
        title={strings.questionsFeed.title}
        subtitle={strings.questionsFeed.subtitle}
        backButton={{
          href: "/",
          text: strings.questionsFeed.backToHome
        }}
        icon="📋"
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center items-start min-h-screen">
        {/* Questions Feed - Main content */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] px-4 lg:px-10">
          <div className="w-full max-w-4xl">
            <LatestQuestions 
              questions={questions} 
              loading={loading} 
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
          loading={loading}
          onQuestionsUpdate={setQuestions}
          showAuthModal={showAuthModal}
          setShowAuthModal={handleShowAuthModal}
        />
      </div>
    </PageLayout>
  );
}
