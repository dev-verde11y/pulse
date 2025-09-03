'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnimeDetailBanner } from '@/components/anime/AnimeDetailBanner'
import { EpisodeList } from '@/components/anime/EpisodeList'
import { SeasonSelector } from '@/components/anime/SeasonSelector'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'

export default function AnimeDetailPage() {
  const params = useParams()
  const { user, loading } = useAuth()
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [anime, setAnime] = useState<Anime | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  
  const animeId = params.id as string

  useEffect(() => {
    async function loadAnime() {
      try {
        const animeData = await api.getAnime(animeId)
        setAnime(animeData)
      } catch (error) {
        console.error('Error loading anime:', error)
      } finally {
        setDataLoading(false)
      }
    }

    if (animeId) {
      loadAnime()
    }
  }, [animeId])

  if (loading || dataLoading) {
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
            seasons={anime.seasons || []}
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