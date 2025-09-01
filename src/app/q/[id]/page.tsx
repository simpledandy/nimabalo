'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { timeAgo } from '@/lib/timeUtils';
import SparkleEffect from '@/components/SparkleEffect';
import ConfettiEffect from '@/components/ConfettiEffect';
import SameQuestionButton from '@/components/SameQuestionButton';
import ShareQuestionButton from '@/components/ShareQuestionButton';
import QuestionSkeleton from '@/components/QuestionSkeleton';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import AnswerPreview from '@/components/AnswerPreview';
import AnswerSorting from '@/components/AnswerSorting';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-shake">😕</div>
        <div className="text-xl font-medium text-red-600">Savol topilmadi</div>
        <div className="text-sm text-gray-500 mt-2">Bu savol mavjud emas yoki o'chirilgan</div>
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

      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        {/* Back to Questions Button */}
        <div className="mb-6 animate-fade-in-up">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-600 rounded-full font-medium hover:bg-sky-200 transition-all duration-300 hover:scale-105"
          >
            <span className="text-lg animate-bounce-slow">←</span>
            <span>Barcha savollarga qaytish</span>
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-sky-800 leading-tight">
                {q.title}
              </h1>
              {q.body && (
                <div className="prose prose-lg max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{q.body}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">📅</span>
                  <span>So'ralgan vaqti: {timeAgo(q.created_at)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 flex justify-center gap-4 flex-wrap">
                <SameQuestionButton
                  questionId={q.id}
                  sameCount={sameCount}
                  onSameCountChange={setSameCount}
                />
                <ShareQuestionButton
                  questionTitle={q.title}
                  questionUrl={typeof window !== 'undefined' ? window.location.href : ''}
                />
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-sky-800">Javoblar</h2>
                <div className={`bg-sky-100 px-3 py-1 rounded-full text-sky-600 font-medium flex items-center gap-1 transition-all duration-300 ${
                  answerCountAnimation ? 'scale-125 bg-sky-200 shadow-lg' : 'animate-scale-in'
                }`}>
                  <span className="animate-bounce-slow">💬</span>
                  <span className="font-bold">{answers.length}</span>
                </div>
              </div>
              {answers.length > 1 && (
                <div className={`transition-all duration-300 ${sortAnimation ? 'scale-110' : 'scale-100'}`}>
                  <AnswerSorting onSortChange={setSortBy} currentSort={sortBy} />
                </div>
              )}
              {sortAnimation && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce-slow z-10 shadow-lg">
                  🔄 Saralandi!
                </div>
              )}
            </div>
            
            {answers.length > 0 && (
              <div className="text-sm text-gray-500 flex items-center gap-3 flex-wrap">
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
              <div className="card text-center py-16 animate-fade-in-up relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <div className="text-8xl mb-6 animate-bounce-slow">🤷‍♂️</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Hali javoblar yo'q</h3>
                  <p className="text-gray-600 mb-6 text-lg">Birinchi javobni siz bering! 💡</p>
                  <div className="flex justify-center">
                    <div className="bg-sky-100 px-6 py-3 rounded-full text-sky-600 font-medium flex items-center gap-2">
                      <span className="animate-pulse">💭</span>
                      <span>Savolga javob berish uchun pastga tushing</span>
                    </div>
                  </div>
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
                    <div className="absolute top-4 left-4 bg-sky-500 text-white text-sm font-bold px-2 py-1 rounded-full shadow-md animate-scale-in">
                      #{index + 1}
                      {sortBy === 'longest' && answer.body.length > 200 && (
                        <span className="ml-1 text-yellow-300">⭐</span>
                      )}
                      {sortBy === 'newest' && (
                        <span className="ml-1 text-green-300">🆕</span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 text-xl opacity-20 animate-bounce-slow">💭</div>
                    <div className="relative z-10 pt-8">
                      <div className="mb-4">
                        <AnswerPreview text={answer.body} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="animate-pulse">⏰</span>
                          <span>Javob berilgan vaqti: {timeAgo(answer.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-purple-500">📝</span>
                            <span className="text-purple-500">{answer.body.length} belgi</span>
                            {answer.body.length > 200 && (
                              <span className="text-green-500 ml-1" title="Batafsil javob">✨</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sky-500">👤</span>
                            <span className="text-sky-500">Foydalanuvchi</span>
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
              <h3 className="text-xl font-bold text-sky-800">Javob yozing</h3>
              <span className="text-2xl animate-bounce-slow">✍️</span>
            </div>
            
            {!user ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-bounce-slow">🔐</div>
                <p className="text-lg text-gray-600 mb-4">Javob yozish uchun tizimga kiring</p>
                <div className="flex gap-4 justify-center">
                  <a href="/auth" className="btn">
                    <span className="mr-2">🚀</span>
                    Kirish
                  </a>
                  <a href="/auth?signup=1" className="btn-secondary">
                    <span className="mr-2">✨</span>
                    Ro'yxatdan o'tish
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <textarea
                    className="textarea min-h-[120px] text-lg"
                    placeholder="Foydali va batafsil javob yozing... 💡"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    style={{
                      transform: answerText ? 'scale(1.01)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {/* Character counter */}
                  <div className="absolute bottom-3 right-3 text-sm text-sky-400 font-medium">
                    {answerText.length} {answerText.length > 500 ? '🚨' : answerText.length > 200 ? '📝' : '✍️'}
                  </div>
                </div>
                
                {err && (
                  <div className="text-red-500 text-lg animate-shake bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                    <span>⚠️</span>
                    {err}
                  </div>
                )}

                {/* Success message */}
                {showSuccess && (
                  <div className="text-center text-green-600 text-lg font-medium animate-fade-in-up bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-center gap-2">
                    <span className="animate-bounce-slow">🎉</span>
                    Javobingiz muvaffaqiyatli yuborildi! 🚀
                  </div>
                )}

                <button
                  onClick={postAnswer}
                  disabled={posting || answerText.trim().length < 2}
                  className="btn w-full text-lg py-4 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: posting || answerText.trim().length < 2 
                      ? 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)' 
                      : 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)',
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
                  <div className="text-center text-sky-600 text-sm opacity-70 animate-pulse">
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
    </div>
  );
}
