import type { MetadataRoute } from 'next'

const BASE_URL = 'https://mibestats.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/eden',
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
    changeFrequency: path === '' || path === '/eden' || path === '/sales' ? 'daily' : 'weekly',
    priority: path === '' || path === '/eden' ? 1 : 0.8,
  }))
}
