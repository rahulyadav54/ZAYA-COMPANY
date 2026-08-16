import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = 'https://zayacodehub.in';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseAnonKey && id) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt, category, author, image_url, created_at')
        .eq('id', id)
        .single();

      if (post) {
        const title = `${post.title} | ZAYA Magazine`;
        const description = post.excerpt || `${post.title} - Read this technical article and development guide on ZAYA CODE HUB Magazine.`;
        return {
          title,
          description,
          keywords: [
            post.title,
            post.category || 'Tech Article',
            'ZAYA CODE HUB Magazine',
            'software engineering blog',
            'coding tutorial'
          ],
          alternates: {
            canonical: `${baseUrl}/magazine/${id}`,
          },
          openGraph: {
            title,
            description,
            url: `${baseUrl}/magazine/${id}`,
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author || 'ZAYA Editorial Team'],
            images: post.image_url ? [{ url: post.image_url, alt: post.title }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.image_url ? [post.image_url] : undefined,
          }
        };
      }
    } catch (err) {
      console.error('Error generating magazine metadata:', err);
    }
  }

  return {
    title: 'Article | ZAYA Magazine',
    description: 'Read the latest technical tutorials, web development tips, and AI insights from ZAYA CODE HUB.',
    alternates: {
      canonical: `${baseUrl}/magazine/${id}`,
    },
  };
}

export default async function ArticleLayout({ children, params }: Props) {
  const { id } = await params;
  const baseUrl = 'https://zayacodehub.in';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  let jsonLdArticle: any = null;
  if (supabaseUrl && supabaseAnonKey && id) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt, category, author, image_url, created_at, updated_at')
        .eq('id', id)
        .single();

      if (post) {
        jsonLdArticle = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          'headline': post.title,
          'description': post.excerpt || post.title,
          'image': post.image_url || 'https://zayacodehub.in/favicon.png',
          'author': {
            '@type': 'Person',
            'name': post.author || 'ZAYA Engineering Team'
          },
          'publisher': {
            '@type': 'EducationalOrganization',
            'name': 'ZAYA CODE HUB',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://zayacodehub.in/favicon.png'
            }
          },
          'datePublished': post.created_at,
          'dateModified': post.updated_at || post.created_at,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${baseUrl}/magazine/${id}`
          }
        };
      }
    } catch {
      // fallback
    }
  }

  return (
    <>
      {jsonLdArticle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
        />
      )}
      {children}
    </>
  );
}
