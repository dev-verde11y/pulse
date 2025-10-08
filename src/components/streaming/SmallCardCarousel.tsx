'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { PlayIcon, ClockIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface SmallCardCarouselProps {
  title: string
  animes: Anime[]
}

// Card especial para Continue Assistindo - menor e com progresso
function ContinueWatchingSmallCard({ anime }: { anime: Anime }) {
  const router = useRouter()
  const { user } = useAuth()
  const [watchHistory, setWatchHistory] = useState<{ episodeId: string; progress: number; completed?: boolean } | null>(null)
  const [, setLoading] = useState(false)

  // Carregar histórico de visualização
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user || !anime.id) return
      
      setLoading(true)
      try {
        const allHistory = await api.getWatchHistory(1, 50)
        const animeHistory = allHistory.history?.filter((h: { animeId: string }) => h.animeId === anime.id) || []
        
        if (animeHistory.length > 0) {
          setWatchHistory(animeHistory[0]) // Mais recente
        }
      } catch (error) {
        console.error('Error loading watch history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWatchHistory()
  }, [user, anime.id])

  // Encontrar episódio atual baseado no histórico
  const getCurrentEpisode = () => {
    if (!watchHistory) return null
    
    // Procurar o episódio nos seasons
    for (const season of anime.seasons || []) {
      const episode = season.episodes?.find((ep: { id: string }) => ep.id === watchHistory.episodeId)
      if (episode) {
        return {
          ...episode,
          seasonNumber: season.seasonNumber
        }
      }
    }
    return null
  }

  const currentEpisode = getCurrentEpisode()
  const progress = watchHistory?.progress || 0
  const isCompleted = watchHistory?.completed || progress >= 90

  const handleClick = () => {
    if (watchHistory?.episodeId) {
      router.push(`/watch/${watchHistory.episodeId}`)
    } else {
      router.push(`/anime/${anime.id}`)
    }
  }

  const getAnimeImage = (anime: Anime): string => {
    return anime.thumbnail || anime.posterUrl || '/images/anime-placeholder.svg'
  }

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-20 relative group"
    >
      {/* Card menor - aspect-ratio mais horizontal */}
      <div className="aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden relative mb-2">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getAnimeImage(anime)})` }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        
        {/* Play Button - Center */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-blue-600 rounded-full p-2 hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 shadow-xl">
            <PlayIcon className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Progress Bar - Bottom */}
        {watchHistory && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/60">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
        )}

        {/* Episode Info - Bottom Left */}
        <div className="absolute bottom-2 left-2 right-2">
          {currentEpisode && (
            <div className="flex items-center gap-1 text-white">
              <ClockIcon className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium">
                T{currentEpisode.seasonNumber} E{currentEpisode.episodeNumber}
              </span>
              {!isCompleted && (
                <span className="text-xs text-blue-300 ml-1">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Continue Tag - Top Left */}
        <div className="absolute top-2 left-2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
            Continuar
          </div>
        </div>

        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              ✓
            </div>
          ) : (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {Math.round(progress)}%
            </div>
          )}
        </div>
      </div>

      {/* Title - Mais compacto */}
      <div className="px-1">
        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors truncate leading-tight">
          {anime.title}
        </h3>
        
        {/* Status info */}
        {watchHistory && currentEpisode && (
          <p className="text-xs text-gray-400 truncate">
            {isCompleted ? 
              'Episódio concluído' : 
              `${Math.round((100 - progress) * (currentEpisode.duration || 24) / 100)}min restantes`
            }
          </p>
        )}
      </div>
    </div>
  )
}

export function SmallCardCarousel({ title, animes }: SmallCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(6)
  const [itemsToScroll, setItemsToScroll] = useState(4)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth
      
      // Configuração para cards menores e mais itens visíveis
      if (width < 640) {
        setItemsToShow(2)
        setItemsToScroll(2)
      } else if (width < 768) {
        setItemsToShow(3)
        setItemsToScroll(3)
      } else if (width < 1024) {
        setItemsToShow(4)
        setItemsToScroll(4)
      } else if (width < 1280) {
        setItemsToShow(5)
        setItemsToScroll(4)
      } else {
        setItemsToShow(6)
        setItemsToScroll(5)
      }
    }

    updateItemsConfig()
    window.addEventListener('resize', updateItemsConfig)
    return () => window.removeEventListener('resize', updateItemsConfig)
  }, [])

  const nextSlide = () => {
    const maxIndex = Math.max(0, animes.length - itemsToShow)
    setCurrentIndex(prev => Math.min(prev + itemsToScroll, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - itemsToScroll, 0))
  }

  if (animes.length === 0) return null

  const showNavigation = animes.length > itemsToShow

  return (
    <section className="mb-8 relative carousel-section group">
      {/* Header com título e navegação */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            {animes.length}
          </div>
        </div>
        
        {showNavigation && (
          <div className="flex gap-2 carousel-nav-custom">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeftIcon className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= animes.length - itemsToShow}
              className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRightIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Container dos cards */}
      <div 
        ref={scrollContainerRef}
        className="overflow-hidden py-2"
      >
        <div 
          className={`flex gap-4 ${showNavigation ? 'transition-transform duration-300 ease-in-out' : ''}`}
          style={showNavigation ? { 
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            width: `${(animes.length * 100) / itemsToShow + 50}%`,
            paddingRight: `${(500 / itemsToShow)}%`
          } : {}}
        >
          {animes.map((anime) => (
            <div 
              key={anime.id} 
              className={`flex-shrink-0 ${
                showNavigation 
                  ? "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6"
                  : animes.length === 1 
                    ? "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                    : animes.length === 2
                      ? "w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                      : "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6"
              }`}
            >
              <ContinueWatchingSmallCard anime={anime} />
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator - mostra quantos itens foram visualizados */}
      {showNavigation && (
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-1">
            <div className="text-xs text-gray-500">
              {Math.min(currentIndex + itemsToShow, animes.length)} de {animes.length}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}