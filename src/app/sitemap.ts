import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.com'

    // Buscar todos os animes
    const animes = await prisma.anime.findMany({
        select: {
            id: true,
            slug: true,
            updatedAt: true,
        },
        where: {
            // Apenas animes publicados/ativos se houver esse campo
        }
    })

    // Rotas estáticas
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/browse`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/plans`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    // Rotas dinâmicas de animes
    const animeRoutes: MetadataRoute.Sitemap = animes.map((anime) => ({
        url: `${baseUrl}/anime/${anime.id}`,
        lastModified: anime.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticRoutes, ...animeRoutes]
}
