'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
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

function DashboardContent() {
  const { user, loading, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [favorites, setFavorites] = useState<Anime[]>([])
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)

  // Detecta se veio do checkout - mostra banner e atualiza usuário
  useEffect(() => {
    const checkoutSuccess = searchParams.get('checkout') === 'success' || searchParams.get('renewal') === 'success'
    if (!checkoutSuccess || !refreshUser) return

    setShowCheckoutSuccess(true)

    // Remove query param da URL imediatamente
    window.history.replaceState({}, '', '/dashboard')

    // Atualiza dados do usuário após 2 segundos (tempo para webhook processar)
    const refreshTimer = setTimeout(async () => {
      await refreshUser()
      console.log('✅ User data refreshed')
    }, 2000)

    // Remove banner após 5 segundos
    const bannerTimer = setTimeout(() => {
      setShowCheckoutSuccess(false)
      console.log('✅ Banner dismissed')
    }, 5000)

    return () => {
      clearTimeout(refreshTimer)
      clearTimeout(bannerTimer)
    }
  }, [searchParams, refreshUser])

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

      {/* Checkout Success Banner */}
      {showCheckoutSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/30">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <p className="font-bold">Pagamento confirmado!</p>
                <p className="text-sm text-green-100">Ativando sua assinatura...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner />

      {/* Content Sections */}
      <main className="bg-black text-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-12 sm:space-y-16">

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando dashboard..." />}>
      <DashboardContent />
    </Suspense>
  )
}