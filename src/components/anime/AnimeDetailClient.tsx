'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnimeDetailBanner } from '@/components/anime/AnimeDetailBanner'
import { EpisodeList } from '@/components/anime/EpisodeList'
import { SeasonSelector, EpisodeFilters } from '@/components/anime/SeasonSelector'
import { Anime } from '@/types/anime'

interface AnimeDetailClientProps {
    anime: Anime
}

export default function AnimeDetailClient({ anime }: AnimeDetailClientProps) {
    const [selectedSeason, setSelectedSeason] = useState(1)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState<EpisodeFilters>({
        status: 'all',
        availability: 'all'
    })

    return (
        <div className="min-h-screen bg-black">
            <Header />

            {/* Banner de Detalhes do Anime */}
            <AnimeDetailBanner anime={anime} />

            {/* Conteúdo Principal */}
            <main className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Seletor de Temporada */}
                    <SeasonSelector
                        currentSeason={selectedSeason}
                        seasons={anime.seasons || []}
                        onSeasonChange={setSelectedSeason}
                        sortOrder={sortOrder}
                        onSortChange={setSortOrder}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />

                    {/* Lista de Episódios */}
                    <EpisodeList
                        anime={anime}
                        season={selectedSeason}
                        sortOrder={sortOrder}
                        viewMode={viewMode}
                        filters={filters}
                    />

                </div>
            </main>

            <Footer />
        </div>
    )
}
