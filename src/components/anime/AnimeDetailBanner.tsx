'use client'

import { Anime } from '@/data/mockData'
import { PlayIcon, PlusIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { StarIcon } from '@heroicons/react/24/outline'

interface AnimeDetailBannerProps {
  anime: Anime
}

export function AnimeDetailBanner({ anime }: AnimeDetailBannerProps) {
  const backgroundStyle = {
    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${anime.thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

  return (
    <section 
      className="relative min-h-[70vh] flex items-center"
      style={backgroundStyle}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={anime.thumbnail}
              alt={anime.title}
              className="w-72 h-96 object-cover rounded-xl shadow-2xl"
            />
          </div>
          
          {/* Info Content */}
          <div className="flex-1 max-w-3xl">
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              {anime.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="bg-orange-600 text-white px-3 py-1 rounded font-bold">
                {anime.rating}+
              </span>
              <span className="text-white">Leg | Dub</span>
              <span className="text-white">•</span>
              {anime.genre.slice(0, 5).map((g, index) => (
                <span key={index} className="text-blue-300 hover:text-blue-200 cursor-pointer">
                  {g}
                </span>
              ))}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-white font-medium">
                Classificação média: <span className="text-yellow-400">4.8</span> (175.4K)
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105">
                <PlayIcon className="w-6 h-6" />
                ASSISTIR NOVAMENTE T1 E1
              </button>
              
              <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                <PlusIcon className="w-6 h-6" />
              </button>
              
              <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                <ShareIcon className="w-6 h-6" />
              </button>
              
              <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                <EllipsisHorizontalIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                {anime.description || `Milhares de anos após um misterioso fenômeno transformar a humanidade inteira em pedra, desperta um garoto extraordinariamente inteligente e amante da ciência chamado ${anime.title}.`}
              </p>
              
              <p className="text-gray-300 leading-relaxed">
                Diante de um mundo de pedra e do colapso generalizado da civilização, Senku decide usar sua mente para reconstruir o mundo. Ao lado de Taiju Oki, seu amigo de infância absurdamente forte, eles começam a reestabelecer a civilização do zero.
              </p>
              
              <button className="text-orange-400 hover:text-orange-300 font-bold mt-4 transition-colors">
                MAIS DETALHES
              </button>
            </div>
            
            {/* Audio and Subtitle Info */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="text-white font-bold mb-2">Áudio:</h3>
                <p className="text-gray-300">
                  Japanese, Português (Brasil), English, Deutsch, Español (América Latina), Español (España), Français, Italiano, Русский, العربية
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">Legendas:</h3>
                <p className="text-gray-300">
                  Português (Brasil), English, Deutsch, Español (América Latina), Español (España), Français, Italiano, Русский, العربية
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}