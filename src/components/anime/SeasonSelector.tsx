'use client'

import { useState } from 'react'
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid'
import { Season } from '@/types/anime'

export interface EpisodeFilters {
  status: 'all' | 'not_watched' | 'in_progress' | 'completed'
  availability: 'all' | 'available' | 'unavailable'
}

interface SeasonSelectorProps {
  currentSeason: number
  seasons: Season[]
  onSeasonChange: (season: number) => void
  sortOrder: 'asc' | 'desc'
  onSortChange: (order: 'asc' | 'desc') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  filters: EpisodeFilters
  onFiltersChange: (filters: EpisodeFilters) => void
}

export function SeasonSelector({
  currentSeason,
  seasons,
  onSeasonChange,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange
}: SeasonSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const currentSeasonData = seasons.find(s => s.seasonNumber === currentSeason)
  const currentSeasonTitle = currentSeasonData?.title || `Temporada ${currentSeason}`
  const currentSeasonEpisodeCount = currentSeasonData?.episodes?.length || 0

  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-b border-white/5 pb-8">

        {/* Left side - Season selector and Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] text-white px-6 py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 border border-white/10 hover:border-blue-500/50"
            >
              <span className="uppercase font-mono">T{currentSeason}: {currentSeasonTitle}</span>
              <ChevronDownIcon className={`w-4 h-4 text-blue-500 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 bg-gray-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl z-[100] min-w-[320px] border border-white/10 overflow-hidden animate-fade-in shadow-blue-500/5">
                <div className="p-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-4 py-2 opacity-50">Escolha a Temporada</p>
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        onSeasonChange(season.seasonNumber)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-4 hover:bg-white/5 rounded-xl transition-all group/item ${currentSeason === season.seasonNumber ? 'bg-blue-600/10' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`font-black text-sm tracking-tight font-mono ${currentSeason === season.seasonNumber ? 'text-blue-400' : 'text-white group-hover/item:text-blue-400'}`}>
                          TEMPORADA {season.seasonNumber}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md uppercase font-mono">
                          {season.episodes?.length || 0} EP
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Catálogo de Episódios</span>
            <div className="text-2xl font-black text-white tracking-tighter uppercase">
              {currentSeasonEpisodeCount} {currentSeasonEpisodeCount === 1 ? 'EPISÓDIO' : 'EPISÓDIOS'}
            </div>
          </div>
        </div>

        {/* Right side - Filters and view options */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">

          {/* Sort Order */}
          <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5 font-mono">
            <button
              onClick={() => onSortChange('asc')}
              className={`px-6 py-2.5 text-[10px] font-black tracking-widest transition-all rounded-xl ${sortOrder === 'asc'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-500 hover:text-white'
                }`}
            >
              ANTIGOS
            </button>
            <button
              onClick={() => onSortChange('desc')}
              className={`px-6 py-2.5 text-[10px] font-black tracking-widest transition-all rounded-xl ${sortOrder === 'desc'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-500 hover:text-white'
                }`}
            >
              RECENTES
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex bg-white/[0.03] p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2.5 transition-all rounded-xl ${viewMode === 'list'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2.5 transition-all rounded-xl ${viewMode === 'grid'
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all duration-300 border ${isFiltersOpen || (filters.status !== 'all' || filters.availability !== 'all')
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                }`}
            >
              <FunnelIcon className="w-3.5 h-3.5" />
              <span className="font-mono">FILTRAR</span>
            </button>

            {/* Filters Dropdown */}
            {isFiltersOpen && (
              <div className="absolute top-full right-0 mt-3 bg-gray-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl z-[100] min-w-[300px] border border-white/10 p-6 animate-fade-in">
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 font-mono">Refinar Busca</h4>

                <div className="space-y-6">
                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block opacity-50">Status de Visualização</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'not_watched', label: 'Não Assist.' },
                        { id: 'in_progress', label: 'Em Progresso' },
                        { id: 'completed', label: 'Concluídos' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => onFiltersChange({ ...filters, status: opt.id as any })}
                          className={`text-[10px] font-bold px-3 py-2.5 rounded-xl transition-all border font-mono ${filters.status === opt.id
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-white/5 border-transparent text-gray-500 hover:border-white/10'
                            }`}
                        >
                          {opt.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block opacity-50">Disponibilidade</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'available', label: 'Disponíveis' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => onFiltersChange({ ...filters, availability: opt.id as any })}
                          className={`text-[10px] font-bold px-3 py-2.5 rounded-xl transition-all border font-mono ${filters.availability === opt.id
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-white/5 border-transparent text-gray-500 hover:border-white/10'
                            }`}
                        >
                          {opt.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onFiltersChange({ status: 'all', availability: 'all' })
                      setIsFiltersOpen(false)
                    }}
                    className="w-full py-4 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-red-500/20 font-mono"
                  >
                    Resetar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
