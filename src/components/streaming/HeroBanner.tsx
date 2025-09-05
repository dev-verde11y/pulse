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

interface HeroContent {
  id: string
  title: string
  subtitle: string
  description: string
  type: string
  year: number
  rating: string
  duration: string
  episode?: string
  backgroundImage: string
  genres: string[]
  animeId?: string
  anime?: Anime
}

interface HeroBannerProps {
  animes?: Anime[]
}


export function HeroBanner({ animes = [] }: HeroBannerProps) {
  const swiperRef = useRef<SwiperRef | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [watchHistoryMap, setWatchHistoryMap] = useState<Record<string, any>>({})
  const [heroBanners, setHeroBanners] = useState<any[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

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
          // Extrair todas as URLs de imagem dos banners
          const imageUrls = banners.map(banner => 
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
          
          setHeroBanners(banners)
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
        const historyMap: Record<string, any> = {}
        
        // Mapear histórico por anime
        allHistory.history?.forEach((h: any) => {
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
  const getButtonState = (content: any) => {
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
    anime.seasons?.forEach((season: any) => {
      season.episodes?.forEach((ep: any) => {
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
  const contentToShow = (!bannersLoading && imagesLoaded && heroBanners.length > 0) ? heroBanners.map(banner => ({
    ...banner,
    // Se tem anime associado, usar dados do anime para lógica de histórico
    ...(banner.anime && { 
      seasons: banner.anime.seasons,
      id: banner.anime.id 
    })
  })) : []
  
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
        {contentToShow.map((content) => (
          <SwiperSlide key={content.id}>
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
              <div className="absolute inset-0 flex items-center pb-6 sm:pb-8 md:pb-10 lg:pb-12 z-20">
                <div className="w-full px-6 sm:px-8 lg:px-12 ml-0 sm:ml-8 lg:ml-16">
                  <div className="max-w-2xl">
                    
                    {/* Main Content */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-fadeIn">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm bg-blue-600/90 text-white">
                          ANIME
                        </div>
                        {content.episode && (
                          <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white">
                            {content.episode}
                          </div>
                        )}
                      </div>

                      {/* Title with Enhanced Typography */}
                      <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[0.85] text-white drop-shadow-2xl tracking-tight">
                          {content.title}
                        </h1>
                        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-300 font-medium max-w-lg leading-relaxed">
                          {content.subtitle || content.description?.slice(0, 80) + '...' || 'Descrição não disponível'}
                        </h2>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{content.rating || '16'}+</span>
                          </div>
                          <span className="font-medium">{content.year || new Date().getFullYear()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>24 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>4K Ultra HD</span>
                        </div>
                      </div>

                      {/* Genres as Pills */}
                      <div className="flex flex-wrap gap-2">
                        {(content.genres || ['Ação', 'Aventura', 'Anime']).slice(0, 3).map((genre: string) => (
                          <span key={genre} className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-white/90 hover:bg-blue-500/30 transition-colors cursor-pointer">
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed text-white/80 max-w-xl line-clamp-2">
                        {content.description || 'Uma aventura épica cheia de ação e emoção que irá te manter na borda do assento.'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                        {(() => {
                          const buttonState = getButtonState(content)
                          return (
                            <button 
                              onClick={buttonState.action}
                              disabled={buttonState.disabled}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <span className="text-sm sm:text-base">{buttonState.text}</span>
                            </button>
                          )
                        })()}
                        
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 hover:border-blue-300/50 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center group">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Mais Info</span>
                        </button>

                        <button className="bg-transparent hover:bg-white/10 border-2 border-white/40 hover:border-blue-300/60 text-white font-semibold p-2.5 sm:p-3 rounded-lg transition-all duration-300 flex items-center justify-center group sm:w-auto">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-blue-600/50 p-4 rounded-full text-white transition-all duration-300 cursor-pointer hover:scale-110 group"
      >
        <svg className="w-6 h-6 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 hover:border-blue-600/50 p-4 rounded-full text-white transition-all duration-300 cursor-pointer hover:scale-110 group"
      >
        <svg className="w-6 h-6 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Custom Pagination */}
      <div className="hero-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3"></div>

    </div>
  )
}