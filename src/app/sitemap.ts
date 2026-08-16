import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zayacodehub.in'

  // Use env variables directly for server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  let magazineUrls: MetadataRoute.Sitemap = []

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, created_at')
        .order('created_at', { ascending: false })

      if (posts) {
        magazineUrls = posts.map((post) => ({
          url: `${baseUrl}/magazine/${post.id}`,
          lastModified: new Date(post.created_at),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      }
    } catch (error) {
      console.error('Error fetching sitemap posts:', error)
    }
  }

  const routes = [
    '',
    '/practice',
    '/practice/code',
    '/ai-zaya',
    '/about',
    '/services',
    '/portfolio',
    '/careers',
    '/magazine',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/verify',
    '/verify-id',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/practice' || route === '/practice/code' || route === '/ai-zaya' ? 'daily' : 'weekly') as "yearly" | "monthly" | "always" | "hourly" | "daily" | "weekly" | "never" | undefined,
    priority: route === '' ? 1.0 : (route === '/practice' || route === '/practice/code') ? 0.95 : route === '/ai-zaya' ? 0.9 : 0.8,
  }))

  return [...routes, ...magazineUrls]
}
