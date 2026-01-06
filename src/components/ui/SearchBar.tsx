'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'header'
}

export function SearchBar({ className = '', variant = 'default' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true)
        try {
          const response = await api.getAnimes({ search: query.trim(), limit: 6 })
          setResults(response.animes || [])
          setIsOpen(true)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
      setSelectedIndex(-1)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && selectedIndex >= 0) {
        handleSelectResult(results[selectedIndex])
      } else {
        handleSearch()
      }
      return
    }

    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleSelectResult = (anime: Anime) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    // Navegar para a página do anime
    router.push(`/anime/${anime.id}`)
  }

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false)
      setSelectedIndex(-1)
      // Navegar para página de busca com o termo
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ?
        <span key={i} className="bg-blue-600 text-white px-1 rounded">{part}</span> : part
    )
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className={`${variant === 'header' ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar animes, filmes, séries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          className={`w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${variant === 'header'
            ? 'bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm backdrop-blur-sm'
            : 'bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-xl pl-10 pr-20 py-2.5'
            }`}
        />
        {variant !== 'header' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {query && (
              <>
                <button
                  onClick={handleSearch}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors mr-1"
                  title="Buscar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setQuery('')
                    setIsOpen(false)
                    setSelectedIndex(-1)
                  }}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Limpar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={`absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden ${variant === 'header' ? 'max-w-md' : ''}`}>
          <div className="p-3 border-b border-gray-800/50">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Sugestões ({results.length})
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {results.map((anime, index) => (
              <button
                key={anime.id}
                onClick={() => handleSelectResult(anime)}
                className={`w-full flex items-center p-3 hover:bg-white/5 transition-all text-left border-b border-gray-800/30 last:border-b-0 ${index === selectedIndex ? 'bg-white/10' : ''
                  }`}
              >
                <div
                  className="w-10 h-14 bg-gray-800 rounded flex-shrink-0 bg-cover bg-center shadow-lg"
                  style={{ backgroundImage: `url(${anime.thumbnail || anime.posterUrl || '/images/anime-placeholder.svg'})` }}
                />
                <div className="ml-3 flex-grow min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {highlightText(anime.title, query)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span>{anime.year}</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>{(anime.totalEpisodes || 1) > 1 ? `${anime.totalEpisodes} eps` : 'Filme'}</span>
                    {anime.isDubbed && (
                      <span className="bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded border border-blue-500/20">DUB</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {anime.genres?.slice(0, 2).map((g, i) => (
                      <span key={i} className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 bg-white/[0.02] border-t border-gray-800">
            <button
              onClick={handleSearch}
              className="w-full text-center text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors py-1"
            >
              Ver todos os resultados para &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}

      {isOpen && query.length > 1 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-gray-950/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm font-medium">
              Nenhum resultado para &quot;{query}&quot;
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tente buscar por outro título
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
