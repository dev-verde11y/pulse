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
    // Trending: Based on Global Popularity (Favorites + Watch History)
    prisma.anime.findMany({
      take: 10,
      orderBy: [
        { favorites: { _count: 'desc' } },
        { watchHistory: { _count: 'desc' } }
      ]
    }),

    // New Releases: Created in the last year
    prisma.anime.findMany({
      where: {
        createdAt: { gte: lastYearDate }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    }),

    // Top Rated (Effective sorting by rating and popularity)
    prisma.anime.findMany({
      orderBy: [
        { favorites: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
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