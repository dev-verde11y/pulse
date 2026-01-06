'use client'

import Image from 'next/image'
import { Anime, Episode } from '@/types/anime'
import { PlayIcon, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface AnimeDetailBannerProps {
  anime: Anime
}

type WatchHistoryState = {
  watchHistory: Array<{ animeId: string; episodeId: string; progress: number; completed: boolean }>
  anime: Anime
  lastWatched: { animeId: string; episodeId: string; progress: number; completed: boolean }
} | null

export function AnimeDetailBanner({ anime }: AnimeDetailBannerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [watchHistory, setWatchHistory] = useState<WatchHistoryState>(null)
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // Carregar histórico de visualização quando o componente montar
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user || !anime.id) return

      setLoading(true)
      try {
        const allHistory = await api.getWatchHistory(1, 50)
        const animeHistory = allHistory.history?.filter((h: { animeId: string }) => h.animeId === anime.id) || []

        if (animeHistory.length === 0) {
          setWatchHistory(null)
          return
        }

        setWatchHistory({
          watchHistory: animeHistory,
          anime: anime,
          lastWatched: animeHistory[0]
        })
      } catch {
        setWatchHistory(null)
      } finally {
        setLoading(false)
      }
    }

    loadWatchHistory()
  }, [user, anime.id])

  // Verificar se o anime está nos favoritos
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !anime.id) return

      try {
        const favorites = await api.getFavorites()
        const isFav = favorites.some((fav: Anime) => fav.id === anime.id)
        setIsFavorite(isFav)
      } catch (error) {
        console.error('Erro ao verificar favoritos:', error)
        setIsFavorite(false)
      }
    }

    checkFavoriteStatus()
  }, [user, anime.id])

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (favoriteLoading) return

    try {
      setFavoriteLoading(true)

      if (isFavorite) {
        await api.removeFromFavorites(anime.id)
        setIsFavorite(false)
        toast.success('Removido dos favoritos', {
          icon: '🗑️',
          style: { background: '#ef4444', color: '#fff' },
        })
      } else {
        await api.addToFavorites(anime.id)
        setIsFavorite(true)
        toast.success('Adicionado aos favoritos', {
          icon: '❤️',
          style: { background: '#3b82f6', color: '#fff' },
        })
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast.error('Erro ao atualizar favoritos')
    } finally {
      setFavoriteLoading(false)
    }
  }

  const getFirstEpisodeOfSeason = (seasonNumber: number) => {
    const season = anime.seasons?.find(s => s.seasonNumber === seasonNumber)
    if (season?.episodes && season.episodes.length > 0) {
      return [...season.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber)[0]
    }
    return null
  }

  const getButtonState = () => {
    if (!user) return { text: 'ENTRAR PARA ASSISTIR', action: () => router.push('/login') }
    if (!watchHistory) return {
      text: 'COMEÇAR A ASSISTIR',
      action: () => {
        const firstEpisode = getFirstEpisodeOfSeason(1)
        if (firstEpisode) router.push(`/watch/${firstEpisode.id}`)
      }
    }

    const { lastWatched } = watchHistory
    const allEpisodes: Episode[] = []
    anime.seasons?.forEach(season => {
      season.episodes?.forEach(ep => allEpisodes.push({ ...ep, seasonNumber: season.seasonNumber }))
    })
    allEpisodes.sort((a, b) => (a.seasonNumber || 1) !== (b.seasonNumber || 1) ? (a.seasonNumber || 1) - (b.seasonNumber || 1) : a.episodeNumber - b.episodeNumber)

    const lastEpisodeIndex = allEpisodes.findIndex(ep => ep.id === lastWatched.episodeId)
    if (lastEpisodeIndex === -1) return {
      text: 'COMEÇAR A ASSISTIR',
      action: () => {
        const firstEpisode = getFirstEpisodeOfSeason(1)
        if (firstEpisode) router.push(`/watch/${firstEpisode.id}`)
      }
    }

    const lastEpisode = allEpisodes[lastEpisodeIndex]
    const isLastEpisodeComplete = lastWatched.completed || (lastWatched.progress && lastWatched.progress >= 90)

    if (!isLastEpisodeComplete) return {
      text: `CONTINUAR T${lastEpisode.seasonNumber} E${lastEpisode.episodeNumber}`,
      action: () => router.push(`/watch/${lastEpisode.id}`)
    }

    if (lastEpisodeIndex + 1 < allEpisodes.length) {
      const nextEpisode = allEpisodes[lastEpisodeIndex + 1]
      return {
        text: `PRÓXIMO: T${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}`,
        action: () => router.push(`/watch/${nextEpisode.id}`)
      }
    }

    return {
      text: 'REASSISTIR SÉRIE',
      action: () => {
        const firstEpisode = getFirstEpisodeOfSeason(1)
        if (firstEpisode) router.push(`/watch/${firstEpisode.id}`)
      }
    }
  }

  const buttonState = getButtonState()
  const rating = anime._count?.favorites ? Math.min(5.0, 3.8 + (anime._count.favorites / 5000)) : 4.5
  const ratingCount = anime._count?.favorites ? (anime._count.favorites * 3).toLocaleString('pt-BR') : '2.4K'

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={(anime.bannerUrl || anime.banner || anime.posterUrl || anime.thumbnail)!}
          alt=""
          fill
          className="object-cover scale-105 blur-[2px] opacity-40 transition-transform duration-[10s] ease-linear group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-black/40 z-0" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 md:gap-16">

          {/* Hero Poster with Premium Glow */}
          <div className="flex-shrink-0 relative group animate-fade-in">
            <div className="absolute -inset-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-64 h-96 md:w-80 md:h-[480px]">
              <Image
                src={(anime.posterUrl || anime.thumbnail || anime.banner)!}
                alt={anime.title}
                fill
                className="object-cover rounded-2xl shadow-2xl border border-white/10"
                priority
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20"></div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            {/* Breadcrumbs / Small Label */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <span className="h-[2px] w-8 bg-blue-500 rounded-full"></span>
              <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
                {(anime.totalEpisodes || 0) <= 1 ? 'Filme Original' : 'Série de Animação'}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
              {anime.title}
            </h1>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full ring-1 ring-white/5">
                <StarIconSolid className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-white font-bold text-sm tracking-tight">{rating.toFixed(1)}</span>
                <span className="text-white/40 text-xs font-medium border-l border-white/10 pl-1.5 ml-0.5">{ratingCount}</span>
              </div>

              <div className="flex items-center gap-3 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 px-4 py-1.5 rounded-full">
                <span className="text-blue-400 font-black text-[10px] tracking-widest">{anime.rating}+</span>
                <span className="h-3 w-[1px] bg-blue-500/30"></span>
                <span className="text-blue-400 font-bold text-[10px] tracking-widest uppercase">Leg | Dub</span>
              </div>

              <div className="flex items-center gap-2">
                {anime.genres?.slice(0, 3).map((g, i) => (
                  <span key={i} className="text-xs font-black text-white/60 uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl font-medium line-clamp-3">
              {anime.description || `Explore o épico universo de ${anime.title}. Uma jornada inesquecível repleta de aventura, superação e momentos lendários que marcaram gerações.`}
            </p>

            {/* Action Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={buttonState.action}
                disabled={loading}
                className="group relative w-full sm:w-auto px-10 py-5 bg-blue-600 rounded-full font-black text-sm uppercase tracking-[0.2em] text-white hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-600/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center justify-center gap-3">
                  <PlayIcon className="w-5 h-5" />
                  {loading ? 'Sincronizando...' : buttonState.text}
                </div>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`flex items-center justify-center w-14 h-14 rounded-full border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-90 ${isFavorite ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                  {favoriteLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : isFavorite ? (
                    <HeartIconSolid className="w-6 h-6" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>

                <div className="h-10 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

                <div className="flex flex-col text-xs font-bold text-white/40 uppercase tracking-widest leading-none gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>{anime.year}</span>
                  </div>
                  <div>{anime.totalEpisodes || 'Movie'} EPISÓDIOS</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Detail Grid Overlay - Bottom Section for extra info */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 hidden lg:block"></div>
    </section>
  )
}
