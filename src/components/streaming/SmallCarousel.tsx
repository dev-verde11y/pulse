'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/data/mockData'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { SmallAnimeCard } from './AnimeCards'

interface SmallCarouselProps {
  title: string
  animes: Anime[]
}

export function SmallCarousel({ title, animes }: SmallCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(8)
  const [itemsToScroll, setItemsToScroll] = useState(5)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setItemsToShow(3)
        setItemsToScroll(3)
      } else if (width < 768) {
        setItemsToShow(4)
        setItemsToScroll(4)
      } else if (width < 1024) {
        setItemsToShow(6)
        setItemsToScroll(5)
      } else {
        setItemsToShow(8)
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
          className="flex transition-transform duration-300 ease-in-out gap-1"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            width: `${(animes.length * 100) / itemsToShow + 70}%`,
            paddingRight: `${(700 / itemsToShow)}%`
          }}
        >
          {animes.map((anime) => (
            <div 
              key={anime.id} 
              className="flex-shrink-0 w-1/3 sm:w-1/4 md:w-1/6 lg:w-1/8"
            >
              <SmallAnimeCard anime={anime} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}