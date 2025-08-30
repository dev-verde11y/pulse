'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/data/mockData'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/solid'

interface AnimeCarouselProps {
  title: string
  animes: Anime[]
  variant?: 'default' | 'continue' | 'large'
}

export function AnimeCarousel({ title, animes, variant = 'default' }: AnimeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(variant === 'large' ? 4 : 7)
  const [itemsToScroll, setItemsToScroll] = useState(variant === 'large' ? 2 : 4)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth
      if (variant === 'large') {
        if (width < 640) {
          setItemsToShow(1)
          setItemsToScroll(1)
        } else if (width < 768) {
          setItemsToShow(2)
          setItemsToScroll(1)
        } else if (width < 1024) {
          setItemsToShow(3)
          setItemsToScroll(2)
        } else {
          setItemsToShow(4)
          setItemsToScroll(2)
        }
      } else {
        if (width < 640) {
          setItemsToShow(2)
          setItemsToScroll(2)
        } else if (width < 768) {
          setItemsToShow(3)
          setItemsToScroll(3)
        } else if (width < 1024) {
          setItemsToShow(5)
          setItemsToScroll(4)
        } else {
          setItemsToShow(7)
          setItemsToScroll(4)
        }
      }
    }

    // Configurar no mount
    updateItemsConfig()

    // Listener para resize
    window.addEventListener('resize', updateItemsConfig)
    return () => window.removeEventListener('resize', updateItemsConfig)
  }, [variant])

  const nextSlide = () => {
    const maxIndex = Math.max(0, animes.length - itemsToShow)
    setCurrentIndex(prev => Math.min(prev + itemsToScroll, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - itemsToScroll, 0))
  }

  const formatTime = (minutes: number) => {
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}min`
    }
    return `${minutes} min`
  }

  if (animes.length === 0) return null

  return (
    <section className="mb-8 relative carousel-section group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2 carousel-nav-custom">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= animes.length - itemsToShow}
            className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-hidden"
      >
        <div 
          className={`flex transition-transform duration-300 ease-in-out gap-4`}
          style={{ 
            transform: `translateX(-${currentIndex * (itemsToShow > 0 ? (100 / itemsToShow) : 0)}%)`,
            width: `${itemsToShow > 0 ? (animes.length / itemsToShow) * 100 : 100}%`
          }}
        >
          {animes.map((anime) => (
            <div 
              key={anime.id} 
              className={`flex-shrink-0 group cursor-pointer ${
                variant === 'large' 
                  ? 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4' 
                  : 'w-1/2 sm:w-1/3 md:w-1/5 lg:w-1/7'
              }`}
            >
              {variant === 'continue' ? (
                <ContinueWatchingCard anime={anime} />
              ) : variant === 'large' ? (
                <LargeAnimeCard anime={anime} />
              ) : (
                <DefaultAnimeCard anime={anime} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DefaultAnimeCard({ anime }: { anime: Anime }) {
  return (
    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative group">
      <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden relative mb-3">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* Play Button - Center */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-blue-600 rounded-full p-4 hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 shadow-2xl">
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          </div>
        </button>

        {/* Add to List Button - Top Right */}
        <button className="absolute top-3 right-3 bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600/80 hover:scale-110">
          <PlusIcon className="w-4 h-4 text-white" />
        </button>

        {/* Rating Badge - Top Left */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
          {anime.rating}
        </div>

        {/* Language Indicators - Bottom Right */}
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {anime.isSubbed && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">LEG</span>
          )}
          {anime.isDubbed && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">DUB</span>
          )}
        </div>
      </div>

      {/* Title and Info */}
      <div className="px-1">
        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors truncate">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>{anime.year}</span>
          <span>•</span>
          {anime.episodes > 1 ? (
            <span>{anime.episodes} eps</span>
          ) : (
            <span>Filme</span>
          )}
        </div>
        
        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {anime.genre.slice(0, 2).map((g, index) => (
            <span key={index} className="text-xs text-gray-500">
              {g}{index < anime.genre.slice(0, 2).length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContinueWatchingCard({ anime }: { anime: Anime }) {
  const progress = anime.progress || 0
  const remainingTime = Math.round((100 - progress) / 100 * anime.duration)
  
  return (
    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative group">
      <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden relative mb-3">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

        {/* Play Button - Center */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-blue-600 rounded-full p-4 hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 shadow-2xl">
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          </div>
        </button>

        {/* Episode and Progress */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="w-full bg-gray-600 rounded-full h-1.5 mb-2">
            <div 
              className="progress-bar h-1.5 rounded-full" 
              style={{width: `${progress}%`}}
            />
          </div>
          <p className="text-xs text-gray-300 font-medium">EP {anime.currentEpisode}</p>
        </div>

        {/* Language Indicators - Top Right */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {anime.isSubbed && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">LEG</span>
          )}
          {anime.isDubbed && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">DUB</span>
          )}
        </div>
      </div>

      {/* Title and Info */}
      <div className="px-1">
        <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors truncate">
          {anime.title}
        </h3>
        <p className="text-xs text-gray-400">
          {remainingTime > 0 ? `${remainingTime} min restantes` : 'Episódio concluído'}
        </p>
      </div>
    </div>
  )
}

function LargeAnimeCard({ anime }: { anime: Anime }) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 cursor-pointer group">
      <div className="aspect-video bg-gray-700 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.banner || anime.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <div className="bg-blue-600 rounded-full p-4 hover:bg-blue-500 transition-colors">
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          </div>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">{anime.title}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{anime.description}</p>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">{anime.rating}</span>
          <span>{anime.year}</span>
          {anime.episodes > 1 ? (
            <span>{anime.episodes} eps</span>
          ) : (
            <span>Filme</span>
          )}
          <div className="flex gap-1 ml-auto">
            {anime.isSubbed && <span className="text-blue-400 text-xs font-bold">LEG</span>}
            {anime.isDubbed && <span className="text-blue-400 text-xs font-bold">DUB</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.genre.slice(0, 3).map((g, index) => (
            <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}