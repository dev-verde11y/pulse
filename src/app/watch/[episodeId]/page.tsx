import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WatchClient } from './WatchClient'
import { Episode } from '@/types/anime'

export default async function WatchPage({ params }: { params: Promise<{ episodeId: string }> }) {
  const session = await auth()

  // No server, fazemos o redirecionamento imediato se não houver sessão
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { episodeId } = await params

  // 1. Buscar dados do episódio atual
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

  // 2. Buscar dados do anime e todos os episódios de todas as temporadas
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

  // 3. Processar lista completa de episódios para a playlist
  const allEpisodes: Episode[] = []
  animeData.seasons.forEach((season) => {
    season.episodes.forEach(ep => {
      allEpisodes.push({
        ...ep,
        seasonNumber: season.seasonNumber,
        // Adicionar flag de disponibilidade (hasVideo) se houver r2Key ou videoUrl
        hasVideo: !!(ep.r2Key || ep.videoUrl)
      } as Episode)
    })
  })

  // 4. Buscar histórico de visualização para este episódio específico
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
    <WatchClient
      initialEpisode={{
        ...rawEpisode,
        seasonNumber: rawEpisode.season.seasonNumber,
        hasVideo: !!(rawEpisode.r2Key || rawEpisode.videoUrl)
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