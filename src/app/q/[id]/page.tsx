'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { useBadges } from '@/lib/useBadges';
import { timeAgo } from '@/lib/timeUtils';
import SparkleEffect from '@/components/SparkleEffect';
import ConfettiEffect from '@/components/ConfettiEffect';
import BadgeModal from '@/components/BadgeModal';


import QuestionSkeleton from '@/components/QuestionSkeleton';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import AnswerPreview from '@/components/AnswerPreview';
import AnswerSorting from '@/components/AnswerSorting';
import AuthModal from '@/components/AuthModal';

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
  const { newBadge, clearNewBadge } = useBadges();

  const [q, setQ] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [sameCount, setSameCount] = useState(q?.same_count || 0);
  const [answerCountAnimation, setAnswerCountAnimation] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest' | 'shortest'>('newest');
  const [sortAnimation, setSortAnimation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Trigger sort animation when sort changes
  useEffect(() => {
    if (answers.length > 1) {
      setSortAnimation(true);
      setTimeout(() => setSortAnimation(false), 500);
    }
  }, [sortBy, answers.length]);

  // Sort answers based on current sort option
  const sortedAnswers = [...answers].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'longest':
        return b.body.length - a.body.length;
      case 'shortest':
        return a.body.length - b.body.length;
      default:
        return 0;
    }
  });

  useEffect(() => {
    (async () => {
      const [{ data: qData }, { data: aData }] = await Promise.all([
        supabase.from('questions').select('*').eq('id', id).single(),
        supabase.from('answers').select('*').eq('question_id', id).order('created_at', { ascending: false }),
      ]);
      if (qData) setQ(qData);
      if (aData) setAnswers(aData);
      setLoading(false);
    })();
  }, [id]);

  async function postAnswer() {
    setPosting(true);
    setErr('');
    try {
      const body = answerText.trim();
      if (body.length < 2) throw new Error('Javob juda qisqa.');
      const { error } = await supabase.from('answers').insert({
        question_id: id,
        user_id: user!.id,
        body,
      });
      if (error) throw error;
      setAnswerText('');
      // Show celebration effects!
      setShowConfetti(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .order('created_at', { ascending: false });
      if (data) {
        setAnswers(data);
        // Trigger answer count animation
        setAnswerCountAnimation(true);
        setTimeout(() => setAnswerCountAnimation(false), 1000);
      }
    } catch (e: any) {
      setErr(e.message ?? 'Javobni yuborishda xatolik yuz berdi');
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <QuestionSkeleton />;
  
  if (!q) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-shake">😕</div>
        <div className="text-xl font-medium text-error">Savol topilmadi</div>
        <div className="text-sm text-neutral mt-2">Bu savol mavjud emas yoki o'chirilgan</div>
      </div>
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

      <div className="container mx-auto px-4 py-6 sm:py-8 pt-20 sm:pt-24 max-w-4xl">
        {/* Back to Questions Button */}
        <div className="mb-6 animate-fade-in-up">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-light text-primary rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <span className="text-lg animate-bounce-slow">←</span>
            <span className="hidden sm:inline">Barcha savollarga qaytish</span>
            <span className="sm:hidden">Barcha savollar</span>
          </a>
        </div>
        
        <div className="space-y-6 animate-fade-in-up">
          {/* Question Card */}
          <div 
            className="card hover-lift relative overflow-hidden"
            onMouseEnter={() => setHoveredElement('question')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <div className="absolute top-4 right-4 text-2xl opacity-20 animate-bounce-slow">❓</div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary leading-tight">
                {q.title}
              </h1>
              {q.body && (
                <div className="prose prose-lg max-w-none mb-4">
                  <p className="text-neutral leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{q.body}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs sm:text-sm text-neutral mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">📅</span>
                  <span>So'ralgan vaqti: {timeAgo(q.created_at)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex justify-center gap-3 sm:gap-4 flex-wrap">
                {/* Same count information - just the count, no text */}
                {sameCount > 0 && (
                  <div className="w-full text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20">
                      <span className="text-lg">🤝</span>
                      <span className="font-medium text-sm sm:text-base">
                        {sameCount}
                      </span>
                    </div>
                  </div>
                )}
                {/* Share button removed for now, keeping space for future features */}
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">Javoblar</h2>
                <div className={`bg-accent px-2 sm:px-3 py-1 rounded-full text-white font-medium flex items-center gap-1 transition-all duration-300 ${
                  answerCountAnimation ? 'scale-125 bg-secondary shadow-lg' : 'animate-scale-in'
                }`}>
                  <span className="animate-bounce-slow">💬</span>
                  <span className="font-bold text-sm sm:text-base">{answers.length}</span>
                </div>
              </div>
              {answers.length > 1 && (
                <div className={`transition-all duration-300 ${sortAnimation ? 'scale-110' : 'scale-100'}`}>
                  <AnswerSorting onSortChange={setSortBy} currentSort={sortBy} />
                </div>
              )}
              {sortAnimation && (
                <div className="absolute -top-2 -right-2 bg-success text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce-slow z-10 shadow-lg">
                  🔄 Saralandi!
                </div>
              )}
            </div>
            
            {answers.length > 0 && (
              <div className="text-xs sm:text-sm text-neutral flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>Jami {answers.length} ta javob</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📝</span>
                  <span>O'rtacha {Math.round(answers.reduce((sum, a) => sum + a.body.length, 0) / answers.length)} belgi</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{answers.filter(a => a.body.length > 200).length} ta batafsil javob</span>
                </div>
              </div>
            )}
            
            {answers.length === 0 ? (
              <div className="card text-center py-12 sm:py-16 animate-fade-in-up relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <div className="text-6xl sm:text-8xl mb-6 animate-bounce-slow">🤷‍♂️</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">Hali javoblar yo'q</h3>
                  <p className="text-neutral mb-6 text-base sm:text-lg">Birinchi javobni siz bering! 💡</p>
                </div>
              </div>
                          ) : (
                <div className={`space-y-4 transition-all duration-300 ${
                  sortAnimation ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}>
                  {sortedAnswers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className={`card hover-lift relative overflow-hidden transition-all duration-300 ${
                      hoveredElement === `answer-${answer.id}` ? 'scale-[1.02] shadow-lg' : ''
                    }`}
                    onMouseEnter={() => setHoveredElement(`answer-${answer.id}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Answer number badge */}
                    <div className="absolute top-4 left-4 bg-accent text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-md animate-scale-in">
                      #{index + 1}
                      {sortBy === 'longest' && answer.body.length > 200 && (
                        <span className="ml-1 text-warm">⭐</span>
                      )}
                      {sortBy === 'newest' && (
                        <span className="ml-1 text-success">🆕</span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 text-xl opacity-20 animate-bounce-slow">💭</div>
                    <div className="relative z-10 pt-8">
                      <div className="mb-4">
                        <AnswerPreview text={answer.body} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-neutral pt-3 border-t border-gray-100 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <span className="animate-pulse">⏰</span>
                          <span>Javob berilgan vaqti: {timeAgo(answer.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-warm">📝</span>
                            <span className="text-warm">{answer.body.length} belgi</span>
                            {answer.body.length > 200 && (
                              <span className="text-success ml-1" title="Batafsil javob">✨</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-accent">👤</span>
                            <span className="text-accent">Foydalanuvchi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          <div className="card space-y-4 hover-lift">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-primary">Javob yozing</h3>
              <span className="text-2xl animate-bounce-slow">✍️</span>
            </div>
            
            {!user ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-4xl mb-4 animate-bounce-slow">💭</div>
                <p className="text-base sm:text-lg text-neutral mb-4">Bilimingizni ko'rsating!</p>
                <div className="space-y-4">
                  <textarea
                    className="textarea min-h-[120px] text-base sm:text-lg"
                    placeholder="Foydali va batafsil javob yozing... 💡"
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
                    Javobni yuborish
                  </button>
                  <div className="text-center text-accent text-sm opacity-70">
                    💡 Javob bera olish mazza, shunday emasmi? 😉
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <textarea
                    className="textarea min-h-[120px] text-base sm:text-lg"
                    placeholder="Foydali va batafsil javob yozing... 💡"
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
                    Javobingiz muvaffaqiyatli yuborildi! 🚀
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
                      Yuborilmoqda…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-bounce-slow">🚀</span>
                      Javob yuborish!
                    </span>
                  )}
                </button>

                {/* Helpful tip */}
                {!answerText && !posting && (
                  <div className="text-center text-accent text-sm opacity-70 animate-pulse">
                    💡 Maslahat: Batafsil va foydali javob yozing!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <ScrollToTopButton />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Javobingizni yetkazish uchun foydalanuvchiga aylaning🤗"
        message="Javobingizni saqlash va boshqalarga yordam berish uchun tizimga kiring yoki ro'yxatdan o'ting"
      />

      {/* Badge Modal */}
      <BadgeModal
        badgeType={newBadge!}
        isOpen={!!newBadge}
        onClose={clearNewBadge}
      />
    </div>
  );
}