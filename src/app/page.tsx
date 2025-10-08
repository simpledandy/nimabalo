import { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import IndependenceCongrats from '@/components/IndependenceCongrats';
import StructuredData from '@/components/StructuredData';
import HomePageClient from './HomePageClient';

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
  title: "Nimabalo - Savollar va Javoblar Platformasi",
  description: "Nimabalo'da savollar bering, javoblar oling. Anonim va ochiq muhitda fikr almashing. O'zbek tilida Q&A platformasi.",
  keywords: [
    "savollar",
    "javoblar", 
    "nimabalo",
    "q&a",
    "anonim",
    "uzbek",
    "jamiyat",
    "fikr almashish",
    "savol berish",
    "o'zbek tili",
    "savollar platformasi"
  ],
  openGraph: {
    title: "Nimabalo - Savollar va Javoblar Platformasi",
    description: "O'zbek tilida savollar bering va javoblar oling. Anonim muhitda fikr almashing.",
    type: "website",
    siteName: "Nimabalo",
    url: "https://nimabalo.uz",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Nimabalo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nimabalo - Savollar va Javoblar Platformasi",
    description: "O'zbek tilida savollar bering va javoblar oling.",
  },
  alternates: {
    canonical: "https://nimabalo.uz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Cache this page for 30 seconds in production
export const revalidate = 30;

// Server-side function to fetch questions
async function getQuestions(): Promise<Question[]> {
  try {
    // Check if environment variables are available
    console.log('🔍 Server-side env check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ NOT SET',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET'
    });
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Supabase environment variables not available during build, returning empty array');
      console.warn('⚠️ Make sure .env.local exists and dev server was restarted');
      return [];
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('questions')
      .select('id,title,body,created_at,user_id,same_count')
      .order('created_at', { ascending: false })
      .limit(20); // Limit for better performance
    
    if (error) {
      console.error('❌ Error fetching questions:', error);
      return [];
    }
    
    console.log(`✅ Fetched ${data?.length || 0} questions from Supabase`);
    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching questions:', err);
    return [];
  }
}

export default async function HomePage() {
  // Fetch questions on the server
  const questions = await getQuestions();

  return (
    <>
      <StructuredData type="Website" data={{}} />
      <IndependenceCongrats />
      <HomePageClient initialQuestions={questions} />
    </>
  );
}