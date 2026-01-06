'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { MediumAnimeCard } from './AnimeCards'

interface PosterCarouselProps {
  title: string
  animes: Anime[]
  isTop10?: boolean
}

export function PosterCarousel({ title, animes, isTop10 = false }: PosterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(7)
  const [itemsToScroll, setItemsToScroll] = useState(4)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth

      if (width < 640) {
        setItemsToShow(isTop10 ? 1.8 : 2.5)
        setItemsToScroll(1)
        setIsMobile(true)
      } else if (width < 768) {
        setItemsToShow(isTop10 ? 2.5 : 3.5)
        setItemsToScroll(2)
        setIsMobile(true)
      } else if (width < 1024) {
        setItemsToShow(isTop10 ? 3.5 : 5)
        setItemsToScroll(3)
        setIsMobile(false)
      } else {
        // No Desktop Top 10: Mostramos 4.2 itens para eles ficarem BEM GRANDES
        setItemsToShow(isTop10 ? 4.2 : 7)
        setItemsToScroll(isTop10 ? 2 : 4)
        setIsMobile(false)
      }
    }

    updateItemsConfig()
    window.addEventListener('resize', updateItemsConfig)
    return () => window.removeEventListener('resize', updateItemsConfig)
  }, [])

  const nextSlide = () => {
    const maxIndex = Math.max(0, animes.length - itemsToShow)
    const newIndex = Math.min(currentIndex + itemsToScroll, maxIndex)
    setCurrentIndex(newIndex)

    if (isMobile && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - itemsToScroll, 0)
    setCurrentIndex(newIndex)

    if (isMobile && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  if (animes.length === 0) return null

  const showNavigation = animes.length > itemsToShow

  // Cálculo preciso do deslocamento
  const getTransform = () => {
    if (isMobile || !showNavigation) return 'none'
    const step = 100 / animes.length
    return `translateX(-${currentIndex * step}%)`
  }

  return (
    <section className="mb-12 relative carousel-section group">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
        {showNavigation && (
          <div className="flex gap-2 carousel-nav-custom relative z-30">
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
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className={`relative ${isMobile ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide' : 'overflow-hidden'} py-12`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className={`flex ${isMobile ? 'gap-4 px-4' : ''} ${!isMobile && showNavigation ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: getTransform(),
            width: !isMobile ? `${(animes.length * 100) / itemsToShow}%` : 'max-content',
          }}
        >
          {animes.map((anime, idx) => (
            <div
              key={anime.id}
              className={`flex-shrink-0 relative ${isMobile ? 'snap-start' : (isTop10 ? 'px-4 sm:px-6' : 'px-1.5')}`}
              style={!isMobile ? {
                width: `${100 / animes.length}%`
              } : {
                width: isTop10 ? "55vw" : "35vw"
              }}
            >
              {isTop10 && (
                <div className="absolute left-1 sm:left-2 inset-y-0 flex items-center z-30 pointer-events-none select-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-[2px] h-10 mb-2 rounded-full animate-pulse blur-[1px] ${idx === 0 ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' :
                      idx < 3 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' :
                        'bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      }`} />

                    <div className="relative flex items-center justify-center">
                      <span
                        className={`text-4xl sm:text-5xl font-black italic tracking-tighter ${idx === 0 ? 'text-amber-400' :
                          idx < 3 ? 'text-cyan-300' :
                            'text-white'
                          }`}
                        style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                      >
                        {idx + 1}
                      </span>
                      {/* Restore HUD brackets */}
                      {idx < 3 && (
                        <div className={`absolute -inset-2 border-l-2 border-t-2 rounded-tl-lg rounded-br-lg border-r-2 border-b-2 opacity-40 ${idx === 0 ? 'border-amber-400' : 'border-cyan-400'
                          }`} />
                      )}
                    </div>

                    <div className={`w-[2px] h-10 mt-2 rounded-full animate-pulse blur-[1px] ${idx === 0 ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' :
                      idx < 3 ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' :
                        'bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                      }`} />

                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      Rank
                    </span>
                  </div>
                </div>
              )}
              <div className={`${isTop10 ? 'pl-10 sm:pl-12' : ''} ${isMobile ? (isTop10 ? "w-[40vw]" : "sm:w-[25vw]") : "w-full"} relative z-20 hover:z-50 group-hover:scale-105 transition-all duration-300`}>
                <MediumAnimeCard anime={anime} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}