'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import '@/styles/swiper.css'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Content Sections */}
      <main className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Continue Assistindo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Continue Assistindo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Placeholder cards - será substituído pelo carousel */}
              {[
                { id: 1, progress: 75, episode: 'EP 1', title: 'Attack on Titan' },
                { id: 2, progress: 45, episode: 'EP 2', title: 'Demon Slayer' },
                { id: 3, progress: 90, episode: 'EP 3', title: 'Your Name' },
                { id: 4, progress: 20, episode: 'EP 4', title: 'Spirited Away' },
                { id: 5, progress: 65, episode: 'EP 5', title: 'My Hero Academia' },
                { id: 6, progress: 35, episode: 'EP 6', title: 'One Piece' }
              ].map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="aspect-video bg-gray-700 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 left-2">
                      <div className="w-full bg-gray-600 rounded-full h-1 mb-2">
                        <div className="bg-red-600 h-1 rounded-full" style={{width: `${item.progress}%`}}></div>
                      </div>
                      <p className="text-xs text-gray-300">{item.episode}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">{item.title}</h3>
                    <p className="text-xs text-gray-400">24 min restantes</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Minha Lista */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Minha Lista</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map((item) => (
                <div key={item} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer group">
                  <div className="aspect-video bg-gray-700 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button className="absolute top-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">Favorito {item}</h3>
                    <p className="text-xs text-gray-400">Adicionado recentemente</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recomendados */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recomendados para Você</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((item) => (
                <div key={item} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="aspect-video bg-gray-700"></div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Série Recomendada {item}</h3>
                    <p className="text-sm text-gray-400 mb-3">Uma história épica sobre aventura e amizade que vai te emocionar...</p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">16+</span>
                      <span>2023</span>
                      <span>1 Temporada</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}