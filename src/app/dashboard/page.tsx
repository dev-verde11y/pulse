'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { CardCarousel } from '@/components/streaming/CardCarousel'
import { PosterCarousel } from '@/components/streaming/PosterCarousel'
import { SmallCardCarousel } from '@/components/streaming/SmallCardCarousel'
import { BannerCarousel } from '@/components/streaming/BannerCarousel'
import CategoryCard from '@/components/streaming/CategoryCard'
import { api } from '@/lib/api'
import { categories } from '@/data/mockData'
import { Anime, WatchHistoryItem } from '@/types/anime'
import '@/styles/swiper.css'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [favorites, setFavorites] = useState<Anime[]>([])
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [animesData, favoritesData, historyData] = await Promise.all([
          api.getAnimes({ limit: 50 }),
          user ? api.getFavorites().catch(() => []) : [],
          user ? api.getWatchHistory(1, 20).then(res => res.history).catch(() => []) : []
        ])

        setAnimes(animesData.animes || [])
        setFavorites(favoritesData || [])
        setWatchHistory(historyData || [])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    if (!loading) {
      loadData()
    }
  }, [user, loading])

  // Mostra loading screen enquanto verifica autenticação
  if (loading || dataLoading) {
    return <LoadingScreen message="Preparando seu conteúdo..." />
  }

  // Filtrar animes por categoria
  const trending = animes.filter(anime => ['16+', '18+'].includes(anime.rating)).slice(0, 10)
  const newReleases = animes.filter(anime => {
    const releaseYear = new Date(anime.createdAt).getFullYear()
    return releaseYear >= new Date().getFullYear() - 1
  }).slice(0, 10)
  const topRated = [...animes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
  const action = animes.filter(anime => anime.genres?.includes('Ação')).slice(0, 10)
  const comedy = animes.filter(anime => anime.genres?.includes('Comédia')).slice(0, 10)
  const continueWatchingAnimes = watchHistory
    .map(item => item.anime)
    .filter((anime, index, self) => 
      index === self.findIndex(a => a.id === anime.id)
    )
    .slice(0, 10)
  const myList = favorites.slice(0, 10)
  const recommendations = animes.slice(0, 10)

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Content Sections */}
      <main className="bg-black text-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-8 sm:space-y-10">
          
          {/* Continue Assistindo */}
          <SmallCardCarousel 
            title="Continue Assistindo" 
            animes={continueWatchingAnimes} 
          />

          {/* Em Alta */}
          <PosterCarousel 
            title="Em Alta" 
            animes={trending} 
          />

          {/* Minha Lista */}
          <SmallCardCarousel 
            title="Minha Lista" 
            animes={myList} 
          />

          {/* Recomendados para Você */}
          <PosterCarousel 
            title="Recomendados para Você" 
            animes={recommendations} 
          />

          {/* Lançamentos */}
          <BannerCarousel 
            title="Novos Lançamentos" 
            animes={newReleases} 
          />

          {/* Mais Avaliados */}
          <PosterCarousel 
            title="Mais Avaliados" 
            animes={topRated} 
          />

          {/* Ação */}
          <CardCarousel 
            title="Ação & Aventura" 
            animes={action} 
          />

          {/* Comédia */}
          <CardCarousel 
            title="Comédia" 
            animes={comedy} 
          />

          {/* Categorias Populares */}
          <section className="mb-20 py-16 text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Explorar por Categoria
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Descubra animes organizados por gênero<br />
                <span className="text-white font-medium">Encontre exatamente o que você procura</span>
              </p>
            </div>
            <div className="w-full px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 max-w-[1400px] mx-auto">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.name}
                    name={category.name}
                    count={category.count}
                  />
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}