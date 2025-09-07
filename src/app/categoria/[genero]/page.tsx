'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import { 
  TagIcon,
  StarIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

export default function CategoriaPage() {
  const params = useParams()
  const genero = params.genero as string
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating' | 'createdAt'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Decodificar o gênero da URL
  const generoDecoded = decodeURIComponent(genero || '')
  const generoFormatted = generoDecoded.charAt(0).toUpperCase() + generoDecoded.slice(1).toLowerCase()

  useEffect(() => {
    const loadAnimes = async () => {
      if (!generoDecoded) return
      
      try {
        setLoading(true)
        // Buscar animes por gênero
        const response = await api.getAnimes({
          genre: generoDecoded,
          sortBy: sortBy,
          sortOrder: sortOrder,
          limit: 50
        })
        setAnimes(response.animes || [])
      } catch (error) {
        console.error('Erro ao carregar animes da categoria:', error)
        setError('Erro ao carregar animes da categoria')
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    loadAnimes()
  }, [generoDecoded, sortBy, sortOrder])

  const handleSortChange = (newSortBy: 'title' | 'year' | 'rating' | 'createdAt', newSortOrder: 'asc' | 'desc' = 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  // Mapear gêneros para ícones
  const getGenreIcon = (genre: string) => {
    const genreLower = genre.toLowerCase()
    if (['acao', 'action'].includes(genreLower)) return '⚔️'
    if (['drama'].includes(genreLower)) return '🎭'
    if (['comedia', 'comedy'].includes(genreLower)) return '😄'
    if (['terror', 'horror'].includes(genreLower)) return '👻'
    if (['romance'].includes(genreLower)) return '💕'
    if (['aventura', 'adventure'].includes(genreLower)) return '🗺️'
    if (['fantasia', 'fantasy'].includes(genreLower)) return '🧙‍♂️'
    if (['ficcao cientifica', 'sci-fi'].includes(genreLower)) return '🚀'
    if (['shounen'].includes(genreLower)) return '👦'
    if (['shoujo'].includes(genreLower)) return '👧'
    if (['seinen'].includes(genreLower)) return '🧔'
    if (['josei'].includes(genreLower)) return '👩'
    return '🎬'
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header da categoria */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <TagIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{getGenreIcon(generoDecoded)}</span>
                {generoFormatted}
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Animes da categoria {generoFormatted}
            </p>
          </div>

          {/* Filtros de ordenação */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Ordenar por:</span>
            </div>
            
            <button 
              onClick={() => handleSortChange('rating')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'rating' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <StarIcon className="h-4 w-4 inline mr-1" />
              Melhor Avaliados
            </button>
            
            <button 
              onClick={() => handleSortChange('year')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Mais Recentes
            </button>
            
            <button 
              onClick={() => handleSortChange('title', 'asc')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                sortBy === 'title' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              A-Z
            </button>
          </div>

          {/* Conteúdo */}
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <TagIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{error}</p>
              </div>
            </div>
          ) : animes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{getGenreIcon(generoDecoded)}</div>
              <TagIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum anime encontrado</h3>
              <p className="text-gray-400">
                Nao foram encontrados animes na categoria {generoFormatted}.
              </p>
            </div>
          ) : (
            <>
              {/* Grid de animes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {animes.map(anime => (
                  <div key={anime.id} className="relative group">
                    <MediumAnimeCard anime={anime} />
                    
                    {/* Rating badge */}
                    {anime.rating && !isNaN(Number(anime.rating)) && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1">
                        <StarIcon className="h-3 w-3" />
                        {Number(anime.rating).toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    <span>{animes.length} animes encontrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getGenreIcon(generoDecoded)}</span>
                    <span>Categoria: {generoFormatted}</span>
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