'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/types/anime'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { SmallAnimeCard } from './AnimeCards'

interface CardCarouselProps {
  title: string
  animes: Anime[]
}

export function CardCarousel({ title, animes }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(8)
  const [itemsToScroll, setItemsToScroll] = useState(5)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth

      if (width < 640) {
        setItemsToShow(2.2) // Show partial next card for affordance
        setItemsToScroll(2)
        setIsMobile(true)
      } else if (width < 768) {
        setItemsToShow(3.2)
        setItemsToScroll(3)
        setIsMobile(true)
      } else if (width < 1024) {
        setItemsToShow(6)
        setItemsToScroll(5)
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

  return (
    <section className="mb-10 relative carousel-section group">
      <div className="flex items-center justify-between mb-4 md:mb-6 pl-4 md:pl-0">
        <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
        {showNavigation && (
          <div className="flex gap-2 carousel-nav-custom pr-4 md:pr-0">
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
        className={`overflow-x-auto ${isMobile ? 'snap-x snap-mandatory scrollbar-hide' : 'hidden-scrollbar'} py-4 -my-2`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className={`flex ${isMobile ? 'gap-4 px-4' : ''} ${!isMobile && showNavigation ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: !isMobile && showNavigation ? `translateX(-${currentIndex * (100 / animes.length)}%)` : 'none',
            width: !isMobile ? `${(animes.length * 100) / itemsToShow}%` : 'max-content',
          }}
        >
          {animes.map((anime) => (
            <div
              key={anime.id}
              className={`flex-shrink-0 ${isMobile ? 'snap-start' : 'px-3 sm:px-4'}`}
              style={!isMobile ? {
                width: `${100 / animes.length}%`
              } : {
                width: "40vw"
              }}
            >
              <div className={isMobile ? "sm:w-[28vw]" : "w-full"}>
                <SmallAnimeCard anime={anime} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}