'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import { 
  HeartIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string[]>([])

  // Carregar favoritos do usuário
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const favorites = await api.getFavorites()
        setFavorites(favorites || [])
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  const handleRemoveFavorite = async (animeId: string) => {
    if (!user || removing.includes(animeId)) return

    try {
      setRemoving(prev => [...prev, animeId])
      await api.removeFromFavorites(animeId)
      setFavorites(prev => prev.filter(anime => anime.id !== animeId))
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    } finally {
      setRemoving(prev => prev.filter(id => id !== animeId))
    }
  }

  const handleClearAllFavorites = async () => {
    if (!user || favorites.length === 0) return

    const confirmed = window.confirm('Tem certeza que deseja remover todos os favoritos?')
    if (!confirmed) return

    try {
      setLoading(true)
      await api.clearAllFavorites()
      setFavorites([])
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="bg-black text-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Faça login para ver seus favoritos</h3>
              <p className="text-gray-400">
                Você precisa estar logado para acessar sua lista de favoritos.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Título */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HeartIconSolid className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-white">Meus Favoritos</h1>
            </div>
            <p className="text-gray-400 text-lg">
              {favorites.length > 0 && (
                `${favorites.length} anime${favorites.length !== 1 ? 's' : ''} na sua lista de favoritos`
              )}
            </p>
          </div>

          {/* Botão Limpar Todos */}
          {favorites.length > 0 && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleClearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 hover:border-red-500/50 transition-all duration-200 text-sm"
              >
                <TrashIcon className="h-4 w-4" />
                Limpar Todos
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Lista de Favoritos */}
          {!loading && favorites.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {favorites.map(anime => (
                <div key={anime.id} className="relative group">
                  <MediumAnimeCard anime={anime} />
                  
                  {/* Botão Remover */}
                  <button
                    onClick={() => handleRemoveFavorite(anime.id)}
                    disabled={removing.includes(anime.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600/90 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remover dos favoritos"
                  >
                    {removing.includes(anime.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                    ) : (
                      <HeartIconSolid className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Estado Vazio */}
          {!loading && favorites.length === 0 && (
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-400 mb-6">
                Adicione animes aos seus favoritos para vê-los aqui.
              </p>
              <a 
                href="/search?q=*"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-500 text-blue-500 font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Explorar Animes
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}