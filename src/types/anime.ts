export interface Anime {
  id: string
  title: string
  description: string
  thumbnail?: string | null
  banner?: string | null
  logo?: string | null
  year: number
  rating: string // "Livre", "10+", "12+", "14+", "16+", "18+"
  totalEpisodes?: number | null
  genres: string[]
  createdAt: Date | string
  updatedAt: Date | string
  
  // Additional fields that might be used in components
  duration?: number | null
  
  // Relations (optional, depends on query)
  seasons?: Season[]
  _count?: {
    seasons?: number
    favorites?: number
  }
}

export interface Season {
  id: string
  seasonNumber: number
  title: string
  description?: string | null
  episodes?: Episode[]
}

export interface Episode {
  id: string
  episodeNumber: number
  title: string
  description?: string | null
  duration?: number | null
  thumbnail?: string | null
  airDate?: Date | string | null
  seasonNumber?: number
  season?: {
    animeId: string
    seasonNumber: number
  }
}

export interface WatchHistoryItem {
  id: string
  animeId: string
  episodeId?: string | null
  progress: number
  watchedAt: Date | string
  completed: boolean
  anime: Anime
}

export interface FavoriteItem {
  id: string
  animeId: string
  createdAt: Date | string
  anime: Anime
}