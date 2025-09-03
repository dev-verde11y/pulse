'use client'

import { Anime, Episode } from '@/types/anime'
import { PlayIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

interface EpisodeListProps {
  anime: Anime
  season: number
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

export function EpisodeList({ anime, season, sortOrder, viewMode }: EpisodeListProps) {
  const router = useRouter()
  
  // Buscar temporada selecionada
  const selectedSeason = anime.seasons?.find(s => s.seasonNumber === season)
  
  // Episódios da temporada selecionada
  const episodes: Episode[] = selectedSeason?.episodes || []
  
  // Para mock de status assistido (futuramente virá do histórico do usuário)
  const episodesWithWatchStatus = episodes.map((episode, i) => ({
    ...episode,
    watched: i < 3, // Primeiros 3 episódios "assistidos"  
    progress: i === 2 ? 75 : undefined // Episódio 3 com 75% de progresso
  }))

  // Apply sorting
  const sortedEpisodes = sortOrder === 'desc' 
    ? episodesWithWatchStatus.sort((a, b) => b.episodeNumber - a.episodeNumber)
    : episodesWithWatchStatus.sort((a, b) => a.episodeNumber - b.episodeNumber)

  const handleEpisodeClick = (episode: Episode) => {
    router.push(`/watch/${episode.id}`)
  }

  const renderListView = () => (
    <div className="grid gap-4">
      {sortedEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex gap-4">
            
            {/* Episode Thumbnail */}
            <div className="relative flex-shrink-0 w-40 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={episode.thumbnail || anime.thumbnail || '/images/episode-placeholder.svg'}
                alt={episode.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/episode-placeholder.svg'
                }}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayIcon className="w-8 h-8 text-white" />
              </div>
              
              {/* Progress Bar */}
              {episode.progress && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-orange-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${episode.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Watched Badge */}
              {episode.watched && (
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
                {episode.watched && (
                  <span className="text-green-400 font-medium">✓ Assistido</span>
                )}
                {episode.progress && !episode.watched && (
                  <span className="text-orange-400 font-medium">{episode.progress}% assistido</span>
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
      {sortedEpisodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => handleEpisodeClick(episode)}
          className="bg-gray-900 hover:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group"
        >
          {/* Episode Thumbnail */}
          <div className="relative aspect-video bg-gray-800">
            <img
              src={episode.thumbnail || anime.thumbnail || '/images/episode-placeholder.svg'}
              alt={episode.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/episode-placeholder.svg'
              }}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PlayIcon className="w-10 h-10 text-white" />
            </div>
            
            {/* Episode Number */}
            <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
              EP {episode.episodeNumber}
            </div>
            
            {/* Duration */}
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
              {episode.duration} min
            </div>
            
            {/* Progress Bar */}
            {episode.progress && (
              <div className="absolute bottom-0 left-0 right-0">
                <div className="w-full bg-gray-600 h-1">
                  <div 
                    className="bg-orange-600 h-1 transition-all duration-300"
                    style={{ width: `${episode.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Watched Badge */}
            {episode.watched && (
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
              {episode.watched && (
                <span className="text-green-400 font-medium">✓</span>
              )}
              {episode.progress && !episode.watched && (
                <span className="text-orange-400 font-medium">{episode.progress}%</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (sortedEpisodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Nenhum episódio encontrado</div>
        <div className="text-gray-500 text-sm">Esta temporada ainda não possui episódios cadastrados.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </div>
  )
}