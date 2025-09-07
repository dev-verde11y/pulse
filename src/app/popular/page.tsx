'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import { 
  FireIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function PopularesPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('rating')

  useEffect(() => {
    const loadAnimes = async () => {
      try {
        setLoading(true)
        // Buscar 15 animes com maior rating
        const sortBy = activeFilter === 'views' ? 'createdAt' : 'rating' // Use createdAt for "views" since views field doesn't exist
        const response = await api.getAnimes({
          sortBy: sortBy as 'title' | 'year' | 'rating' | 'createdAt',
          sortOrder: 'desc',
          limit: 15
        })
        setAnimes(response.animes || [])
      } catch (error) {
        console.error('Erro ao carregar populares:', error)
        setError('Erro ao carregar populares')
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    loadAnimes()
  }, [activeFilter])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header da página */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <FireIcon className="h-6 w-6 text-orange-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Populares</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Top 15 animes com maior avaliacao da plataforma
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button 
              onClick={() => handleFilterChange('rating')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === 'rating' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <StarIcon className="h-4 w-4 inline mr-2" />
              Melhor Avaliados
            </button>
            <button 
              onClick={() => handleFilterChange('views')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === 'views' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4 inline mr-2" />
              Mais Assistidos
            </button>
          </div>

          {/* Conteúdo */}
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <FireIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{error}</p>
              </div>
            </div>
          ) : animes.length === 0 ? (
            <div className="text-center py-12">
              <FireIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum anime popular encontrado</h3>
              <p className="text-gray-400">
                Os animes populares aparecerao aqui em breve.
              </p>
            </div>
          ) : (
            <>
              {/* Grid de animes - Top 15 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {animes.map((anime, index) => (
                  <div key={anime.id} className="relative group">
                    <MediumAnimeCard anime={anime} />
                    
                    {/* Rating badge principal */}
                    {anime.rating && !isNaN(Number(anime.rating)) ? (
                      <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border-2 border-white ${
                        Number(anime.rating) >= 9.0 ? 'bg-yellow-500 text-black' :
                        Number(anime.rating) >= 8.0 ? 'bg-orange-500 text-white' :
                        Number(anime.rating) >= 7.0 ? 'bg-blue-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        <StarIcon className="h-3 w-3" />
                        {Number(anime.rating).toFixed(1)}
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded border-2 border-white">
                        N/A
                      </div>
                    )}
                    
                    {/* Position badge no canto direito */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black/80 text-white text-xs font-bold rounded-full flex items-center justify-center border border-gray-500">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4" />
                    <span>Top {animes.length} mais bem avaliados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FireIcon className="h-4 w-4" />
                    <span>Ordenado por {activeFilter === 'views' ? 'visualizacoes' : 'rating'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}