'use client'

import { useState, useRef, useEffect } from 'react'
import { Anime } from '@/data/mockData'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { SmallAnimeCard, MediumAnimeCard, ContinueWatchingCard } from './AnimeCards'

interface AnimeCarouselProps {
  title: string
  animes: Anime[]
  variant?: 'small' | 'medium' | 'continue'
}

function getInitialItemsToShow(variant: string) {
  switch (variant) {
    case 'small':
      return 8
    case 'medium':
      return 7
    case 'continue':
      return 6
    default:
      return 7
  }
}

function getInitialItemsToScroll(variant: string) {
  switch (variant) {
    case 'small':
      return 5
    case 'medium':
      return 4
    case 'continue':
      return 4
    default:
      return 4
  }
}

function getPaddingBonus(variant: string) {
  switch (variant) {
    case 'small':
      return 35
    case 'medium':
      return 40
    case 'continue':
      return 40
    default:
      return 40
  }
}

function getPaddingRight(variant: string, itemsToShow: number) {
  switch (variant) {
    case 'small':
      return (200 / itemsToShow)
    case 'medium':
      return (350 / itemsToShow)
    case 'continue':
      return (400 / itemsToShow)
    default:
      return (400 / itemsToShow)
  }
}

function getCardWidthClass(variant: string) {
  switch (variant) {
    case 'small':
      return 'w-1/3 sm:w-1/4 md:w-1/6 lg:w-1/8'
    case 'medium':
      return 'w-1/2 sm:w-1/3 md:w-1/5 lg:w-1/7'
    case 'continue':
      return 'w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6'
    default:
      return 'w-1/2 sm:w-1/3 md:w-1/5 lg:w-1/7'
  }
}

function renderCard(anime: Anime, variant: string) {
  switch (variant) {
    case 'small':
      return <SmallAnimeCard anime={anime} />
    case 'medium':
      return <MediumAnimeCard anime={anime} />
    case 'continue':
      return <ContinueWatchingCard anime={anime} />
    default:
      return <MediumAnimeCard anime={anime} />
  }
}

export function AnimeCarousel({ title, animes, variant = 'medium' }: AnimeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(getInitialItemsToShow(variant))
  const [itemsToScroll, setItemsToScroll] = useState(getInitialItemsToScroll(variant))
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateItemsConfig = () => {
      const width = window.innerWidth
      
      switch (variant) {
        case 'small':
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
          break
        case 'medium':
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
          break
        case 'continue':
          if (width < 640) {
            setItemsToShow(2)
            setItemsToScroll(2)
          } else if (width < 768) {
            setItemsToShow(3)
            setItemsToScroll(3)
          } else if (width < 1024) {
            setItemsToShow(4)
            setItemsToScroll(4)
          } else {
            setItemsToShow(6)
            setItemsToScroll(4)
          }
          break
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
          className={`flex transition-transform duration-300 ease-in-out ${variant === 'small' ? 'gap-2' : 'gap-4'}`}
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            width: `${(animes.length * 100) / itemsToShow + getPaddingBonus(variant)}%`,
            paddingRight: `${getPaddingRight(variant, itemsToShow)}%`
          }}
        >
          {animes.map((anime) => (
            <div 
              key={anime.id} 
              className={`flex-shrink-0 ${getCardWidthClass(variant)}`}
            >
              {renderCard(anime, variant)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}