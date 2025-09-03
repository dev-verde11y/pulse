'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { api } from '@/lib/api'
import { Episode, Anime } from '@/types/anime'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  const episodeId = params.episodeId as string

  useEffect(() => {
    async function loadEpisodeData() {
      try {
        // Buscar episódio
        const episodeData = await api.getEpisode(episodeId)
        setEpisode(episodeData)

        // Buscar anime completo para ter todos os episódios
        const animeData = await api.getAnime(episodeData.season.animeId)
        setAnime(animeData)

        // Coletar todos os episódios de todas as temporadas
        const episodes: Episode[] = []
        animeData.seasons?.forEach(season => {
          if (season.episodes) {
            episodes.push(...season.episodes.map(ep => ({ ...ep, seasonNumber: season.seasonNumber })))
          }
        })

        // Ordenar episódios por temporada e número do episódio
        episodes.sort((a, b) => {
          if (a.seasonNumber !== b.seasonNumber) {
            return a.seasonNumber - b.seasonNumber
          }
          return a.episodeNumber - b.episodeNumber
        })

        setAllEpisodes(episodes)
        
        // Encontrar índice do episódio atual
        const currentIndex = episodes.findIndex(ep => ep.id === episodeId)
        setCurrentEpisodeIndex(currentIndex)

      } catch (error) {
        console.error('Error loading episode:', error)
        router.push('/dashboard')
      } finally {
        setDataLoading(false)
      }
    }

    if (episodeId) {
      loadEpisodeData()
    }
  }, [episodeId, router])

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentEpisodeIndex + 1]
      router.push(`/watch/${nextEpisode.id}`)
    }
  }

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const previousEpisode = allEpisodes[currentEpisodeIndex - 1]
      router.push(`/watch/${previousEpisode.id}`)
    }
  }

  const handleBackToAnime = () => {
    if (anime) {
      router.push(`/anime/${anime.id}`)
    }
  }

  if (loading || dataLoading) {
    return <LoadingScreen message="Carregando episódio..." />
  }

  if (!episode || !anime) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Episódio não encontrado</h1>
          <p className="text-gray-400">O episódio que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Button */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBackToAnime}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Voltar para {anime.title}</span>
            </button>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Temporada {episode.seasonNumber} • Episódio {episode.episodeNumber}
              </div>
              <div className="text-lg font-bold">
                {episode.title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-video w-full mb-8">
          <VideoPlayer
            episode={episode}
            onNextEpisode={handleNextEpisode}
            onPreviousEpisode={handlePreviousEpisode}
            hasNextEpisode={currentEpisodeIndex < allEpisodes.length - 1}
            hasPreviousEpisode={currentEpisodeIndex > 0}
          />
        </div>

        {/* Episode Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Episode Details */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-4">
              {episode.title}
            </h1>
            <p className="text-gray-300 mb-6">
              {episode.description || `Episódio ${episode.episodeNumber} de ${anime.title}`}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
              <span>Duração: {episode.duration || 24} min</span>
              <span>Temporada {episode.seasonNumber}</span>
              <span>Episódio {episode.episodeNumber}</span>
            </div>

            {/* Anime Info */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Sobre o Anime</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={anime.thumbnail || '/images/placeholder.jpg'}
                  alt={anime.title}
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-bold text-white mb-2">{anime.title}</h4>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {anime.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.slice(0, 4).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Episode List Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4">Próximos Episódios</h3>
            <div className="bg-gray-900 rounded-lg max-h-96 overflow-y-auto">
              {allEpisodes.slice(currentEpisodeIndex, currentEpisodeIndex + 10).map((ep, index) => (
                <button
                  key={ep.id}
                  onClick={() => router.push(`/watch/${ep.id}`)}
                  className={`w-full text-left p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0 ${
                    ep.id === episodeId ? 'bg-blue-600/20 border-blue-600/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-10 bg-gray-700 rounded bg-cover bg-center"
                           style={{ backgroundImage: `url(${ep.thumbnail || anime.thumbnail})` }}>
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {ep.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        T{ep.seasonNumber} • EP {ep.episodeNumber}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}