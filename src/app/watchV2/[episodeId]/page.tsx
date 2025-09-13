'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { VideoPlayerV2 } from '@/components/video/VideoPlayerV2'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { api } from '@/lib/api'
import { Episode, Anime, Season } from '@/types/anime'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { PlayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid'

export default function WatchV2Page() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [showEpisodeList, setShowEpisodeList] = useState(false)

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
        animeData.seasons?.forEach((season: Season) => {
          if (season.episodes) {
            episodes.push(...season.episodes.map(ep => ({ ...ep, seasonNumber: season.seasonNumber })))
          }
        })

        // Ordenar episódios por temporada e número do episódio
        episodes.sort((a, b) => {
          if ((a.seasonNumber ?? 1) !== (b.seasonNumber ?? 1)) {
            return (a.seasonNumber ?? 1) - (b.seasonNumber ?? 1)
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
      // Procurar próximo episódio disponível
      for (let i = currentEpisodeIndex + 1; i < allEpisodes.length; i++) {
        const nextEpisode = allEpisodes[i]
        if (nextEpisode.videoUrl || nextEpisode.r2Key) {
          router.push(`/watchV2/${nextEpisode.id}`)
          return
        }
      }
      // Se não encontrou nenhum disponível, não navega
    }
  }

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      // Procurar episódio anterior disponível
      for (let i = currentEpisodeIndex - 1; i >= 0; i--) {
        const previousEpisode = allEpisodes[i]
        if (previousEpisode.videoUrl || previousEpisode.r2Key) {
          router.push(`/watchV2/${previousEpisode.id}`)
          return
        }
      }
      // Se não encontrou nenhum disponível, não navega
    }
  }

  // Helper functions to check if navigation is available
  const hasNextAvailableEpisode = () => {
    for (let i = currentEpisodeIndex + 1; i < allEpisodes.length; i++) {
      if (allEpisodes[i].videoUrl || allEpisodes[i].r2Key) {
        return true
      }
    }
    return false
  }

  const hasPreviousAvailableEpisode = () => {
    for (let i = currentEpisodeIndex - 1; i >= 0; i--) {
      if (allEpisodes[i].videoUrl || allEpisodes[i].r2Key) {
        return true
      }
    }
    return false
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

  // Legendas de exemplo (desabilitadas por padrão para evitar 404s)
  // Para habilitar, descomente e configure o servidor de legendas
  const testSubtitles: any[] = []
  
  // Exemplo de como configurar legendas quando disponíveis:
  // const testSubtitles = [
  //   {
  //     id: 'pt-br',
  //     label: '🇧🇷 Português',
  //     language: 'pt-BR',
  //     src: `/api/subtitles/${episode.id}/pt-br.vtt`,
  //     enabled: false
  //   }
  // ]

  return (
    <div className="min-h-screen bg-black text-white">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
      
      {/* Enhanced Header with V2 Badge */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Navigation */}
            <div className="flex items-center space-x-6">
              {/* Pulse Logo - Home */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
                title="Voltar ao Dashboard"
              >
                <img 
                  src="/images/logo.png" 
                  alt="Pulse" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.style.display = 'block'
                    }
                  }}
                />
                <span 
                  className="hidden text-xl font-bold text-white"
                  style={{ display: 'none' }}
                >
                  PULSE
                </span>
              </button>

              {/* V2 Badge */}
              <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                V2 HYBRID PLAYER
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-600"></div>

              {/* Back to Anime */}
              <button
                onClick={handleBackToAnime}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:bg-gray-800 px-3 py-2 rounded-lg group"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Voltar para</span>
                  <span className="text-sm font-medium truncate max-w-32 sm:max-w-48">
                    {anime.title}
                  </span>
                </div>
              </button>

              {/* Episode Navigation */}
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handlePreviousEpisode}
                  disabled={!hasPreviousAvailableEpisode()}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                  title={hasPreviousAvailableEpisode() ? "Episódio anterior" : "Nenhum episódio anterior disponível"}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNextAvailableEpisode()}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                  title={hasNextAvailableEpisode() ? "Próximo episódio" : "Nenhum próximo episódio disponível"}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Center Section - Episode Info */}
            <div className="hidden md:block text-center">
              <div className="text-sm text-gray-400">
                Temporada {episode.seasonNumber} • Episódio {episode.episodeNumber} de {allEpisodes.length}
              </div>
              <div className="text-lg font-bold truncate max-w-md">
                {episode.title}
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-3">
              {/* Mobile Episode Navigation */}
              <div className="flex sm:hidden items-center space-x-1">
                <button
                  onClick={handlePreviousEpisode}
                  disabled={!hasPreviousAvailableEpisode()}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title={hasPreviousAvailableEpisode() ? "Anterior" : "Sem episódio anterior disponível"}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNextAvailableEpisode()}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title={hasNextAvailableEpisode() ? "Próximo" : "Sem próximo episódio disponível"}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Episode Progress */}
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                <span className="font-medium">{currentEpisodeIndex + 1}</span>
                <span>/</span>
                <span>{allEpisodes.length}</span>
              </div>

              {/* Episode List Toggle */}
              <button
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  showEpisodeList 
                    ? 'bg-blue-600 text-white shadow-blue-600/25 shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                title={showEpisodeList ? 'Ocultar lista' : 'Mostrar lista de episódios'}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>

              {/* Quick Actions Menu */}
              <div className="relative group">
                <button
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                  title="Mais opções"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      🏠 Ir para Dashboard
                    </button>
                    <button
                      onClick={handleBackToAnime}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      📺 Detalhes do Anime
                    </button>
                    <button
                      onClick={() => router.push(`/watch/${episodeId}`)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      🔄 Player V1 (Original)
                    </button>
                    <hr className="border-gray-700 my-1" />
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      ⚙️ Configurações do Player V2
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      🔄 Recarregar Episódio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Episode Info */}
          <div className="md:hidden pb-3 border-t border-gray-800 pt-3 -mt-px">
            <div className="text-sm text-gray-400 text-center">
              Temporada {episode.seasonNumber} • Episódio {episode.episodeNumber} de {allEpisodes.length}
            </div>
            <div className="text-base font-bold text-center truncate">
              {episode.title}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player V2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-video w-full mb-8">
          <VideoPlayerV2
            episode={episode}
            animeId={anime.id}
            onNextEpisode={handleNextEpisode}
            onPreviousEpisode={handlePreviousEpisode}
            hasNextEpisode={hasNextAvailableEpisode()}
            hasPreviousEpisode={hasPreviousAvailableEpisode()}
            subtitles={testSubtitles}
          />
        </div>

        {/* Enhanced Episode Info */}
        <div className="relative">
          <div className={`grid transition-all duration-300 ${
            showEpisodeList ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'
          } gap-8`}>
            
            {/* Episode Details */}
            <div className={`${showEpisodeList ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
              {/* V2 Features Info */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-bold text-blue-300 mb-2 flex items-center">
                  🚀 Player V2 Híbrido - Funcionalidades Avançadas
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-300">
                    <div>🎵 <strong>Trilhas de áudio</strong> múltiplas</div>
                    <div>💬 <strong>Legendas</strong> externas</div>
                  </div>
                  <div className="text-gray-300">
                    <div>⚙️ <strong>Configurações</strong> avançadas</div>
                    <div>📺 <strong>Interface</strong> aprimorada</div>
                  </div>
                </div>
              </div>

              {/* Episode Header with Quick Actions */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {episode.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <span>Duração: {episode.duration || 24} min</span>
                    <span>•</span>
                    <span>T{episode.seasonNumber} EP{episode.episodeNumber}</span>
                    <span>•</span>
                    <span>{currentEpisodeIndex + 1} de {allEpisodes.length}</span>
                  </div>
                </div>
                
                {/* Quick Navigation */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousEpisode}
                    disabled={!hasPreviousAvailableEpisode()}
                    className="p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105"
                    title={hasPreviousAvailableEpisode() ? "Episódio anterior disponível" : "Nenhum episódio anterior disponível"}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleNextEpisode}
                    disabled={!hasNextAvailableEpisode()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105"
                    title={hasNextAvailableEpisode() ? "Próximo episódio disponível" : "Nenhum próximo episódio disponível"}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {episode.description || `Episódio ${episode.episodeNumber} de ${anime.title}. Continue assistindo esta emocionante temporada com todos os seus momentos favoritos.`}
              </p>

              {/* Anime Info Card */}
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <PlayIcon className="w-6 h-6 text-blue-400 mr-2" />
                  Sobre o Anime
                </h3>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={anime.thumbnail || '/images/episode-placeholder.svg'}
                      alt={anime.title}
                      className="w-28 h-40 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-white mb-3 text-lg">{anime.title}</h4>
                    <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
                      {anime.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {anime.genres.slice(0, 5).map((genre, index) => (
                        <span
                          key={index}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{anime.year}</span>
                      <span>•</span>
                      <span>{anime.totalEpisodes || allEpisodes.length} episódios</span>
                      <span>•</span>
                      <span>{anime.rating}+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Episode List Sidebar */}
            <div className={`${showEpisodeList ? 'lg:col-span-1' : 'lg:col-span-1'} ${!showEpisodeList ? 'hidden lg:block' : ''}`}>
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Lista de Episódios</h3>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {allEpisodes.length}
                  </span>
                </div>
                
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {allEpisodes.map((ep, index) => {
                      const isCurrentEpisode = ep.id === episodeId
                      const isWatched = index < currentEpisodeIndex
                      const isAvailable = ep.videoUrl || ep.r2Key
                      
                      return (
                        <button
                          key={ep.id}
                          onClick={() => isAvailable && router.push(`/watchV2/${ep.id}`)}
                          disabled={!isAvailable}
                          className={`w-full text-left p-4 transition-all duration-200 border-b border-gray-800/50 last:border-b-0 group ${
                            !isAvailable
                              ? 'opacity-50 cursor-not-allowed bg-gray-900/50'
                              : isCurrentEpisode 
                                ? 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/30 hover:bg-gray-800/60' 
                                : isWatched 
                                  ? 'bg-green-600/10 hover:bg-gray-800/60' 
                                  : 'hover:bg-gray-800/60'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Episode Thumbnail */}
                            <div className="flex-shrink-0 relative">
                              <img
                                src={ep.thumbnailUrl || ep.thumbnail || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg'}
                                alt={ep.title}
                                className="w-20 h-12 bg-gray-700 rounded-lg object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/episode-placeholder.svg'
                                }}
                              />
                              
                              {/* Status Indicators */}
                              {isCurrentEpisode && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <PlayIcon className="w-2 h-2 text-white" />
                                </div>
                              )}
                              
                              {!isCurrentEpisode && isWatched && isAvailable && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                              
                              {!isAvailable && (
                                <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
                              )}
                              
                              {/* Episode Number Badge */}
                              <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold ${
                                !isAvailable ? 'bg-red-600 text-white' : 'bg-black/80 text-white'
                              }`}>
                                {ep.episodeNumber}
                              </div>
                            </div>
                            
                            {/* Episode Info */}
                            <div className="flex-grow min-w-0">
                              <div className={`font-medium truncate transition-colors ${
                                !isAvailable 
                                  ? 'text-gray-500' 
                                  : isCurrentEpisode 
                                    ? 'text-blue-300' 
                                    : 'text-white group-hover:text-blue-300'
                              }`}>
                                {ep.title}
                              </div>
                              <div className={`text-sm mt-1 ${!isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                                Temporada {ep.seasonNumber} • Episódio {ep.episodeNumber}
                              </div>
                              <div className={`text-xs mt-1 ${!isAvailable ? 'text-gray-600' : 'text-gray-500'}`}>
                                <span>{ep.duration || 24} min</span>
                                {!isAvailable && (
                                  <span className="text-red-500 font-medium ml-2">• Indisponível</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Episode List Toggle */}
          {showEpisodeList && (
            <div className="lg:hidden mt-8">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {allEpisodes.map((ep, index) => {
                    const isCurrentEpisode = ep.id === episodeId
                    const isWatched = index < currentEpisodeIndex
                    const isAvailable = ep.videoUrl || ep.r2Key
                    
                    return (
                      <button
                        key={ep.id}
                        onClick={() => isAvailable && router.push(`/watchV2/${ep.id}`)}
                        disabled={!isAvailable}
                        className={`w-full text-left p-3 transition-colors border-b border-gray-800/50 last:border-b-0 ${
                          !isAvailable
                            ? 'opacity-50 cursor-not-allowed bg-gray-900/50'
                            : isCurrentEpisode 
                              ? 'bg-blue-600/20 border-blue-600/30 hover:bg-gray-800/60' 
                              : 'hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={ep.thumbnailUrl || ep.thumbnail || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg'}
                              alt={ep.title}
                              className="w-16 h-10 bg-gray-700 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/episode-placeholder.svg'
                              }}
                            />
                            
                            {/* Status Indicators */}
                            {isCurrentEpisode && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <PlayIcon className="w-1.5 h-1.5 text-white" />
                              </div>
                            )}
                            
                            {!isCurrentEpisode && isWatched && isAvailable && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-black/70 rounded"></div>
                            )}
                          </div>
                          
                          <div className="flex-grow min-w-0">
                            <div className={`text-sm font-medium truncate ${
                              !isAvailable 
                                ? 'text-gray-500'
                                : isCurrentEpisode 
                                  ? 'text-blue-300' 
                                  : 'text-white'
                            }`}>
                              {ep.title}
                            </div>
                            <div className={`text-xs ${!isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                              T{ep.seasonNumber} • EP {ep.episodeNumber}
                              {!isAvailable && (
                                <span className="ml-1 text-red-500">• Indisponível</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}