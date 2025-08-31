'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnimeDetailBanner } from '@/components/anime/AnimeDetailBanner'
import { EpisodeList } from '@/components/anime/EpisodeList'
import { SeasonSelector } from '@/components/anime/SeasonSelector'
import { mockAnimes } from '@/data/mockData'
import { useState } from 'react'

export default function AnimeDetailPage() {
  const params = useParams()
  const { user, loading } = useAuth()
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  const animeId = parseInt(params.id as string)
  const anime = mockAnimes.find(a => a.id === animeId)

  if (loading) {
    return <LoadingScreen message="Carregando detalhes do anime..." />
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Anime não encontrado</h1>
          <p className="text-gray-400">O anime que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

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
            totalSeasons={anime.seasons || 3}
            onSeasonChange={setSelectedSeason}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {/* Lista de Episódios */}
          <EpisodeList 
            anime={anime}
            season={selectedSeason}
            sortOrder={sortOrder}
            viewMode={viewMode}
          />
          
        </div>
      </main>
      
      <Footer />
    </div>
  )
}