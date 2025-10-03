'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Anime {
  id: string
  title: string
  description: string
  thumbnail: string | null
  posterUrl: string | null
  bannerUrl: string | null
  year: number
  status: string
  type: string
  rating: string
  genres: string[]
  tags: string[]
  isSubbed: boolean
  isDubbed: boolean
  slug: string
}

interface AnimeResponse {
  animes: Anime[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function BrowsePage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const genres = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Terror',
    'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Esportes'
  ]

  const types = ['ANIME', 'FILME', 'SERIE']

  useEffect(() => {
    fetchAnimes()
  }, [selectedGenre, selectedType])

  const fetchAnimes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGenre) params.append('genre', selectedGenre)
      if (selectedType) params.append('type', selectedType)
      if (search) params.append('search', search)

      const response = await fetch(`/api/public/animes?${params.toString()}`)
      const data: AnimeResponse = await response.json()
      setAnimes(data.animes)
    } catch (error) {
      console.error('Error fetching animes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAnimes()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PULSE
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/plans"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Planos
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/plans"
                className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 rounded-lg transition-all"
              >
                Assinar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-pink-600/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-5xl sm:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Catálogo
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Explore nossa coleção de animes, filmes e séries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[73px] z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar animes..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>

            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os Gêneros</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os Tipos</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'ANIME' ? 'Anime' : type === 'FILME' ? 'Filme' : 'Série'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-12 w-12 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : animes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nenhum anime encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {animes.map((anime) => (
              <div
                key={anime.id}
                className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all duration-300"
              >
                {/* Poster */}
                <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                  {anime.posterUrl || anime.thumbnail ? (
                    <Image
                      src={anime.posterUrl || anime.thumbnail || ''}
                      alt={anime.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-xs text-gray-300 line-clamp-3 mb-2">
                      {anime.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {anime.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-1 bg-orange-600/80 rounded"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                    {anime.rating}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-orange-600/90 px-2 py-1 rounded text-xs font-bold">
                    {anime.type === 'ANIME' ? 'Anime' : anime.type === 'FILME' ? 'Filme' : 'Série'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{anime.year}</span>
                    <span>•</span>
                    <div className="flex gap-1">
                      {anime.isSubbed && (
                        <span className="px-1.5 py-0.5 bg-gray-700 rounded">LEG</span>
                      )}
                      {anime.isDubbed && (
                        <span className="px-1.5 py-0.5 bg-gray-700 rounded">DUB</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA to Login */}
                <Link
                  href="/login"
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-orange-600 to-pink-600 px-6 py-3 rounded-lg font-bold">
                      Assistir
                    </div>
                    <p className="text-xs text-gray-300 mt-2">Faça login para assistir</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Pulse. Todos os direitos reservados.</p>
            <p className="mt-2">
              <Link href="/login" className="text-orange-500 hover:text-orange-400">
                Faça login
              </Link>
              {' ou '}
              <Link href="/register" className="text-orange-500 hover:text-orange-400">
                cadastre-se
              </Link>
              {' '}para assistir
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
