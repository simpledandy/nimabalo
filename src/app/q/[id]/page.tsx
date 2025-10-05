import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { strings } from '@/lib/strings';
import SparkleEffect from '@/components/SparkleEffect';
import NotFoundPage from '@/components/NotFoundPage';
import StructuredData from '@/components/StructuredData';
import QuestionDetailClient from './QuestionDetailClient';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, using fallback metadata');
      return {
        title: "Savol - Nimabalo",
        description: "Nimabalo'da savollar va javoblar.",
      };
    }

    const supabase = getSupabaseAdmin();
    const { data: question } = await supabase
      .from('questions')
      .select('title, body, created_at')
      .eq('id', id)
      .single();

    if (!question) {
      return {
        title: "Savol topilmadi - Nimabalo",
        description: "Bu savol mavjud emas yoki o'chirilgan.",
      };
    }

    const title = `${question.title} - Nimabalo`;
    const description = question.body 
      ? `${question.body.substring(0, 160)}...` 
      : `${question.title} haqida fikr almashing va javob bering.`;

    return {
      title,
      description,
      keywords: [
        "savol",
        "javob",
        "nimabalo",
        "q&a",
        "uzbek",
        question.title.toLowerCase(),
      ],
      openGraph: {
        title,
        description,
        type: "article",
        siteName: "Nimabalo",
        url: `https://nimabalo.uz/q/${id}`,
        publishedTime: question.created_at,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: `https://nimabalo.uz/q/${id}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Savol - Nimabalo",
      description: "Nimabalo'da savollar va javoblar.",
    };
  }
}

// Server-side function to fetch question data
async function getQuestionData(id: string) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, returning null data');
      return {
        question: null,
        answers: [],
        author: null,
      };
    }

    const supabase = getSupabaseAdmin();
    const [{ data: question }, { data: answers }, { data: author }] = await Promise.all([
      supabase.from('questions').select('*').eq('id', id).single(),
      supabase.from('answers').select('*').eq('question_id', id).order('created_at', { ascending: false }),
      supabase.from('questions').select('user_id').eq('id', id).single().then(async (result) => {
        if (result.data?.user_id) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', result.data.user_id)
            .single();
          return { data };
        }
        return { data: null };
      })
    ]);

    return {
      question: question as Question | null,
      answers: (answers || []) as Answer[],
      author: author?.data as Profile | null,
    };
  } catch (error) {
    console.error('Error fetching question data:', error);
    return {
      question: null,
      answers: [],
      author: null,
    };
  }
}

// Generate static params for popular questions (optional - for ISR)
export async function generateStaticParams() {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, returning empty static params');
      return [];
    }

    const supabase = getSupabaseAdmin();
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(50); // Generate static pages for 50 most recent questions

    return questions?.map((question) => ({
      id: question.id,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const { question, answers, author } = await getQuestionData(id);

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4">
        <NotFoundPage
          title={strings.errors.questionNotFound}
          message={strings.errors.questionNotFoundMessage}
          icon="😕"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      <StructuredData 
        type="QAPage" 
        data={{ question, answers, author }} 
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

      <QuestionDetailClient 
        question={question}
        initialAnswers={answers}
        questionAuthor={author}
        questionId={id}
      />
    </div>
  );
}