'use client'

import { Anime } from '@/types/anime'
import { PlayIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

// Card Pequeno e compacto
export function SmallAnimeCard({ anime }: { anime: Anime }) {
  const router = useRouter()
  
  const handleClick = () => {
    router.push(`/anime/${anime.id}`)
  }
  
  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative group"
    >
      <div className="aspect-[2/3] bg-gray-800 rounded-md overflow-hidden relative mb-2">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* Play Button - Center */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-blue-600 rounded-full p-2 hover:bg-blue-500 transition-all duration-300 transform hover:scale-110 shadow-lg">
            <PlayIcon className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Rating Badge - Top Left */}
        <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
          {anime.rating}+
        </div>

        {/* Language Indicators - Bottom */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">LEG</span>
        </div>
      </div>

      {/* Title and Info - Mais compacto */}
      <div>
        <h3 className="text-xs font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors truncate leading-tight">
          {anime.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{anime.year}</span>
          <span>
            {(anime.totalEpisodes || 1) > 1 ? `${anime.totalEpisodes} eps` : 'Filme'}
          </span>
        </div>
        
        {/* Gêneros - só o primeiro */}
        <div className="mt-1">
          <span className="text-xs text-gray-500 truncate block">
            {anime.genres?.[0]}
          </span>
        </div>
      </div>
    </div>
  )
}

// Card Médio (padrão atual)
export function MediumAnimeCard({ anime }: { anime: Anime }) {
  const router = useRouter()
  
  const handleClick = () => {
    router.push(`/anime/${anime.id}`)
  }
  
  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative group"
    >
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
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">LEG</span>
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
          {(anime.totalEpisodes || 1) > 1 ? (
            <span>{anime.totalEpisodes} eps</span>
          ) : (
            <span>Filme</span>
          )}
        </div>
        
        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {anime.genres?.slice(0, 2).map((g, index) => (
            <span key={index} className="text-xs text-gray-500">
              {g}{index < anime.genres.slice(0, 2).length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Card Continue Assistindo
export function ContinueWatchingCard({ anime }: { anime: Anime }) {
  const router = useRouter()
  const progress = 45 // Mock progress - future: get from watch history
  const remainingTime = Math.round((100 - progress) / 100 * (anime.duration || 24))
  
  const handleClick = () => {
    router.push(`/anime/${anime.id}`)
  }
  
  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 relative group"
    >
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
          <p className="text-xs text-gray-300 font-medium">EP 12</p>
        </div>

        {/* Language Indicators - Top Right */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">LEG</span>
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