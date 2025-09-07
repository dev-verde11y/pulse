import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export function useFavorites() {
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const loadFavoritesCount = async () => {
    if (!user) {
      setFavoritesCount(0)
      setLoading(false)
      return
    }

    try {
      const favorites = await api.getFavorites()
      setFavoritesCount(favorites.length)
    } catch (error) {
      console.error('Erro ao carregar contador de favoritos:', error)
      setFavoritesCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavoritesCount()
  }, [user])

  const refreshCount = () => {
    loadFavoritesCount()
  }

  return {
    favoritesCount,
    loading,
    refreshCount
  }
}