'use client'

import { useRef } from 'react'
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

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
  type: 'anime' | 'filme' | 'serie'
  year: number
  rating: string
  duration: string
  episode?: string
  backgroundImage: string
  logo?: string
  genres: string[]
}

const heroContent: HeroContent[] = [
  {
    id: '1',
    title: 'Kaiju Nº8',
    subtitle: 'Kafka wants to clean up kaiju, but not literally! Will a sudden metamorphosis stand in the way of his dream?',
    description: 'Em um mundo onde a humanidade vive dentro de cidades cercadas por enormes muralhas devido ao aparecimento de gigantes humanoides comedores de gente, Eren Jaeger, sua irmã adotiva Mikasa Ackerman e seu amigo de infância Armin Arlert se juntam ao brutal Survey Corps, uma força militar que combate os titãs fora das muralhas.',
    type: 'anime',
    year: 2013,
    rating: '16+',
    duration: '24 min',
    episode: 'T4 E28',
    backgroundImage: 'https://dw9to29mmj727.cloudfront.net/promo/2016/6282-Header_KaijuNo8_2000x800.jpg',
    genres: ['Ação', 'Drama', 'Fantasia', 'Militar']
  },
    {
    id: '2',
    title: 'Demon Slayer',
    subtitle: 'Kimetsu no Yaiba',
    description: 'Desde os tempos antigos, rumores de demônios comedores de carne rondam por aí. Tanjiro Kamado vive nas montanhas com sua família. Um dia, quando retorna de vender carvão na cidade, encontra sua família massacrada por um demônio. A única sobrevivente é sua irmã Nezuko, que se transformou em um demônio.',
    type: 'anime',
    year: 2019,
    rating: '14+',
    duration: '23 min',
    episode: 'T3 E11',
    backgroundImage: 'https://cdn.selectgame.net/wp-content/uploads/2025/06/Kimetsu-capa-Akaza-28-06.webp',
    genres: ['Ação', 'Sobrenatural', 'Histórico', 'Shounen']
  },
  {
    id: '3',
    title: 'Demon Slayer',
    subtitle: 'Kimetsu no Yaiba',
    description: 'Desde os tempos antigos, rumores de demônios comedores de carne rondam por aí. Tanjiro Kamado vive nas montanhas com sua família. Um dia, quando retorna de vender carvão na cidade, encontra sua família massacrada por um demônio. A única sobrevivente é sua irmã Nezuko, que se transformou em um demônio.',
    type: 'anime',
    year: 2019,
    rating: '14+',
    duration: '23 min',
    episode: 'T3 E11',
    backgroundImage: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1920&h=1080&fit=crop',
    genres: ['Ação', 'Sobrenatural', 'Histórico', 'Shounen']
  },
  {
    id: '4',
    title: 'Tougen Anki',
    subtitle: 'Kimi no Na wa',
    description: 'Mitsuha é uma colegial que vive numa pequena cidade rural no Japão. Entediada com a vida no campo, ela sonha em ser um garoto bonito de Tokyo na próxima vida. Enquanto isso, Taki é um colegial que vive em Tokyo, trabalha meio período num restaurante italiano e aspira ser um arquiteto.',
    type: 'filme',
    year: 2016,
    rating: '10+',
    duration: '1h 46min',
    backgroundImage: 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=cover,format=auto,quality=85,width=1920/keyart/GP5HJ84D2-backdrop_wide',
    genres: ['Romance', 'Drama', 'Sobrenatural', 'Slice of Life']
  }
]

export function HeroBanner() {
  const swiperRef = useRef<SwiperRef | null>(null)

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
  
  return (
    <div className="relative h-[calc(100vh-1rem)] w-full overflow-hidden">
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
          delay: 8000,
          disableOnInteraction: false,
        }}
        onSlideChange={() => {}}
        ref={swiperRef}
        className="h-full w-full relative z-10"
        style={{ 
          '--swiper-navigation-color': '#2563eb',
          '--swiper-pagination-color': '#2563eb' 
        } as React.CSSProperties}
      >
        {heroContent.map((content) => (
          <SwiperSlide key={content.id}>
            <div className="relative h-full w-full">
              {/* Background Image with Parallax Effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[8000ms]"
                style={{ backgroundImage: `url(${content.backgroundImage})` }}
              />
              
              {/* Advanced Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent" />
              
              {/* Main Content Container */}
              <div className="absolute inset-0 flex items-end pb-20 lg:pb-24 z-20">
                <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    
                    {/* Left Column - Main Content */}
                    <div className="space-y-6 animate-fadeIn">
                      {/* Type Badge */}
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm ${
                          content.type === 'anime' ? 'bg-blue-600/90 text-white' : 
                          content.type === 'filme' ? 'bg-indigo-600/90 text-white' : 'bg-cyan-600/90 text-white'
                        }`}>
                          {content.type}
                        </div>
                        {content.episode && (
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white">
                            {content.episode}
                          </div>
                        )}
                      </div>

                      {/* Title with Enhanced Typography */}
                      <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] text-white drop-shadow-2xl tracking-tight">
                          {content.title}
                        </h1>
                        <h2 className="text-lg md:text-xl lg:text-2xl text-blue-300 font-medium max-w-xl">
                          {content.subtitle}
                        </h2>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{content.rating}</span>
                          </div>
                          <span className="font-medium">{content.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>{content.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>HD</span>
                        </div>
                      </div>

                      {/* Genres as Pills */}
                      <div className="flex flex-wrap gap-2">
                        {content.genres.slice(0, 4).map((genre) => (
                          <span key={genre} className="bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-sm text-white/90 hover:bg-white/25 transition-colors cursor-pointer">
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-base lg:text-lg leading-relaxed text-white/80 max-w-2xl line-clamp-3">
                        {content.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-2xl group">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="text-sm sm:text-base">{content.episode ? `Continuar ${content.episode}` : 'Assistir Agora'}</span>
                        </button>
                        
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 flex items-center justify-center group">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm sm:text-base">Mais Info</span>
                        </button>

                        <button className="bg-transparent hover:bg-white/10 border-2 border-white/40 hover:border-white/60 text-white font-semibold p-3 sm:p-4 rounded-xl transition-all duration-300 flex items-center justify-center group sm:w-auto">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Progress Bar (if episode) */}
                      {content.episode && (
                        <div className="pt-6 space-y-3">
                          <div className="flex items-center justify-between text-sm text-white/70">
                            <span>Seu progresso no episódio</span>
                            <span className="text-blue-300 font-medium">67% concluído</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-2/3 transition-all duration-1000 shadow-lg"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Additional Info/Logo Space */}
                    <div className="hidden lg:flex items-end justify-end">
                      <div className="space-y-4 text-right">
                        {/* Space for future logo or additional content */}
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