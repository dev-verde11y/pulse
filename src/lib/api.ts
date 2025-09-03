import { Anime } from '@/types/anime'

interface AnimeFilters {
  page?: number
  limit?: number
  genre?: string
  year?: number
  status?: 'ongoing' | 'completed' | 'upcoming'
  type?: 'tv' | 'movie' | 'ova' | 'special'
  search?: string
  sortBy?: 'title' | 'releaseDate' | 'rating' | 'views'
  sortOrder?: 'asc' | 'desc'
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

interface AnimeResponse {
  animes: Anime[]
  pagination: PaginationInfo
}

export const api = {
  async getAnimes(filters: AnimeFilters = {}): Promise<AnimeResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await fetch(`/api/animes?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch animes')
    }
    
    return response.json()
  },

  async getAnime(id: string) {
    const response = await fetch(`/api/animes/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch anime')
    }
    
    return response.json()
  },

  async getSeason(id: string) {
    const response = await fetch(`/api/seasons/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch season')
    }
    
    return response.json()
  },

  async getEpisode(id: string) {
    const response = await fetch(`/api/episodes/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch episode')
    }
    
    return response.json()
  },

  async getFavorites() {
    const response = await fetch('/api/favorites')
    
    if (!response.ok) {
      throw new Error('Failed to fetch favorites')
    }
    
    return response.json()
  },

  async addToFavorites(animeId: string) {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ animeId })
    })
    
    if (!response.ok) {
      throw new Error('Failed to add to favorites')
    }
    
    return response.json()
  },

  async removeFromFavorites(animeId: string) {
    const response = await fetch(`/api/favorites/${animeId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove from favorites')
    }
    
    return response.json()
  },

  async getWatchHistory(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await fetch(`/api/watch-history?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch watch history')
    }
    
    return response.json()
  },

  async updateWatchHistory(animeId: string, episodeId: string, progress?: number) {
    const response = await fetch('/api/watch-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        animeId,
        episodeId,
        watchedAt: new Date().toISOString(),
        progress
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update watch history')
    }
    
    return response.json()
  }
}