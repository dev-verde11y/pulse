'use client'

import { useState } from 'react'
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/solid'

import { Season } from '@/types/anime'

interface SeasonSelectorProps {
  currentSeason: number
  seasons: Season[]
  onSeasonChange: (season: number) => void
  sortOrder: 'asc' | 'desc'
  onSortChange: (order: 'asc' | 'desc') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function SeasonSelector({ 
  currentSeason, 
  seasons, 
  onSeasonChange, 
  sortOrder, 
  onSortChange,
  viewMode,
  onViewModeChange 
}: SeasonSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
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
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        currentSeason === season.seasonNumber ? 'bg-blue-600 text-white' : 'text-gray-200'
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
        <div className="flex items-center gap-4">
          
          {/* Sort Order */}
          <div className="flex bg-gray-900 rounded-lg overflow-hidden">
            <button
              onClick={() => onSortChange('asc')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sortOrder === 'asc' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              MAIS ANTIGO
            </button>
            <button
              onClick={() => onSortChange('desc')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sortOrder === 'desc' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              MAIS RECENTE
            </button>
          </div>
          
          {/* View Mode */}
          <div className="flex bg-gray-900 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              LISTA
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              GRID
            </button>
          </div>
          
          {/* Filter Button */}
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-300">
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm font-medium">FILTROS</span>
          </button>
        </div>
      </div>
    </div>
  )
}

