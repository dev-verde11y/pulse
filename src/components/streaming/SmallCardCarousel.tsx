'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { LandscapeAnimeCard } from './AnimeCards'

export type CarouselItem = Anime & {
  progress?: number
  totalDuration?: number
  episodeNumber?: number
  seasonNumber?: number
}

interface SmallCardCarouselProps {
  title: string
  items: CarouselItem[]
  variant?: 'standard' | 'continue-watching'
}

export function SmallCardCarousel({ title, items, variant = 'standard' }: SmallCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(6)
  const [itemsToScroll, setItemsToScroll] = useState(4)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth

      // Configuração para cards menores e mais itens visíveis
      if (width < 640) {
        setItemsToShow(1.5) // Partial for affordance
        setItemsToScroll(1)
        setIsMobile(true)
      } else if (width < 768) {
        setItemsToShow(2.5)
        setItemsToScroll(2)
        setIsMobile(true)
      } else if (width < 1024) {
        setItemsToShow(4)
        setItemsToScroll(4)
        setIsMobile(false)
      } else if (width < 1280) {
        setItemsToShow(5)
        setItemsToScroll(4)
        setIsMobile(false)
      } else {
        setItemsToShow(6)
        setItemsToScroll(3)
        setIsMobile(false)
      }
    }

    updateItemsConfig()
    window.addEventListener('resize', updateItemsConfig)
    return () => window.removeEventListener('resize', updateItemsConfig)
  }, [])

  const nextSlide = () => {
    const maxIndex = Math.max(0, items.length - itemsToShow)
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

  if (items.length === 0) return null

  const showNavigation = items.length > itemsToShow

  return (
    <section className="mb-8 relative carousel-section group">
      {/* Header com título e navegação */}
      <div className="flex items-center justify-between mb-4 pl-4 md:pl-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold">
            {items.length}
          </div>
        </div>

        {showNavigation && (
          <div className="flex gap-2 carousel-nav-custom pr-4 md:pr-0">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-1.5 md:p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeftIcon className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= items.length - itemsToShow}
              className="p-1.5 md:p-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRightIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Container dos cards */}
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto ${isMobile ? 'snap-x snap-mandatory scrollbar-hide' : 'hidden-scrollbar'} py-4 -my-2`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className={`flex ${isMobile ? 'gap-4 px-4' : ''} ${!isMobile && showNavigation ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: !isMobile && showNavigation ? `translateX(-${currentIndex * (100 / items.length)}%)` : 'none',
            width: !isMobile ? `${(items.length * 100) / itemsToShow}%` : 'max-content',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex-shrink-0 ${isMobile ? 'snap-start' : 'px-3 sm:px-4'}`}
              style={!isMobile ? {
                width: `${100 / items.length}%`
              } : {
                width: "65vw"
              }}
            >
              <div className={isMobile ? "sm:w-[45vw]" : "w-full"}>
                <LandscapeAnimeCard
                  anime={item}
                  variant={variant}
                  progress={item.progress}
                  totalDuration={item.totalDuration}
                  episodeNumber={item.episodeNumber}
                  seasonNumber={item.seasonNumber}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}