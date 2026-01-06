'use client'

import Image from 'next/image'
import { Anime, Episode } from '@/types/anime'
import { PlayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { EpisodeFilters } from './SeasonSelector'

interface EpisodeListProps {
  anime: Anime
  season: number
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  filters: EpisodeFilters
}

export function EpisodeList({ anime, season, sortOrder, viewMode, filters }: EpisodeListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [watchHistory, setWatchHistory] = useState<Array<{ episodeId: string; progress: number; completed: boolean }>>([])

  // Buscar temporada selecionada
  const selectedSeason = anime.seasons?.find(s => s.seasonNumber === season)
  const episodes: Episode[] = selectedSeason?.episodes || []

  // Verificar disponibilidade
  const isEpisodeAvailable = (episode: Episode) => {
    return !!((episode.videoUrl || episode.hasVideo) && episode.title && episode.id)
  }

  // Carregar histórico
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user) return
      try {
        const history = await api.getWatchHistory(1, 100)
        const animeHistory = history.history.filter((h: { animeId: string }) => h.animeId === anime.id)
        setWatchHistory(animeHistory)
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
    loadWatchHistory()
  }, [user, anime.id])

  const getEpisodeProgress = (episodeId: string) => {
    const historyItem = watchHistory.find(h => h.episodeId === episodeId)
    if (!historyItem) return { watched: false, progress: 0, completed: false }
    return {
      watched: true,
      progress: Math.round(historyItem.progress || 0),
      completed: (historyItem.progress >= 90) || historyItem.completed
    }
  }

  const episodesWithWatchStatus = episodes.map((episode) => {
    const progressData = getEpisodeProgress(episode.id)
    return {
      ...episode,
      available: isEpisodeAvailable(episode),
      watched: progressData.watched,
      progress: progressData.progress,
      completed: progressData.completed
    }
  })

  const sortedEpisodes = [...episodesWithWatchStatus].sort((a, b) =>
    sortOrder === 'desc' ? b.episodeNumber - a.episodeNumber : a.episodeNumber - b.episodeNumber
  )

  const filteredEpisodes = sortedEpisodes.filter((episode) => {
    if (filters.status !== 'all') {
      if (filters.status === 'not_watched' && episode.watched) return false
      if (filters.status === 'in_progress' && (!episode.watched || episode.completed)) return false
      if (filters.status === 'completed' && !episode.completed) return false
    }
    if (filters.availability !== 'all') {
      if (filters.availability === 'available' && !episode.available) return false
      if (filters.availability === 'unavailable' && episode.available) return false
    }
    return true
  })

  const handleEpisodeClick = (episode: Episode & { available: boolean }) => {
    if (!episode.available) return
    router.push(`/watch/${episode.id}`)
  }

  const renderListView = () => (
    <div className="grid gap-6 animate-fade-in">
      {filteredEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className={`group bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl p-4 transition-all duration-500 border border-white/[0.05] hover:border-blue-500/30 backdrop-blur-sm ${episode.available
            ? 'cursor-pointer hover:translate-x-1'
            : 'opacity-40 cursor-not-allowed grayscale'
            }`}
        >
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-shrink-0 w-full sm:w-64 aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={(episode.thumbnailUrl || episode.thumbnail || anime.posterUrl || '/images/episode-placeholder.svg')!}
                alt={episode.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {episode.available ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-blue-600 rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                    <PlayIcon className="w-8 h-8 text-white ml-0.5" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Brevemente</span>
                  </div>
                </div>
              )}
              {episode.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${episode.completed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                      }`}
                    style={{ width: `${episode.progress}%` }}
                  />
                </div>
              )}
              {episode.completed && (
                <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-lg border border-green-400/50">
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center py-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">Episódio {episode.episodeNumber}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {episode.title}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-widest font-mono">
                  {episode.duration || 24} MIN
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors">
                {episode.description || `Prepare-se para mais um capítulo emocionante de ${anime.title}.`}
              </p>
              <div className="flex items-center gap-6 mt-auto">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  <span className="block w-1 h-1 rounded-full bg-blue-500"></span>
                  Leg | Dub
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-fade-in">
      {filteredEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className={`group bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden transition-all duration-500 border border-white/[0.05] hover:border-blue-500/30 flex flex-col ${episode.available
            ? 'cursor-pointer hover:-translate-y-2'
            : 'opacity-40 cursor-not-allowed grayscale'
            }`}
        >
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
            <Image
              src={(episode.thumbnailUrl || episode.thumbnail || anime.posterUrl || '/images/episode-placeholder.svg')!}
              alt={episode.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {episode.available ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-blue-600 rounded-full p-4 shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500">
                  <PlayIcon className="w-8 h-8 text-white ml-0.5" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Em Breve</span>
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-black tracking-tighter border border-white/10 uppercase font-mono">
              E{episode.episodeNumber}
            </div>
            {episode.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${episode.completed ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${episode.progress}%` }}
                />
              </div>
            )}
            {episode.completed && (
              <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-lg border border-green-400/50">
                <CheckCircleIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate mb-2">
              {episode.title}
            </h3>
            <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 font-mono">
              <span>HD | LEG</span>
              {episode.progress > 0 && (
                <span className={episode.completed ? 'text-green-500' : 'text-blue-500'}>
                  {episode.completed ? 'VISTO' : `${episode.progress}%`}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (filteredEpisodes.length === 0) {
    return (
      <div className="text-center py-20 px-4 animate-fade-in bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5">
          <ExclamationTriangleIcon className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-white font-black text-xl mb-2 tracking-tight uppercase">Nada por aqui</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto uppercase tracking-widest font-bold leading-loose">
          Ajuste seus filtros para encontrar o episódio que procura.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  )
}