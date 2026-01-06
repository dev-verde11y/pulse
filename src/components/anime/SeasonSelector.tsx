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
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        {/* Left side - Season selector */}
        <div className="flex items-center gap-4">
          {seasons.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
              >
                <span>T{currentSeason}: {currentSeasonTitle}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-10 min-w-[250px] border border-gray-700">
                  {seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        onSeasonChange(season.seasonNumber)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentSeason === season.seasonNumber ? 'bg-blue-600 text-white' : 'text-gray-200'
                        }`}
                    >
                      <div className="font-bold">T{season.seasonNumber}: {season.title}</div>
                      <div className="text-sm text-gray-400">{season.episodes?.length || 0} episódios</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-lg font-semibold text-white">
            Episódios ({currentSeasonEpisodeCount})
          </div>
        </div>

        {/* Right side - Filters and view options */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">

          {/* Sort Order */}
          <div className="flex bg-gray-900 rounded-lg overflow-hidden flex-1 sm:flex-none">
            <button
              onClick={() => onSortChange('asc')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${sortOrder === 'asc'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
            >
              ANTIGOS
            </button>
            <button
              onClick={() => onSortChange('desc')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${sortOrder === 'desc'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
            >
              RECENTES
            </button>
          </div>

          {/* View Mode - Hidden on mobile, visible on sm+ */}
          <div className="hidden sm:flex bg-gray-900 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
            >
              LISTA
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
            >
              GRID
            </button>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${isFiltersOpen || (filters.status !== 'all' || filters.availability !== 'all')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white'
                }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">FILTROS</span>
            </button>

            {/* Filters Dropdown */}
            {isFiltersOpen && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-20 min-w-[280px] border border-gray-700">
                <div className="p-4">
                  <h4 className="text-sm font-bold text-white mb-4">Filtros de Episódios</h4>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
                      Status de Visualização
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                        className={`text-xs px-2.5 py-2 rounded transition-colors whitespace-nowrap ${filters.status === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => onFiltersChange({ ...filters, status: 'not_watched' })}
                        className={`text-xs px-2.5 py-2 rounded transition-colors whitespace-nowrap ${filters.status === 'not_watched'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Não Assistidos
                      </button>
                      <button
                        onClick={() => onFiltersChange({ ...filters, status: 'in_progress' })}
                        className={`text-xs px-2.5 py-2 rounded transition-colors whitespace-nowrap ${filters.status === 'in_progress'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Em Progresso
                      </button>
                      <button
                        onClick={() => onFiltersChange({ ...filters, status: 'completed' })}
                        className={`text-xs px-2.5 py-2 rounded transition-colors whitespace-nowrap ${filters.status === 'completed'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Completos
                      </button>
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
                      Disponibilidade
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onFiltersChange({ ...filters, availability: 'all' })}
                        className={`text-xs px-2 py-2 rounded transition-colors whitespace-nowrap ${filters.availability === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => onFiltersChange({ ...filters, availability: 'available' })}
                        className={`text-xs px-2 py-2 rounded transition-colors whitespace-nowrap ${filters.availability === 'available'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                      >
                        Disponíveis
                      </button>
                      <button
                        onClick={() => onFiltersChange({ ...filters, availability: 'unavailable' })}
                        className={`text-xs px-1 py-2 rounded transition-colors whitespace-nowrap overflow-hidden ${filters.availability === 'unavailable'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        title="Indisponíveis"
                      >
                        Indispon.
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => onFiltersChange({ status: 'all', availability: 'all' })}
                    className="w-full text-xs px-3 py-2.5 bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-all duration-200 font-medium border border-gray-600/30 hover:border-gray-500"
                  >
                    🗑️ Limpar Filtros
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

