'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { AnimeCarousel } from '@/components/streaming/AnimeCarousel'
import { 
  continueWatching, 
  myList, 
  recommendations, 
  trending, 
  newReleases,
  topRated,
  action,
  comedy,
  categories 
} from '@/data/mockData'
import '@/styles/swiper.css'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  // Mostra loading screen enquanto verifica autenticação
  if (loading) {
    return <LoadingScreen message="Preparando seu conteúdo..." />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Content Sections */}
      <main className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          
          {/* Continue Assistindo */}
          <AnimeCarousel 
            title="Continue Assistindo" 
            animes={continueWatching} 
            variant="continue"
          />

          {/* Em Alta */}
          <AnimeCarousel 
            title="Em Alta" 
            animes={trending} 
            variant="default"
          />

          {/* Minha Lista */}
          <AnimeCarousel 
            title="Minha Lista" 
            animes={myList} 
            variant="default"
          />

          {/* Recomendados para Você */}
          <AnimeCarousel 
            title="Recomendados para Você" 
            animes={recommendations} 
            variant="large"
          />

          {/* Lançamentos */}
          <AnimeCarousel 
            title="Novos Lançamentos" 
            animes={newReleases} 
            variant="default"
          />

          {/* Mais Avaliados */}
          <AnimeCarousel 
            title="Mais Avaliados" 
            animes={topRated} 
            variant="default"
          />

          {/* Ação */}
          <AnimeCarousel 
            title="Ação & Aventura" 
            animes={action} 
            variant="default"
          />

          {/* Comédia */}
          <AnimeCarousel 
            title="Comédia" 
            animes={comedy} 
            variant="default"
          />

          {/* Categorias Populares */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Explorar por Categoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="bg-gray-900 hover:bg-blue-600 rounded-lg p-4 text-center category-hover cursor-pointer transform hover:scale-105 transition-all duration-300 group"
                >
                  <div className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-blue-100 transition-colors">
                    {category.count} títulos
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}