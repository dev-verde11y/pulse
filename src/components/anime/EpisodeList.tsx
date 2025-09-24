'use client'

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
  const [watchHistory, setWatchHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Buscar temporada selecionada
  const selectedSeason = anime.seasons?.find(s => s.seasonNumber === season)
  
  // Episódios da temporada selecionada
  const episodes: Episode[] = selectedSeason?.episodes || []
  
  // Verificar disponibilidade do episódio baseado em duração e título
  const isEpisodeAvailable = (episode: Episode) => {
    // Se tem duração e título, consideramos disponível
    // (campos sensíveis foram removidos da API pública por segurança)
    return !!(episode.duration && episode.title && episode.id)
  }

  // Carregar histórico do usuário
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const history = await api.getWatchHistory(1, 100) // Buscar histórico
        const animeHistory = history.history.filter((h: any) => h.animeId === anime.id)
        setWatchHistory(animeHistory)
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
        setWatchHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadWatchHistory()
  }, [user, anime.id])

  // Função para obter dados de progresso de um episódio
  const getEpisodeProgress = (episodeId: string) => {
    const historyItem = watchHistory.find(h => h.episodeId === episodeId)
    if (!historyItem) {
      return { watched: false, progress: 0, completed: false }
    }
    
    return {
      watched: true,
      progress: Math.round(historyItem.progress || 0),
      completed: (historyItem.progress >= 90) || historyItem.completed
    }
  }

  // Episódios com status real do histórico
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

  // Apply sorting
  const sortedEpisodes = sortOrder === 'desc' 
    ? episodesWithWatchStatus.sort((a, b) => b.episodeNumber - a.episodeNumber)
    : episodesWithWatchStatus.sort((a, b) => a.episodeNumber - b.episodeNumber)

  // Apply filters
  const filteredEpisodes = sortedEpisodes.filter((episode) => {
    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'not_watched':
          if (episode.watched) return false
          break
        case 'in_progress':
          if (!episode.watched || episode.completed) return false
          break
        case 'completed':
          if (!episode.completed) return false
          break
      }
    }
    
    // Availability filter
    if (filters.availability !== 'all') {
      switch (filters.availability) {
        case 'available':
          if (!episode.available) return false
          break
        case 'unavailable':
          if (episode.available) return false
          break
      }
    }
    
    return true
  })

  const handleEpisodeClick = (episode: Episode & { available: boolean }) => {
    if (!episode.available) {
      return // Não redireciona se episódio não estiver disponível
    }
    router.push(`/watch/${episode.id}`)
  }

  const renderListView = () => (
    <div className="grid gap-4">
      {filteredEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className={`bg-gray-900 rounded-lg p-4 transition-all duration-300 group ${
            episode.available 
              ? 'hover:bg-gray-800 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed grayscale'
          }`}
        >
          <div className="flex gap-4">
            
            {/* Episode Thumbnail */}
            <div className="relative flex-shrink-0 w-40 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={episode.thumbnailUrl || episode.thumbnail || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg'}
                alt={episode.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/episode-placeholder.svg'
                }}
              />
              
              {/* Play Button Overlay */}
              {episode.available ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <span className="text-gray-400 text-xs font-medium">Indisponível</span>
                  </div>
                </div>
              )}
              
              {/* Progress Bar */}
              {episode.progress > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        episode.completed ? 'bg-green-500' : 'bg-orange-600'
                      }`}
                      style={{ width: `${episode.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Progress Percentage */}
              {episode.progress > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                  {episode.progress}%
                </div>
              )}
              
              {/* Watched Badge */}
              {episode.completed && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            
            {/* Episode Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {episode.episodeNumber}. {episode.title}
                </h3>
                <span className="text-sm text-gray-400 ml-4 flex-shrink-0">
                  {episode.duration || 24} min
                </span>
              </div>
              
              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                {episode.description || `Episódio ${episode.episodeNumber} de ${anime.title}`}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>LEG | DUB</span>
                {!episode.available && (
                  <span className="text-red-400 font-medium">⚠ Indisponível</span>
                )}
                {episode.available && episode.completed && (
                  <span className="text-green-400 font-medium">✓ Completo</span>
                )}
                {episode.available && episode.progress > 0 && !episode.completed && (
                  <span className="text-orange-400 font-medium">{episode.progress}% assistido</span>
                )}
                {episode.available && !episode.watched && (
                  <span className="text-blue-400 font-medium">Não assistido</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 group ${
            episode.available 
              ? 'hover:bg-gray-800 cursor-pointer' 
              : 'opacity-50 cursor-not-allowed grayscale'
          }`}
        >
          {/* Episode Thumbnail */}
          <div className="relative aspect-video bg-gray-800">
            <img
              src={episode.thumbnailUrl || episode.thumbnail || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg'}
              alt={episode.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/episode-placeholder.svg'
              }}
            />
            
            {/* Play Button Overlay */}
            {episode.available ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <span className="text-gray-400 text-xs font-medium">Indisponível</span>
                </div>
              </div>
            )}
            
            {/* Episode Number */}
            <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
              EP {episode.episodeNumber}
            </div>
            
            {/* Duration */}
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
              {episode.duration} min
            </div>
            
            {/* Progress Bar */}
            {episode.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0">
                <div className="w-full bg-gray-600 h-1.5">
                  <div 
                    className={`h-1.5 transition-all duration-300 ${
                      episode.completed ? 'bg-green-500' : 'bg-orange-600'
                    }`}
                    style={{ width: `${episode.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Progress Percentage */}
            {episode.progress > 0 && (
              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                {episode.progress}%
              </div>
            )}
            
            {/* Watched Badge */}
            {episode.completed && (
              <div className="absolute bottom-2 right-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            )}
          </div>
          
          {/* Episode Info */}
          <div className="p-3">
            <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate mb-1">
              {episode.title}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {episode.description || `Episódio ${episode.episodeNumber} de ${anime.title}`}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>LEG | DUB</span>
              {!episode.available && (
                <span className="text-red-400 font-medium">⚠</span>
              )}
              {episode.available && episode.completed && (
                <span className="text-green-400 font-medium">✓</span>
              )}
              {episode.available && episode.progress > 0 && !episode.completed && (
                <span className="text-orange-400 font-medium">{episode.progress}%</span>
              )}
              {episode.available && !episode.watched && (
                <span className="text-blue-400 font-medium">•</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (filteredEpisodes.length === 0) {
    const hasEpisodes = episodes.length > 0
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          {hasEpisodes ? 'Nenhum episódio corresponde aos filtros' : 'Nenhum episódio encontrado'}
        </div>
        <div className="text-gray-500 text-sm">
          {hasEpisodes 
            ? 'Tente ajustar os filtros para ver mais episódios.' 
            : 'Esta temporada ainda não possui episódios cadastrados.'
          }
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  )
}