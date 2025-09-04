'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { CardCarousel } from '@/components/streaming/CardCarousel'
import { PosterCarousel } from '@/components/streaming/PosterCarousel'
import { BannerCarousel } from '@/components/streaming/BannerCarousel'
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
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-10">
          
          {/* Continue Assistindo */}
          <CardCarousel 
            title="Continue Assistindo" 
            animes={continueWatchingAnimes} 
          />

          {/* Em Alta */}
          <PosterCarousel 
            title="Em Alta" 
            animes={trending} 
          />

          {/* Minha Lista */}
          <PosterCarousel 
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
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Explorar por Categoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category, index) => {
                const gradients = [
                  'bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600',
                  'bg-gradient-to-br from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600',
                  'bg-gradient-to-br from-pink-600 to-red-700 hover:from-pink-500 hover:to-red-600',
                  'bg-gradient-to-br from-red-600 to-orange-700 hover:from-red-500 hover:to-orange-600',
                  'bg-gradient-to-br from-orange-600 to-yellow-700 hover:from-orange-500 hover:to-yellow-600',
                  'bg-gradient-to-br from-green-600 to-blue-700 hover:from-green-500 hover:to-blue-600',
                  'bg-gradient-to-br from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600',
                  'bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600'
                ]
                const gradientClass = gradients[index % gradients.length]
                
                return (
                  <button
                    key={category.name}
                    className={`${gradientClass} rounded-lg p-4 text-center cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-xl`}
                  >
                    <div className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-100 group-hover:text-white transition-colors opacity-90">
                      {category.count} títulos
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}