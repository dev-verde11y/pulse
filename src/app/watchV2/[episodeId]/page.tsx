import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WatchClientV2 } from './WatchClientV2'
import { Episode } from '@/types/anime'

export default async function WatchPageV2({ params }: { params: Promise<{ episodeId: string }> }) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { episodeId } = await params

  const rawEpisode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      season: {
        select: {
          id: true,
          animeId: true,
          seasonNumber: true
        }
      }
    }
  })

  if (!rawEpisode) {
    redirect('/dashboard')
  }

  const animeData = await prisma.anime.findUnique({
    where: { id: rawEpisode.season.animeId },
    include: {
      seasons: {
        include: {
          episodes: {
            orderBy: { episodeNumber: 'asc' }
          }
        },
        orderBy: { seasonNumber: 'asc' }
      }
    }
  })

  if (!animeData) {
    redirect('/dashboard')
  }

  const allEpisodes: Episode[] = []
  animeData.seasons.forEach((season) => {
    season.episodes.forEach(ep => {
      allEpisodes.push({
        ...ep,
        seasonNumber: season.seasonNumber,
        hasVideo: !!(ep.r2Key || ep.videoUrl)
      } as Episode)
    })
  })

  const episodeHistory = await prisma.watchHistory.findFirst({
    where: {
      userId: session.user.id,
      episodeId: episodeId
    }
  })

  const initialProgressSaved = (episodeHistory && episodeHistory.progress < 95)
    ? episodeHistory.progress
    : 0

  return (
    <WatchClientV2
      initialEpisode={{
        ...rawEpisode,
        seasonNumber: rawEpisode.season.seasonNumber,
        hasVideo: !!(rawEpisode.r2Key || rawEpisode.videoUrl),
        r2SubtitlePath: rawEpisode.r2SubtitlePath
          ? rawEpisode.r2SubtitlePath.startsWith('http')
            ? rawEpisode.r2SubtitlePath
            : `${process.env.API_URL_pub}/${rawEpisode.r2SubtitlePath}`
          : null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialAnime={animeData as any}
      allEpisodes={allEpisodes}
      episodeId={episodeId}
      initialProgressSaved={initialProgressSaved}
    />
  )
}