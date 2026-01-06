'use client'

import { useState } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

interface BannerCarouselProps {
  title: string
  animes: Anime[]
}

export function BannerCarousel({ title, animes }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // const scrollContainerRef = useRef<HTMLDivElement>(null)
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
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
        {showNavigation && (
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={prevSlide}
              className="p-2 md:p-3 rounded-full bg-gray-800/80 hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 md:p-3 rounded-full bg-gray-800/80 hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
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
        {/* Gradient for Mobile (Bottom Up) and Desktop (Left Right) */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent md:bg-gradient-to-r md:from-gray-900 md:via-gray-900/80 md:to-transparent" />

        <div className="relative flex flex-col md:flex-row items-center min-h-[400px] md:min-h-[320px] p-4 md:p-8">
          {/* Poster à esquerda (Escondido no Mobile para dar espaço) */}
          <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8 hidden md:block">
            <div className="w-32 h-48 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 relative group">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentAnime.thumbnail})` }}
              />
              {/* Rating Badge */}
              <div className="absolute top-3 left-3 bg-orange-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
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
          <div className="flex-1 w-full md:max-w-2xl text-left md:text-left z-10 flex flex-col justify-end h-full mt-auto md:mt-0 pt-20 md:pt-0">
            {/* Mobile Rating Badge Component (Visible only on mobile) */}
            <div className="md:hidden mb-2">
              <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-bold inline-block">
                {currentAnime.rating}+
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 leading-tight line-clamp-2 drop-shadow-lg">
              {currentAnime.title}
            </h3>

            <div className="flex flex-wrap items-center justify-start gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                {currentAnime.isSubbed && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                    LEG
                  </span>
                )}
                {currentAnime.isDubbed && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                    DUB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-4 text-gray-300 text-sm md:text-lg">
                <span className="font-semibold">{currentAnime.year}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>
                  {currentAnime.totalEpisodes && currentAnime.totalEpisodes > 1 ? `${currentAnime.totalEpisodes} episódios` : 'Filme'}
                </span>
              </div>
            </div>

            <p className="text-sm md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-3 max-w-xl shadow-black drop-shadow-md">
              {currentAnime.description}
            </p>

            <div className="flex flex-wrap justify-start gap-2 md:gap-3 mb-6 md:mb-8 hidden sm:flex">
              {currentAnime.genres?.slice(0, 4).map((genre, index) => (
                <span
                  key={index}
                  className="bg-gray-700/80 text-gray-200 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex flex-row gap-3 md:gap-4 w-full md:w-auto">
              <button
                onClick={() => router.push(`/anime/${currentAnime.id}`)}
                className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-500 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayIcon className="w-5 h-5 md:w-6 md:h-6" />
                Assistir
              </button>
              <button className="flex-1 md:flex-none bg-gray-800/80 hover:bg-gray-700/80 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-gray-600 hover:border-gray-500">
                <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                Lista
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}