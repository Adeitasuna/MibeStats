import type { MetadataRoute } from 'next'

const BASE_URL = 'https://mibestats.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/dashboard',
    '/sales',
    '/distribution',
    '/traits',
    '/grails',
    '/map',
    '/metadatas',
    '/miladies',
    '/lore',
    '/portfolio',
  ]

  return pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/dashboard' || path === '/sales' ? 'daily' : 'weekly',
    priority: path === '' || path === '/dashboard' ? 1 : 0.8,
  }))
}
