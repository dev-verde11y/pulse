'use client'

import { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Anime, Episode } from '@/types/anime'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination' 
import 'swiper/css/effect-fade'
import 'swiper/css/autoplay'

// interface HeroContent {
//   id: string
//   title: string
//   subtitle: string
//   description: string
//   type: string
//   year: number
//   rating: string
//   duration: string
//   episode?: string
//   backgroundImage: string
//   genres: string[]
//   animeId?: string
//   anime?: Anime
// }

// interface HeroBannerProps {
//   animes?: Anime[]
// }


export function HeroBanner() {
  const swiperRef = useRef<SwiperRef | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [watchHistoryMap, setWatchHistoryMap] = useState<Record<string, Array<{ animeId: string; episodeId?: string; completed?: boolean; progress?: number }>>>({})
  const [heroBanners, setHeroBanners] = useState<Array<Record<string, unknown>>>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteLoading, setFavoriteLoading] = useState<string[]>([])

  const goToNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext()
    }
  }

  const goToPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev()
    }
  }

  // Função para precarregar imagens
  const preloadImages = (imageUrls: string[]): Promise<void[]> => {
    return Promise.all(
      imageUrls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
          img.src = url
        })
      })
    )
  }

  // Carregar banners da API
  useEffect(() => {
    const loadHeroBanners = async () => {
      setBannersLoading(true)
      setImagesLoaded(false)
      
      try {
        const banners = await api.getHeroBanners()

        if (banners && banners.length > 0) {
          type BannerType = {
            backgroundImage?: string
            bannerUrl?: string
            banner?: string
            posterUrl?: string
            thumbnail?: string
          }
          // Extrair todas as URLs de imagem dos banners
          const imageUrls = (banners as BannerType[]).map((banner) =>
            banner.backgroundImage || banner.bannerUrl || banner.banner ||
            banner.posterUrl || banner.thumbnail || '/images/anime-placeholder.svg'
          ).filter(Boolean)
          
          // Precarregar todas as imagens
          try {
            await preloadImages(imageUrls)
            setImagesLoaded(true)
          } catch (error) {
            console.warn('Some banner images failed to preload:', error)
            setImagesLoaded(true) // Continuar mesmo com falha
          }
          
          setHeroBanners(banners as Array<Record<string, unknown>>)
        } else {
          // Se não há banners da API, não exibir nada
          setHeroBanners([])
          setImagesLoaded(true)
        }
      } catch (error) {
        console.error('Error loading hero banners:', error)
        setHeroBanners([])
        setImagesLoaded(true)
      } finally {
        setBannersLoading(false)
      }
    }

    loadHeroBanners()
  }, [])

  // Carregar histórico de visualização
  useEffect(() => {
    const loadWatchHistory = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const allHistory = await api.getWatchHistory(1, 100)
        const historyMap: Record<string, Array<{ animeId: string }>> = {}
        
        // Mapear histórico por anime
        allHistory.history?.forEach((h: { animeId: string }) => {
          if (!historyMap[h.animeId]) {
            historyMap[h.animeId] = []
          }
          historyMap[h.animeId].push(h)
        })
        
        setWatchHistoryMap(historyMap)
      } catch (error) {
        console.error('Error loading watch history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWatchHistory()
  }, [user])

  // Carregar favoritos do usuário
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavorites([])
        return
      }

      try {
        const userFavorites = await api.getFavorites()
        const favoriteIds = userFavorites.map((fav: Anime) => fav.id)
        setFavorites(favoriteIds)
      } catch (error) {
        console.error('Error loading favorites:', error)
        setFavorites([])
      }
    }

    loadFavorites()
  }, [user])

  // Função para alternar favoritos
  const toggleFavorite = async (animeId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (favoriteLoading.includes(animeId)) return

    try {
      setFavoriteLoading(prev => [...prev, animeId])
      
      if (favorites.includes(animeId)) {
        await api.removeFromFavorites(animeId)
        setFavorites(prev => prev.filter(id => id !== animeId))
      } else {
        await api.addToFavorites(animeId)
        setFavorites(prev => [...prev, animeId])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(prev => prev.filter(id => id !== animeId))
    }
  }

  // Função para obter primeiro episódio de uma temporada
  const getFirstEpisodeOfSeason = (anime: Anime, seasonNumber: number = 1) => {
    const season = anime.seasons?.find(s => s.seasonNumber === seasonNumber)
    if (season?.episodes && season.episodes.length > 0) {
      const sortedEpisodes = [...season.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber)
      return sortedEpisodes[0]
    }
    return null
  }

  // Determinar estado do botão e próximo episódio
  const getButtonState = (content: { anime?: Anime; animeId?: string }) => {
    // Se o conteúdo tem anime associado, usar lógica de histórico
    if (!content.anime && content.animeId) {
      return {
        text: 'VER DETALHES',
        action: () => router.push(`/anime/${content.animeId}`),
        disabled: false
      }
    }
    
    if (!content.anime) {
      return {
        text: 'VER DETALHES',
        action: () => router.push('/'),
        disabled: false
      }
    }
    
    const anime = content.anime
    if (!user) {
      return {
        text: 'FAZER LOGIN PARA ASSISTIR',
        action: () => router.push('/auth/login'),
        disabled: false
      }
    }

    const animeHistory = watchHistoryMap[anime.id] || []
    
    if (animeHistory.length === 0) {
      // Nunca assistiu
      return {
        text: 'ASSISTIR',
        action: () => {
          const firstEpisode = getFirstEpisodeOfSeason(anime, 1)
          if (firstEpisode) {
            router.push(`/watch/${firstEpisode.id}`)
          }
        },
        disabled: false
      }
    }

    // Usuário já assistiu algo
    const lastWatched = animeHistory[0] // Mais recente
    
    // Organizar todos os episódios por temporada e número
    const allEpisodes: Episode[] = []
    anime.seasons?.forEach((season: { seasonNumber: number; episodes?: Episode[] }) => {
      season.episodes?.forEach((ep: Episode) => {
        allEpisodes.push({ ...ep, seasonNumber: season.seasonNumber })
      })
    })
    allEpisodes.sort((a, b) => {
      const aSeasonNumber = a.seasonNumber || 1
      const bSeasonNumber = b.seasonNumber || 1
      
      if (aSeasonNumber !== bSeasonNumber) {
        return aSeasonNumber - bSeasonNumber
      }
      return a.episodeNumber - b.episodeNumber
    })

    // Encontrar último episódio assistido
    const lastEpisodeId = lastWatched.episodeId
    const lastEpisodeIndex = allEpisodes.findIndex(ep => ep.id === lastEpisodeId)
    
    if (lastEpisodeIndex === -1) {
      // Episódio não encontrado, voltar ao início
      return {
        text: 'ASSISTIR',
        action: () => {
          const firstEpisode = getFirstEpisodeOfSeason(anime, 1)
          if (firstEpisode) {
            router.push(`/watch/${firstEpisode.id}`)
          }
        },
        disabled: false
      }
    }

    const lastEpisode = allEpisodes[lastEpisodeIndex]
    const nextEpisodeIndex = lastEpisodeIndex + 1
    
    // Verificar se o último episódio foi completado
    const isLastEpisodeComplete = lastWatched.completed || (lastWatched.progress && lastWatched.progress >= 90)
    
    if (!isLastEpisodeComplete) {
      return {
        text: `Continuar T${lastEpisode.seasonNumber} E${lastEpisode.episodeNumber}`,
        action: () => router.push(`/watch/${lastEpisodeId}`),
        disabled: false
      }
    }
    
    // Se tem próximo episódio disponível
    if (nextEpisodeIndex < allEpisodes.length) {
      const nextEpisode = allEpisodes[nextEpisodeIndex]
      return {
        text: `Assistir T${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}`,
        action: () => router.push(`/watch/${nextEpisode.id}`),
        disabled: false
      }
    }
    
    // Terminou todos os episódios disponíveis
    return {
      text: 'Assistir Novamente T1 E1',
      action: () => {
        const firstEpisode = getFirstEpisodeOfSeason(anime, 1)
        if (firstEpisode) {
          router.push(`/watch/${firstEpisode.id}`)
        }
      },
      disabled: false
    }
  }

  // Usar apenas banners da API - sem fallback para mock data
  const contentToShow = (!bannersLoading && imagesLoaded && heroBanners.length > 0) ? heroBanners.map(banner => {
    const result: Record<string, unknown> = { ...banner }
    // Se tem anime associado, usar dados do anime para lógica de histórico
    if (banner.anime && typeof banner.anime === 'object' && banner.anime !== null) {
      result.seasons = (banner.anime as Anime).seasons
      result.id = (banner.anime as Anime).id
    }
    return result
  }) : []
  
  // Exibir loading skeleton se banners estão carregando ou imagens não foram precarregadas
  if (bannersLoading || !imagesLoaded) {
    return (
      <div className="relative h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-pulse" />
        <div className="absolute inset-0 flex items-center pb-6 sm:pb-8 md:pb-10 lg:pb-12 z-20">
          <div className="w-full px-6 sm:px-8 lg:px-12 ml-0 sm:ml-8 lg:ml-16">
            <div className="max-w-2xl space-y-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
              <div className="h-12 bg-gray-700 rounded animate-pulse w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse w-1/2"></div>
              <div className="h-12 bg-gray-700 rounded animate-pulse w-40"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se não há banners para exibir, não renderizar nada
  if (contentToShow.length === 0) {
    return null
  }

  return (
    <div className="relative h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] w-full overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation={false}
        pagination={{
          el: '.hero-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} hero-pagination-bullet"></span>`
          },
        }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        loop={true}
        onSlideChange={() => {}}
        ref={swiperRef}
        className="h-full w-full relative z-10"
        style={{ 
          '--swiper-navigation-color': '#2563eb',
          '--swiper-pagination-color': '#2563eb' 
        } as React.CSSProperties}
      >
        {contentToShow.map((content, index) => {
          const episodeText = content.episode && (typeof content.episode === 'string' || typeof content.episode === 'number') ? String(content.episode) : null
          const title = String(content.title || '')
          const subtitle = String(content.subtitle || '')
          const description = typeof content.description === 'string' ? content.description : ''
          const rating = String(content.rating || '16')
          const year = typeof content.year === 'number' ? content.year : new Date().getFullYear()
          const genres = Array.isArray(content.genres) ? content.genres : ['Ação', 'Aventura', 'Anime']
          return (
          <SwiperSlide key={`${content.id}-${index}`}>
            <div className="relative h-full w-full">
              {/* Background Image with Parallax Effect */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[8000ms]"
                style={{ backgroundImage: `url(${content.backgroundImage || content.bannerUrl || content.banner || content.posterUrl || content.thumbnail || '/images/anime-placeholder.svg'})` }}
              />

              {/* Advanced Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent" />

              {/* Main Content Container */}
              <div className="absolute inset-0 flex items-center pb-4 sm:pb-6 md:pb-8 lg:pb-10 xl:pb-12 z-20">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 ml-0 sm:ml-4 lg:ml-8 xl:ml-16">
                  <div className="max-w-xl sm:max-w-2xl">

                    {/* Main Content */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4 animate-fadeIn">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider backdrop-blur-sm bg-blue-600/90 text-white">
                          ANIME
                        </div>
                        {episodeText && (
                          <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium text-white">
                            {episodeText}
                          </div>
                        )}
                      </div>

                      {/* Title with Enhanced Typography */}
                      <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[0.9] sm:leading-[0.85] text-white drop-shadow-2xl tracking-tight">
                          {title}
                        </h1>
                        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-blue-300 font-medium max-w-xs sm:max-w-sm md:max-w-lg leading-relaxed">
                          {subtitle || (description ? description.slice(0, 60) + '...' : 'Descrição não disponível')}
                        </h2>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm text-white/90">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-white">{rating}+</span>
                          </div>
                          <span className="font-medium">{year}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/60 rounded-full"></div>
                          <span>24 min</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>4K Ultra HD</span>
                        </div>
                      </div>

                      {/* Genres as Pills */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {genres.slice(0, 3).map((genre: unknown) => (
                          <span key={String(genre)} className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm text-white/90 hover:bg-blue-500/30 transition-colors cursor-pointer">
                            {String(genre)}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed text-white/80 max-w-xs sm:max-w-sm md:max-w-xl line-clamp-2 hidden sm:block">
                        {description || 'Uma aventura épica cheia de ação e emoção que irá te manter na borda do assento.'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col xs:flex-row sm:flex-row gap-1.5 sm:gap-2 md:gap-3 pt-1 sm:pt-2">
                        {(() => {
                          const buttonState = getButtonState(content)
                          return (
                            <button 
                              onClick={buttonState.action}
                              disabled={buttonState.disabled}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:min-h-[44px]"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <span className="text-xs sm:text-sm md:text-base font-bold">{buttonState.text}</span>
                            </button>
                          )
                        })()}
                        
                        <button 
                          onClick={() => {
                            const animeId = content.animeId || (content.anime && typeof content.anime === 'object' && 'id' in content.anime ? (content.anime as { id: string }).id : null)
                            if (animeId) {
                              router.push(`/anime/${animeId}`)
                            }
                          }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 hover:border-blue-300/50 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center group min-h-[40px] sm:min-h-[44px]"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs sm:text-sm">Mais Info</span>
                        </button>

                        {(() => {
                          const animeId = String(content.animeId || (content.anime && typeof content.anime === 'object' && 'id' in content.anime ? (content.anime as { id: string }).id : null) || '')
                          if (!animeId) return null

                          const isFavorite = favorites.includes(animeId)
                          const isLoading = favoriteLoading.includes(animeId)
                          
                          return (
                            <button 
                              onClick={() => toggleFavorite(animeId)}
                              disabled={isLoading}
                              className={`font-semibold p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center group border-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] ${
                                isFavorite
                                  ? 'bg-red-600/20 border-red-500/60 hover:bg-red-600/30 text-red-300'
                                  : 'bg-transparent hover:bg-white/10 border-white/40 hover:border-blue-300/60 text-white'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              {isLoading ? (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin rounded-full border-b-2 border-current"></div>
                              ) : (
                                <svg 
                                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" 
                                  fill={isFavorite ? "currentColor" : "none"} 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              )}
                            </button>
                          )
                        })()}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        )})}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-blue-600/50 p-2.5 sm:p-3 md:p-4 rounded-full text-white transition-all duration-300 cursor-pointer hover:scale-110 group"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-blue-600/50 p-2.5 sm:p-3 md:p-4 rounded-full text-white transition-all duration-300 cursor-pointer hover:scale-110 group"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Custom Pagination */}
      <div className="hero-pagination absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3"></div>

    </div>
  )
}