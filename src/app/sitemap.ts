import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nimabalo.uz';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic pages - questions
  let questionPages: MetadataRoute.Sitemap = [];
  
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, skipping dynamic sitemap entries');
    } else {
      const supabase = getSupabaseAdmin();
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, updated_at, created_at')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit to prevent sitemap from being too large
      
      if (!error && questions) {
        questionPages = questions.map((question) => ({
          url: `${baseUrl}/q/${question.id}`,
          lastModified: question.updated_at ? new Date(question.updated_at) : new Date(question.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating question sitemap entries:', error);
  }

  // Dynamic pages - user profiles (public profiles only)
  let userPages: MetadataRoute.Sitemap = [];
  
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase environment variables not available during build, skipping user profile sitemap entries');
    } else {
      const supabase = getSupabaseAdmin();
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('username, updated_at, created_at')
        .not('username', 'is', null)
        .limit(500); // Limit to prevent sitemap from being too large
      
      if (!error && profiles) {
        userPages = profiles.map((profile) => ({
          url: `${baseUrl}/${profile.username}`,
          lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(profile.created_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating user profile sitemap entries:', error);
  }

  return [...staticPages, ...questionPages, ...userPages];
}
