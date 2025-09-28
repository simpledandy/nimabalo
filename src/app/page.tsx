"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/lib/useSession";
import { strings, formatString } from "@/lib/strings";
import { queryWithTimeout, handleSupabaseError } from "@/lib/supabaseUtils";
import IndependenceCongrats from "@/components/IndependenceCongrats";
import SurpriseCTA from "@/components/SurpriseCTA";
import LatestQuestions from "@/components/LatestQuestions";
import SparkleEffect from "@/components/SparkleEffect";
import ConfettiEffect from "@/components/ConfettiEffect";
import AuthModal from "@/components/AuthModal";

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

export default function HomePage() {
  const { user } = useSession();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Create a proper callback function for the modal
  const handleShowAuthModal = useCallback((show: boolean) => {
    setShowAuthModal(show);
  }, []);

  // Fetch questions
  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const query = supabase
          .from('questions')
          .select('id,title,body,created_at,user_id,same_count')
          .order('created_at', { ascending: false });
        
        const { data, error } = await queryWithTimeout(query, 8000) as { data: any; error: any };
        
        if (isMounted) {
          if (error) {
            console.error('Error fetching questions:', handleSupabaseError(error, 'Fetch questions'));
            // Still set loading to false even on error
          } else if (data) {
            setQuestions(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching questions:', handleSupabaseError(err, 'Fetch questions'));
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-focus ask input when ask form is shown
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Submit handler
  async function submit() {
    setErrorMsg('');
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }
    if (!title.trim()) {
      setErrorMsg(strings.home.errorMessages.emptyTitle);
      return;
    }
    
    // Check if question already exists
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('title', title.trim())
      .single();
    
    if (existingQuestion) {
      setErrorMsg(strings.home.errorMessages.duplicateQuestion);
      return;
    }
    
    setSubmitting(true);
    const { error } = await supabase.from('questions').insert({
      title: title.trim(),
      user_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      console.error('Question submission error:', error);
      if (error.code === '23505') {
        setErrorMsg(strings.home.errorMessages.duplicateQuestion);
      } else if (error.code === '23503') {
        setErrorMsg(strings.home.errorMessages.userNotFound);
      } else if (error.message) {
        setErrorMsg(`${strings.auth.errorPrefix} ${error.message}`);
      } else {
        setErrorMsg(strings.home.errorMessages.genericError);
      }
      return;
    }
    setTitle('');
    // Show confetti celebration!
    setShowConfetti(true);
    setShowSuccess(true);
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
    // Refresh questions
    try {
      const { data, error: fetchError } = await supabase
        .from('questions')
        .select('id,title,body,created_at,user_id,same_count')
        .order('created_at', { ascending: false });
      if (!fetchError && data) {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error refreshing questions:', err);
    }
  }

  // Split the main prompt into words for individual animation
  const promptWords = strings.home.title.split(' ');
  const emojis = ['🤔', '💭', '✨', '😊'];

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      {/* Confetti celebration effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* Sparkle effect for extra playfulness */}
      <SparkleEffect />
      
      {/* Floating background elements for playfulness */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-bounce-slow">🤔</div>
        <div className="absolute top-40 right-20 text-3xl opacity-10 animate-bounce-slower">💭</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-bounce-slowest">✨</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce-slow">😊</div>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-start min-h-screen pt-[104px]">
        <IndependenceCongrats />
        {/* Main center column */}
        <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] px-4 lg:px-10">
          {/* Playful main heading with word-by-word animation */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in text-primary" style={{letterSpacing:'-0.01em'}}>
              {promptWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-block mx-1 transition-all duration-300 hover:scale-110 hover:rotate-2 cursor-default"
                  style={{
                    animationDelay: `${index * 200}ms`
                  }}
                >
                  {word}
                  <span className="ml-2 opacity-60 animate-bounce-slow" style={{animationDelay: `${index * 300}ms`}}>
                    {emojis[index]}
                  </span>
                </span>
              ))}
            </h1>
            
            {/* Playful subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-secondary font-medium animate-fade-in-up opacity-80" style={{animationDelay: '800ms'}}>
              {strings.home.subtitle}
            </p>
          </div>

          <div className="w-full max-w-xl animate-fade-in-up" style={{background: 'transparent', boxShadow: 'none', animationDelay: '400ms'}}>
            {/* Enhanced input with playful placeholder */}
            <div className="relative group mb-8">
              <input
                className="input text-xl md:text-2xl lg:text-3xl py-4 md:py-6 px-4 font-bold transition-all duration-300 outline-none rounded-xl"
                type="text"
                placeholder={strings.home.inputPlaceholder}
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                ref={titleRef}
                disabled={submitting}
                maxLength={100}
                style={{
                  fontWeight:'600', 
                  background: submitting ? '#f1f5f9' : 'transparent',
                  transform: title ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              />
              {/* Character counter with emoji */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-accent font-medium">
                {title.length}/100 {title.length > 80 ? strings.home.characterCounter.warning : title.length > 50 ? strings.home.characterCounter.typing : strings.home.characterCounter.writing}
              </div>
            </div>

            {/* Enhanced button with playful text */}
            <button
              className="btn w-full text-center text-xl md:text-2xl lg:text-3xl py-3 md:py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 mb-8"
              onClick={submit}
              disabled={submitting || !title.trim()}
              style={{
                background: submitting || !title.trim() 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                  : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                transform: submitting || !title.trim() ? 'scale(1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {strings.home.submittingButton}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-bounce-slow">🚀</span>
                  {strings.home.submitButton}
                </span>
              )}
            </button>

            {/* Enhanced error message */}
            {errorMsg && (
              <div className="text-error text-lg animate-shake bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2 mb-8">
                <span>⚠️</span>
                {errorMsg}
              </div>
            )}

            {/* Fun tip */}
            {!title && !submitting && (
              <div className="text-center text-accent text-sm opacity-70 animate-pulse mb-8">
                {strings.home.tip}
              </div>
            )}



            {/* Success message */}
            {showSuccess && (
              <div className="text-center text-success text-lg font-medium animate-fade-in-up bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-center gap-2 mb-8">
                <span className="animate-bounce-slow">🎉</span>
                {strings.home.successMessage}
              </div>
            )}
          </div>

                    {/* Show sign in/up prompt if user tries to submit while not logged in */}
          <AuthModal
            isOpen={showSignupPrompt}
            onClose={() => setShowSignupPrompt(false)}
            title={strings.authModal.titles.askQuestion}
            message={strings.authModal.messages.askQuestion}
          />
        </div>
        
        {/* Right sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block fixed right-0 h-full w-80 px-4 pt-4 z-30 bg-white/95 shadow-2xl animate-fade-in-right">
          <div className="h-full overflow-y-auto">
            <LatestQuestions 
              questions={questions} 
              loading={loading} 
              onQuestionsUpdate={setQuestions}
              showAuthModal={showAuthModal}
              setShowAuthModal={handleShowAuthModal}
            />
          </div>
        </div>
      </div>

      {/* Mobile Latest Questions Section - shown below main content on mobile */}
      <div className="lg:hidden px-4 pb-8">
        <div className="max-w-xl mx-auto">
          <LatestQuestions 
            questions={questions} 
            loading={loading} 
            onQuestionsUpdate={setQuestions}
            showAuthModal={showAuthModal}
            setShowAuthModal={handleShowAuthModal}
          />
        </div>
      </div>

      {/* Auth Modal for "Menga ham qiziq" button */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={strings.authModal.titles.showInterest}
        message={strings.authModal.messages.showInterest}
      />

    </div>
  );
}