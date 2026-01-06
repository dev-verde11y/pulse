'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
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
    const { loading } = useAuth()
    const [selectedSeason, setSelectedSeason] = useState(1)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState<EpisodeFilters>({
        status: 'all',
        availability: 'all'
    })

    // Since anime data is passed as a prop, we don't need the loading state for data fetching
    // However, we still might want to show loading while checking auth
    if (loading) {
        return <LoadingScreen message="Carregando..." />
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            {/* Anime Detail Banner */}
            <AnimeDetailBanner anime={anime} />

            {/* Main Content */}
            <main className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Season Selector */}
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

                    {/* Episode List */}
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
