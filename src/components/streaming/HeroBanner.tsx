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
    <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] w-full overflow-hidden">
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
              <div className="absolute inset-0 flex items-center pb-6 sm:pb-8 md:pb-10 lg:pb-12 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                  <div className="max-w-3xl">
                    
                    {/* Main Content */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-fadeIn">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-sm ${
                          content.type === 'anime' ? 'bg-blue-600/90 text-white' : 
                          content.type === 'filme' ? 'bg-indigo-600/90 text-white' : 'bg-cyan-600/90 text-white'
                        }`}>
                          {content.type}
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
                          {content.subtitle}
                        </h2>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
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
                          <span>4K Ultra HD</span>
                        </div>
                      </div>

                      {/* Genres as Pills */}
                      <div className="flex flex-wrap gap-2">
                        {content.genres.slice(0, 3).map((genre) => (
                          <span key={genre} className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-white/90 hover:bg-blue-500/30 transition-colors cursor-pointer">
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed text-white/80 max-w-xl line-clamp-2">
                        {content.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-xl group">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="text-sm sm:text-base">{content.episode ? `Continuar ${content.episode}` : 'Assistir Agora'}</span>
                        </button>
                        
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