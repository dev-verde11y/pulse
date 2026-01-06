import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './DashboardClient'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export const dynamic = 'force-dynamic' // Ensure fresh data on every request, or use revalidate

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const lastYearDate = new Date(currentYear - 1, 0, 1)

  // Fetch all categories in parallel for performance
  const [trending, newReleases, topRated, action, comedy] = await Promise.all([
    // Trending: Rating 16+ or 18+ (Simulating "Trending" based on adult ratings as per original logic)
    prisma.anime.findMany({
      where: {
        rating: { in: ['16+', '18+'] }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }),

    // New Releases: Created in the last year
    prisma.anime.findMany({
      where: {
        createdAt: { gte: lastYearDate }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }),

    // "Top Rated" (Original logic was just sorting by date desc, likely "Latest" effectively)
    // We'll keep it as latest for consistency with previous behavior, or if we had a rating field we'd sort by it.
    // The previous code did: sort by createdAt desc.
    prisma.anime.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    }),

    // Action Genre
    prisma.anime.findMany({
      where: {
        genres: { has: 'Ação' }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }),

    // Comedy Genre
    prisma.anime.findMany({
      where: {
        genres: { has: 'Comédia' }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <Suspense fallback={<LoadingScreen message="Carregando dashboard..." />}>
      <DashboardClient
        trending={trending}
        newReleases={newReleases}
        topRated={topRated}
        action={action}
        comedy={comedy}
      />
    </Suspense>
  )
}