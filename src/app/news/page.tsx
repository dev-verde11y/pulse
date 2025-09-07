'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import { 
  SparklesIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function NovidadesPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnimes = async () => {
      try {
        setLoading(true)
        // Buscar animes mais recentes
        const response = await api.getAnimes({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 24
        })
        setAnimes(response.animes || [])
      } catch (error) {
        console.error('Erro ao carregar novidades:', error)
        setError('Erro ao carregar novidades')
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    loadAnimes()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header da página */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Novidades</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Os animes mais recentes adicionados a plataforma
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm transition-colors">
              <CalendarIcon className="h-4 w-4 inline mr-2" />
              Mais Recentes
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              <ClockIcon className="h-4 w-4 inline mr-2" />
              Esta Semana
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              Episodios Novos
            </button>
          </div>

          {/* Conteúdo */}
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <SparklesIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{error}</p>
              </div>
            </div>
          ) : animes.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma novidade encontrada</h3>
              <p className="text-gray-400">
                Novos animes serao adicionados em breve.
              </p>
            </div>
          ) : (
            <>
              {/* Grid de animes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {animes.map(anime => (
                  <div key={anime.id} className="relative group">
                    <MediumAnimeCard anime={anime} />
                    
                    {/* Badge de novo */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      NOVO
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    <span>{animes.length} novidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Atualizado hoje</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}