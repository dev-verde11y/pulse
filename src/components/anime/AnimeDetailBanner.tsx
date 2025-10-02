'use client'

import { Anime, Episode } from '@/types/anime'
import { PlayIcon, PlusIcon} from '@heroicons/react/24/solid'
import { StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

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
  
  const backgroundStyle = {
    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${anime.bannerUrl || anime.banner || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

  // Carregar histórico de visualização quando o componente montar
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user || !anime.id) return
      
      setLoading(true)
      try {
        const allHistory = await api.getWatchHistory(1, 50)
        console.log('All History Debug:', {
          totalRecords: allHistory.history?.length,
          currentAnimeId: anime.id,
          allRecords: allHistory.history?.map((h: { id: string; animeId: string; episodeId: string; progress: number; completed: boolean }) => ({
            id: h.id,
            animeId: h.animeId,
            episodeId: h.episodeId,
            progress: h.progress,
            completed: h.completed
          }))
        })
        
        const animeHistory = allHistory.history?.filter((h: { animeId: string }) => h.animeId === anime.id) || []
        console.log('Filtered History:', animeHistory)
        
        if (animeHistory.length === 0) {
          console.log('No history found for anime:', anime.id)
          setWatchHistory(null)
          return
        }
        
        setWatchHistory({
          watchHistory: animeHistory,
          anime: anime,
          lastWatched: animeHistory[0]
        })
      } catch (error) {
        // Usuário nunca assistiu - history fica null
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

  // Função para alternar favoritos
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
      } else {
        await api.addToFavorites(anime.id)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Encontrar primeiro episódio de uma temporada
  const getFirstEpisodeOfSeason = (seasonNumber: number) => {
    const season = anime.seasons?.find(s => s.seasonNumber === seasonNumber)
    if (season?.episodes && season.episodes.length > 0) {
      const sortedEpisodes = [...season.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber)
      return sortedEpisodes[0]
    }
    return null
  }

  // Determinar estado do botão e próximo episódio
  const getButtonState = () => {
    if (!user) {
      return {
        text: 'FAZER LOGIN PARA ASSISTIR',
        action: () => router.push('/auth/login'),
        disabled: false
      }
    }

    if (!watchHistory) {
      // Nunca assistiu
      return {
        text: 'ASSISTIR',
        action: () => {
          const firstEpisode = getFirstEpisodeOfSeason(1)
          if (firstEpisode) {
            router.push(`/watch/${firstEpisode.id}`)
          }
        },
        disabled: false
      }
    }

    // Debug temporário
    console.log('Watch History Debug:', {
      watchHistory,
      lastWatched: watchHistory.lastWatched,
      progress: watchHistory.lastWatched?.progress,
      completed: watchHistory.lastWatched?.completed,
      episodeId: watchHistory.lastWatched?.episodeId,
      animeId: anime.id,
      totalEpisodes: anime.seasons?.[0]?.episodes?.length
    })

    // Usuário já assistiu algo
    const { lastWatched } = watchHistory
    
    // Organizar todos os episódios por temporada e número
    const allEpisodes: Episode[] = []
    anime.seasons?.forEach((season: { seasonNumber?: number; episodes?: Episode[] }) => {
      season.episodes?.forEach((ep: Episode) => {
        allEpisodes.push({ ...ep, seasonNumber: season.seasonNumber })
      })
    })
    allEpisodes.sort((a, b) => {
      const aSeasonNumber = a.seasonNumber || 1
      const bSeasonNumber = b.seasonNumber || 1
      
      if (aSeasonNumber !== bSeasonNumber) {
        return aSeasonNumber - bSeasonNumber
      }
      return a.episodeNumber - b.episodeNumber
    })

    // Encontrar último episódio assistido
    const lastEpisodeId = lastWatched.episodeId
    const lastEpisodeIndex = allEpisodes.findIndex(ep => ep.id === lastEpisodeId)
    
    if (lastEpisodeIndex === -1) {
      // Episódio não encontrado na estrutura atual, voltar ao início
      return {
        text: 'ASSISTIR',
        action: () => {
          const firstEpisode = getFirstEpisodeOfSeason(1)
          if (firstEpisode) {
            router.push(`/watch/${firstEpisode.id}`)
          }
        },
        disabled: false
      }
    }

    const lastEpisode = allEpisodes[lastEpisodeIndex]
    const nextEpisodeIndex = lastEpisodeIndex + 1
    
    // Verificar se o último episódio foi completado
    // Usar campo 'completed' se disponível, senão usar progress < 90%
    const isLastEpisodeComplete = lastWatched.completed || (lastWatched.progress && lastWatched.progress >= 90)
    
    if (!isLastEpisodeComplete) {
      return {
        text: `CONTINUAR T${lastEpisode.seasonNumber} E${lastEpisode.episodeNumber}`,
        action: () => router.push(`/watch/${lastEpisodeId}`),
        disabled: false
      }
    }
    
    // Se tem próximo episódio disponível
    if (nextEpisodeIndex < allEpisodes.length) {
      const nextEpisode = allEpisodes[nextEpisodeIndex]
      return {
        text: `ASSISTIR T${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}`,
        action: () => router.push(`/watch/${nextEpisode.id}`),
        disabled: false
      }
    }
    
    // Terminou todos os episódios disponíveis, assistir novamente
    return {
      text: 'ASSISTIR NOVAMENTE T1 E1',
      action: () => {
        const firstEpisode = getFirstEpisodeOfSeason(1)
        if (firstEpisode) {
          router.push(`/watch/${firstEpisode.id}`)
        }
      },
      disabled: false
    }
  }

  const buttonState = getButtonState()

  // Calcular rating dinâmico (mockado por enquanto)
  const getRating = () => {
    return anime._count?.favorites ? Math.min(5.0, 3.5 + (anime._count.favorites / 10000)) : 4.2
  }

  const getRatingCount = () => {
    return anime._count?.favorites ? (anime._count.favorites * 2.5).toLocaleString('pt-BR') : '1.2K'
  }

  // Determinar idiomas disponíveis baseado no anime (mockado)
  const getAvailableLanguages = () => {
    const baseLanguages = ['Japanese', 'Português (Brasil)']
    // Adicionar mais idiomas baseado na popularidade/ano
    if (anime.year >= 2020) {
      baseLanguages.push('English', 'Español (América Latina)')
    }
    if (anime._count?.favorites && anime._count.favorites > 100) {
      baseLanguages.push('Français', 'Deutsch')
    }
    return baseLanguages
  }

  return (
    <section 
      className="relative min-h-[70vh] flex items-center"
      style={backgroundStyle}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8 pt-10">
          
          {/* Poster */}
          {/* TODO: 💤✨ dormir!!! voltar aqui para ver esse detalhe! */}
          <div className="flex-shrink-0">
            <img
              src={anime.thumbnail || anime.banner || '/images/episode-placeholder.svg'}
              alt={anime.title}
              className="w-72 h-96 object-cover rounded-xl shadow-2xl"
            />
          </div>
          
          {/* Info Content */}
          <div className="flex-1 max-w-3xl">
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              {anime.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="bg-orange-600 text-white px-3 py-1 rounded font-bold">
                {anime.rating}+
              </span>
              <span className="text-white">Leg | Dub</span>
              <span className="text-white">•</span>
              {anime.genres?.slice(0, 5).map((g, index) => (
                <span key={index} className="text-blue-300 hover:text-blue-200 cursor-pointer">
                  {g}
                </span>
              ))}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.floor(getRating()) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-white font-medium">
                Classificação média: <span className="text-yellow-400">{getRating().toFixed(1)}</span> ({getRatingCount()})
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={buttonState.action}
                disabled={buttonState.disabled || loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  buttonState.disabled || loading
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                <PlayIcon className="w-6 h-6" />
                {loading ? 'CARREGANDO...' : buttonState.text}
              </button>
              
              <button 
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className={`flex items-center justify-center p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isFavorite 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                {favoriteLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : isFavorite ? (
                  <HeartIconSolid className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                {anime.description || `Milhares de anos após um misterioso fenômeno transformar a humanidade inteira em pedra, desperta um garoto extraordinariamente inteligente e amante da ciência chamado ${anime.title}.`}
              </p>
              
              {anime.description && anime.description.length > 200 && (
                <p className="text-gray-300 leading-relaxed">
                  {anime.description.slice(200).split('.')[0]}...
                </p>
              )}
              
              <button className="text-orange-400 hover:text-orange-300 font-bold mt-4 transition-colors">
                MAIS DETALHES
              </button>
            </div>
            
            {/* Audio and Subtitle Info */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="text-white font-bold mb-2">Áudio:</h3>
                <p className="text-gray-300">
                  {getAvailableLanguages().join(', ')}
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">Legendas:</h3>
                <p className="text-gray-300">
                  {getAvailableLanguages().join(', ')}
                </p>
              </div>
              
              {/* Informações adicionais */}
              <div>
                <h3 className="text-white font-bold mb-2">Ano de Lançamento:</h3>
                <p className="text-gray-300">{anime.year}</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">Total de Episódios:</h3>
                <p className="text-gray-300">
                  {anime.totalEpisodes || anime.seasons?.reduce((total, season) => total + (season.episodes?.length || 0), 0) || 'N/A'}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}