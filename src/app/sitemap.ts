import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zayacodehub.in'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  let magazineUrls: MetadataRoute.Sitemap = []
  let examUrls: MetadataRoute.Sitemap = []

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    try {
      // 1. Fetch all magazine articles
      const { data: posts } = await supabase
        .from('posts')
        .select('id, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (posts) {
        magazineUrls = posts.map((post) => ({
          url: `${baseUrl}/magazine/${post.id}`,
          lastModified: new Date(post.updated_at || post.created_at || new Date()),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
      }

      // 2. Fetch all public exams & quizzes
      const { data: exams } = await supabase
        .from('exams')
        .select('id, created_at, updated_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (exams) {
        examUrls = exams.map((exam) => ({
          url: `${baseUrl}/practice/${exam.id}`,
          lastModified: new Date(exam.updated_at || exam.created_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
        }))
      }
    } catch (error) {
      console.error('Error fetching dynamic sitemap items:', error)
    }
  }

  // Built-in Algorithmic DSA Coding Challenge Problems
  const codingProblemIds = [
    'two-sum',
    'valid-palindrome',
    'longest-substring-without-repeating-characters',
    'reverse-linked-list',
    'binary-tree-inorder-traversal',
    'valid-anagram',
    'best-time-to-buy-and-sell-stock',
    'valid-parentheses',
    'maximum-subarray',
    'container-with-most-water',
    'binary-search',
    'single-number',
  ]

  const codingUrls: MetadataRoute.Sitemap = codingProblemIds.map((id) => ({
    url: `${baseUrl}/practice/code/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/practice`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/practice/code`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/ai-zaya`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/magazine`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/verify`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/verify-id`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  return [...staticRoutes, ...examUrls, ...codingUrls, ...magazineUrls]
}

