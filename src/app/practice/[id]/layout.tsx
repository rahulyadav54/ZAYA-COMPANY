import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { practiceSlug } from '@/lib/practiceSlug';

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
      let { data: exam } = await supabase
        .from('exams')
        .select('title, description, domain, duration_minutes')
        .eq('id', id)
        .maybeSingle();

      if (!exam) {
        const { data: exams } = await supabase.from('exams').select('id, title, description, domain, duration_minutes').eq('is_active', true);
        exam = exams?.find((candidate) => practiceSlug(candidate.title) === id) || null;
      }

      if (exam) {
        const title = `${exam.title} - Online Proctored Exam & Skill Test`;
        const description = exam.description || `Take the official online proctored ${exam.title} skill assessment in ${exam.domain || 'Tech'} on ZAYA CODE HUB. Test duration: ${exam.duration_minutes || 30} minutes with instant certificate qualification.`;
        return {
          title,
          description,
          robots: {
            index: true,
            follow: true,
          },
          keywords: [
            exam.title,
            `${exam.title} exam online`,
            `${exam.title} practice quiz`,
            `${exam.domain} test`,
            'proctored skill test online',
            'ZAYA CODE HUB Exam Portal',
          ],
          alternates: {
            canonical: `${baseUrl}/practice/${practiceSlug(exam.title)}`,
          },
          openGraph: {
            title: `${title} | ZAYA CODE HUB`,
            description,
            url: `${baseUrl}/practice/${practiceSlug(exam.title)}`,
            type: 'website',
          },
        };
      }
    } catch (err) {
      console.error('Error generating exam metadata:', err);
    }
  }

  return {
    title: 'Online Proctored Skill Assessment & Exam Room',
    description: 'Take official proctored online examinations with strict anti-cheating monitoring and automated qualification on ZAYA CODE HUB.',
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/practice/${id}`,
    },
  };
}

export default async function ExamLayout({ children, params }: Props) {
  const { id } = await params;
  const baseUrl = 'https://zayacodehub.in';
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  let jsonLdExam: any = null;
  if (supabaseUrl && supabaseAnonKey && id) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    try {
      let { data: exam } = await supabase
        .from('exams')
        .select('title, description, domain, duration_minutes')
        .eq('id', id)
        .maybeSingle();

      if (!exam) {
        const { data: exams } = await supabase.from('exams').select('id, title, description, domain, duration_minutes').eq('is_active', true);
        exam = exams?.find((candidate) => practiceSlug(candidate.title) === id) || null;
      }

      if (exam) {
        jsonLdExam = {
          '@context': 'https://schema.org',
          '@type': 'Quiz',
          'name': exam.title,
          'description': exam.description || `Online proctored test for ${exam.title}`,
          'educationalLevel': 'Beginner to Advanced',
          'about': {
            '@type': 'Thing',
            'name': exam.domain || 'Software Engineering'
          },
          'timeRequired': `PT${exam.duration_minutes || 30}M`,
          'provider': {
            '@type': 'EducationalOrganization',
            'name': 'ZAYA CODE HUB',
            'url': 'https://zayacodehub.in'
          }
        };
      }
    } catch {
      // fallback
    }
  }

  return (
    <>
      {jsonLdExam && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdExam) }}
        />
      )}
      {children}
    </>
  );
}
