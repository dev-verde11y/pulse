'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { SmallCarousel } from '@/components/streaming/SmallCarousel'
import { MediumCarousel } from '@/components/streaming/MediumCarousel'
import { ModernLargeCarousel } from '@/components/streaming/ModernLargeCarousel'
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
          <MediumCarousel 
            title="Continue Assistindo" 
            animes={continueWatching} 
          />

          {/* Em Alta */}
          <MediumCarousel 
            title="Em Alta" 
            animes={trending} 
          />

          {/* Minha Lista */}
          <MediumCarousel 
            title="Minha Lista" 
            animes={myList} 
          />

          {/* Recomendados para Você */}
          <MediumCarousel 
            title="Recomendados para Você" 
            animes={recommendations} 
          />

          {/* Lançamentos */}
          <ModernLargeCarousel 
            title="Novos Lançamentos" 
            animes={newReleases} 
          />

          {/* Mais Avaliados */}
          <MediumCarousel 
            title="Mais Avaliados" 
            animes={topRated} 
          />

          {/* Ação */}
          <SmallCarousel 
            title="Ação & Aventura" 
            animes={action} 
          />

          {/* Comédia */}
          <SmallCarousel 
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
      
      {/* Footer */}
      <Footer />
    </div>
  )
}