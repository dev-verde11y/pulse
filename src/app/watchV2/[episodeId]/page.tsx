import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WatchClientV2 } from './WatchClientV2'
import { Episode, SubtitleTrack, Anime, AudioTrack } from '@/types/anime'

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
      },
      subtitles: true,
      audioTracks: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  })

  if (!rawEpisode) {
    redirect('/dashboard')
  }

  // Cast with unknown intermediate to satisfy TS since relations might be missing from base Episode type
  const typedEpisode = (rawEpisode as unknown) as Episode & {
    season: { animeId: string; seasonNumber: number },
    subtitles: SubtitleTrack[],
    audioTracks: AudioTrack[]
  }

  const animeData = await prisma.anime.findUnique({
    where: { id: typedEpisode.season.animeId },
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
        ...typedEpisode,
        seasonNumber: typedEpisode.season.seasonNumber,
        hasVideo: !!(typedEpisode.r2Key || typedEpisode.videoUrl),
        r2SubtitlePath: typedEpisode.r2SubtitlePath
          ? typedEpisode.r2SubtitlePath.startsWith('http')
            ? typedEpisode.r2SubtitlePath
            : `${process.env.API_URL_pub}/${typedEpisode.r2SubtitlePath}`
          : null,
        subtitles: typedEpisode.subtitles.map(s => ({
          ...s,
          url: s.url.startsWith('http') ? s.url : `${process.env.API_URL_pub}/${s.url}`
        })),
        audioTracks: typedEpisode.audioTracks
      } as Episode}
      initialAnime={animeData as unknown as Anime}
      allEpisodes={allEpisodes}
      episodeId={episodeId}
      initialProgressSaved={initialProgressSaved}
    />
  )
}