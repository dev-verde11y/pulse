'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mockAnimes, type Anime } from '@/data/mockData'

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'header'
}

export function SearchBar({ className = '', variant = 'default' }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Anime[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length > 1) {
      const filteredResults = mockAnimes.filter(anime =>
        anime.title.toLowerCase().includes(query.toLowerCase()) ||
        anime.genre?.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
        anime.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
      
      setResults(filteredResults)
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setResults([])
      setIsOpen(false)
      setSelectedIndex(-1)
    }
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
          className={`w-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            variant === 'header' 
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
      </div>

      {variant !== 'header' && isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-700">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Resultados da busca ({results.length})
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {results.map((anime, index) => (
              <button
                key={anime.id}
                onClick={() => handleSelectResult(anime)}
                className={`w-full flex items-center p-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700 last:border-b-0 ${
                  index === selectedIndex ? 'bg-gray-700' : ''
                }`}
              >
                <div
                  className="w-12 h-16 bg-gray-700 rounded-md flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${anime.thumbnail || '/images/anime-placeholder.svg'})` }}
                />
                <div className="ml-3 flex-grow min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {highlightText(anime.title, query)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {anime.year} • {(anime.episodes || 1) > 1 ? `${anime.episodes} eps` : 'Filme'}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {anime.genre?.slice(0, 3).map((g, i) => (
                      <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <div className={`w-2 h-2 rounded-full ${
                    anime.status === 'watching' ? 'bg-green-400' :
                    anime.status === 'completed' ? 'bg-blue-400' :
                    'bg-gray-400'
                  }`} />
                </div>
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-gray-700 bg-gray-750">
            <button 
              onClick={handleSearch}
              className="w-full text-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver todos os resultados para &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}

      {variant !== 'header' && isOpen && query.length > 1 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm z-50 overflow-hidden">
          <div className="p-6 text-center">
            <div className="text-gray-400 text-sm">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Tente buscar por título, gênero ou ano
            </div>
          </div>
        </div>
      )}
    </div>
  )
}