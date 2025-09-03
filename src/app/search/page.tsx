'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const GENRES = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 
  'Romance', 'Ficção Científica', 'Slice of Life', 'Esporte',
  'Sobrenatural', 'Suspense', 'Thriller', 'Militar', 'Escola',
  'Música', 'Família', 'Histórico', 'Psicológico', 'Gore'
]

const RATINGS = [
  { value: 'Livre', label: 'Livre' },
  { value: '10+', label: '10+' },
  { value: '12+', label: '12+' },
  { value: '14+', label: '14+' },
  { value: '16+', label: '16+' },
  { value: '18+', label: '18+' }
]

const STATUSES = [
  { value: 'FINISHED', label: 'Finalizado' },
  { value: 'ONGOING', label: 'Em Exibição' },
  { value: 'UPCOMING', label: 'Em Breve' },
  { value: 'CANCELLED', label: 'Cancelado' }
]

const TYPES = [
  { value: 'ANIME', label: 'Anime' },
  { value: 'FILME', label: 'Filme' },
  { value: 'SERIE', label: 'Série' }
]

const SORT_OPTIONS = [
  { value: 'title', label: 'Título A-Z' },
  { value: 'title-desc', label: 'Título Z-A' },
  { value: 'year', label: 'Ano (Mais Recente)' },
  { value: 'year-asc', label: 'Ano (Mais Antigo)' },
  { value: 'rating', label: 'Classificação' }
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estados
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')

  // Função de busca
  const performSearch = useCallback(async (page = 1) => {
    console.log('performSearch called with:', { query, page, selectedGenres, selectedRating, selectedStatus, selectedType })
    
    if (!query.trim() && selectedGenres.length === 0 && !selectedRating && !selectedStatus && !selectedType) {
      console.log('No search criteria, clearing results')
      setAnimes([])
      setTotalResults(0)
      return
    }

    console.log('Starting search with query:', query)
    setLoading(true)
    try {
      const [sortField, sortOrder] = sortBy.includes('-desc') 
        ? [sortBy.replace('-desc', ''), 'desc'] 
        : sortBy.includes('-asc')
        ? [sortBy.replace('-asc', ''), 'asc']
        : [sortBy, 'asc']

      const filters = {
        search: query.trim() || undefined,
        genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined, // API só suporta 1 gênero por vez
        rating: selectedRating || undefined,
        status: selectedStatus as any || undefined,
        type: selectedType as any || undefined,
        sortBy: sortField as any,
        sortOrder: sortOrder as any,
        page,
        limit: 20
      }

      console.log('API call with filters:', filters)
      const response = await api.getAnimes(filters)
      console.log('API response:', response)
      
      // Filtrar por múltiplos gêneros no frontend se necessário
      let filteredAnimes = response.animes
      if (selectedGenres.length > 1) {
        filteredAnimes = response.animes.filter(anime => 
          selectedGenres.every(genre => anime.genres?.includes(genre))
        )
      }

      // Filtrar por ano
      if (yearFrom || yearTo) {
        filteredAnimes = filteredAnimes.filter(anime => {
          const animeYear = anime.year
          const fromYear = yearFrom ? parseInt(yearFrom) : 0
          const toYear = yearTo ? parseInt(yearTo) : 9999
          return animeYear >= fromYear && animeYear <= toYear
        })
      }

      console.log('Final filtered animes:', filteredAnimes)
      console.log('About to call setAnimes with:', filteredAnimes)
      setAnimes(filteredAnimes)
      setTotalResults(response.pagination.totalItems)
      setCurrentPage(response.pagination.currentPage)
      setTotalPages(response.pagination.totalPages)
      console.log('State updated - animes count:', filteredAnimes.length)
      console.log('After setAnimes, animes state should be:', filteredAnimes.length)
    } catch (error) {
      console.error('Search error:', error)
      setAnimes([])
      setTotalResults(0)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo])

  // Search effect to trigger search when params change
  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim() && selectedGenres.length === 0 && !selectedRating && !selectedStatus && !selectedType) {
        setAnimes([])
        setTotalResults(0)
        return
      }

      setLoading(true)
      
      try {
        const [sortField, sortOrder] = sortBy.includes('-desc') 
          ? [sortBy.replace('-desc', ''), 'desc'] 
          : sortBy.includes('-asc')
          ? [sortBy.replace('-asc', ''), 'asc']
          : [sortBy, 'asc']

        const filters = {
          search: query.trim() || undefined,
          genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined,
          rating: selectedRating || undefined,
          status: selectedStatus as any || undefined,
          type: selectedType as any || undefined,
          sortBy: sortField as any,
          sortOrder: sortOrder as any,
          page: currentPage,
          limit: 20
        }

        const response = await api.getAnimes(filters)
        
        // Filter on frontend if needed
        let filteredAnimes = response.animes
        if (selectedGenres.length > 1) {
          filteredAnimes = response.animes.filter(anime => 
            selectedGenres.every(genre => anime.genres?.includes(genre))
          )
        }

        // Filter by year
        if (yearFrom || yearTo) {
          filteredAnimes = filteredAnimes.filter(anime => {
            const animeYear = anime.year
            const fromYear = yearFrom ? parseInt(yearFrom) : 0
            const toYear = yearTo ? parseInt(yearTo) : 9999
            return animeYear >= fromYear && animeYear <= toYear
          })
        }

        setAnimes(filteredAnimes)
        setTotalResults(response.pagination.totalItems)
        setCurrentPage(response.pagination.currentPage)
        setTotalPages(response.pagination.totalPages)
      } catch (error) {
        console.error('Search error:', error)
        setAnimes([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    executeSearch()
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo, currentPage])

  // Atualizar URL com parâmetros de busca
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','))
    if (selectedRating) params.set('rating', selectedRating)
    if (selectedStatus) params.set('status', selectedStatus)
    if (selectedType) params.set('type', selectedType)
    if (sortBy !== 'title') params.set('sort', sortBy)
    if (yearFrom) params.set('yearFrom', yearFrom)
    if (yearTo) params.set('yearTo', yearTo)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo, currentPage, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    performSearch(1)
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedRating('')
    setSelectedStatus('')
    setSelectedType('')
    setSortBy('title')
    setYearFrom('')
    setYearTo('')
    setCurrentPage(1)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Buscar Animes</h1>
            <p className="text-gray-400">
              {totalResults > 0 && (
                `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
              )}
            </p>
          </div>

          {/* Barra de Busca */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, descrição ou gênero..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filtros
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Gêneros */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gêneros</label>
                  <div className="max-h-40 overflow-y-auto">
                    {GENRES.map(genre => (
                      <label key={genre} className="flex items-center py-1 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => toggleGenre(genre)}
                          className="mr-2 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {genre}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Classificação, Status, Tipo */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Classificação</label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Todas</option>
                      {RATINGS.map(rating => (
                        <option key={rating.value} value={rating.value}>{rating.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Todos</option>
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Tipo</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Todos</option>
                      {TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ano e Ordenação */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Período</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="De"
                        value={yearFrom}
                        onChange={(e) => setYearFrom(e.target.value)}
                        min="1960"
                        max="2030"
                        className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-gray-400 py-2">até</span>
                      <input
                        type="number"
                        placeholder="Até"
                        value={yearTo}
                        onChange={(e) => setYearTo(e.target.value)}
                        min="1960"
                        max="2030"
                        className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtros Ativos */}
              {(selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType || yearFrom || yearTo) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Filtros ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map(genre => (
                      <span key={genre} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {genre}
                        <button onClick={() => toggleGenre(genre)} className="hover:text-gray-300">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {selectedRating && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                        {selectedRating}
                        <button onClick={() => setSelectedRating('')} className="hover:text-gray-300">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedStatus && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        {STATUSES.find(s => s.value === selectedStatus)?.label}
                        <button onClick={() => setSelectedStatus('')} className="hover:text-gray-300">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedType && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                        {TYPES.find(t => t.value === selectedType)?.label}
                        <button onClick={() => setSelectedType('')} className="hover:text-gray-300">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(yearFrom || yearTo) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                        {yearFrom || '0'} - {yearTo || 'atual'}
                        <button onClick={() => { setYearFrom(''); setYearTo('') }} className="hover:text-gray-300">
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Resultados */}
          {!loading && animes.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {animes.map(anime => (
                  <MediumAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-4 py-2 text-gray-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

          {/* Sem Resultados */}
          {!loading && animes.length === 0 && (query || selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType) && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum resultado encontrado</h3>
              <p className="text-gray-400 mb-4">
                Tente ajustar seus filtros ou usar termos de busca diferentes.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Estado Inicial */}
          {!loading && animes.length === 0 && !query && selectedGenres.length === 0 && !selectedRating && !selectedStatus && !selectedType && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Comece sua busca</h3>
              <p className="text-gray-400">
                Digite um termo na barra de busca ou use os filtros para encontrar animes.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}