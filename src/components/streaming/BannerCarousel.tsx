'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

interface BannerCarouselProps {
  title: string
  animes: Anime[]
}

export function BannerCarousel({ title, animes }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % animes.length)
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + animes.length) % animes.length)
  }

  if (animes.length === 0) return null

  const currentAnime = animes[currentIndex]
  const showNavigation = animes.length > 1

  return (
    <section className="mb-16 relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-white tracking-tight">{title}</h2>
        {showNavigation && (
          <div className="flex gap-3">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${currentAnime.banner || currentAnime.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent" />
        
        <div className="relative flex items-center min-h-[320px] p-8">
          {/* Poster à esquerda */}
          <div className="flex-shrink-0 mr-8">
            <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 relative group">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentAnime.thumbnail})` }}
              />
              {/* Rating Badge */}
              <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {currentAnime.rating}+
              </div>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-orange-600 rounded-full p-4 transform hover:scale-110 transition-transform">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 max-w-2xl">
            <h3 className="text-4xl font-bold text-white mb-4 leading-tight">
              {currentAnime.title}
            </h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                {currentAnime.isSubbed && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    LEG
                  </span>
                )}
                {currentAnime.isDubbed && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    DUB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="text-lg font-semibold">{currentAnime.year}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-lg">
                  {currentAnime.episodes > 1 ? `${currentAnime.episodes} episódios` : 'Filme'}
                </span>
              </div>
            </div>

            <p className="text-xl text-gray-200 mb-8 leading-relaxed line-clamp-3">
              {currentAnime.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {currentAnime.genres?.slice(0, 4).map((genre, index) => (
                <span 
                  key={index} 
                  className="bg-gray-700/80 text-gray-200 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4">
              <button 
                onClick={() => router.push(`/anime/${currentAnime.id}`)}
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayIcon className="w-6 h-6" />
                Assistir Agora
              </button>
              <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-gray-600 hover:border-gray-500">
                <PlusIcon className="w-6 h-6" />
                Minha Lista
              </button>
            </div>
          </div>

          {/* Indicadores de posição */}
          {showNavigation && (
            <div className="absolute bottom-6 right-8 flex gap-2">
              {animes.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-orange-600 scale-125' 
                      : 'bg-gray-500 hover:bg-gray-400'
                  }`}
                />
              ))}
              {animes.length > 5 && (
                <span className="text-gray-400 text-sm ml-2">
                  {currentIndex + 1}/{animes.length}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}