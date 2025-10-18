import { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { strings } from '@/lib/strings';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import QuestionsFeedClient from './QuestionsFeedClient';

// Cache this page for 30 seconds in production
export const revalidate = 30;

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id?: string;
  same_count?: number;
};

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Savollar Ro'yxati - Nimabalo",
  description: "Nimabalo'dagi barcha savollarni ko'ring. Qiziqarli mavzular haqida fikr almashing va javob bering.",
  keywords: [
    "savollar ro'yxati",
    "nimabalo savollar",
    "q&a",
    "uzbek savollar",
    "jamiyat savollar",
    "fikr almashish",
    "savollar platformasi"
  ],
  openGraph: {
    title: "Savollar Ro'yxati - Nimabalo",
    description: "Nimabalo'dagi barcha savollarni ko'ring va javob bering.",
    locale: "uz_UZ",
    type: "website",
    siteName: "Nimabalo",
    url: "https://nimabalo.uz/questions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Savollar Ro'yxati - Nimabalo",
    description: "Nimabalo'dagi barcha savollarni ko'ring va javob bering.",
  },
  alternates: {
    canonical: "https://nimabalo.uz/questions",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Server-side function to fetch questions
async function getQuestions(): Promise<Question[]> {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, returning empty array');
      return [];
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('questions')
      .select('id,title,body,created_at,user_id,same_count')
      .order('created_at', { ascending: false })
      .limit(50); // Limit for better performance
    
    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error fetching questions:', err);
    return [];
  }
}

export default async function QuestionsFeedPage() {
  // Fetch questions on the server
  const questions = await getQuestions();

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

      <QuestionsFeedClient initialQuestions={questions} />
    </PageLayout>
  );
}