'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
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
  const [currentSlide, setCurrentSlide] = useState(0)
  
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        onSwiper={(swiper) => console.log('Swiper initialized:', swiper)}
        className="h-full w-full relative z-0"
        style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' } as React.CSSProperties}
      >
        {heroContent.map((content, index) => (
          <SwiperSlide key={content.id}>
            <div 
              className="relative h-full w-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${content.backgroundImage})` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                  <div className="max-w-2xl text-white relative">
                    {/* Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        content.type === 'anime' ? 'bg-red-600' : 
                        content.type === 'filme' ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        {content.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 leading-tight drop-shadow-lg">
                      {content.title}
                    </h1>
                    
                    {/* Subtitle */}
                    <h2 className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
                      {content.subtitle}
                    </h2>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mb-6 text-sm">
                      <span className="bg-yellow-600 px-2 py-1 rounded text-black font-bold">
                        {content.rating}
                      </span>
                      <span>{content.year}</span>
                      <span>{content.duration}</span>
                      {content.episode && (
                        <span className="bg-white/20 px-2 py-1 rounded">
                          {content.episode}
                        </span>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {content.genres.map((genre) => (
                        <span key={genre} className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-lg leading-relaxed mb-8 text-gray-200 max-w-xl line-clamp-4">
                      {content.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-white text-black font-bold py-4 px-8 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center transform hover:scale-105 shadow-lg">
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        {content.episode ? `Assistir ${content.episode}` : 'Assistir Agora'}
                      </button>
                      
                      <button className="bg-gray-600/80 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mais Informações
                      </button>

                      <button className="bg-transparent border-2 border-white/50 text-white font-semibold py-4 px-6 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Progress Bar (if episode) */}
                    {content.episode && (
                      <div className="mt-8">
                        <div className="flex items-center gap-3 text-sm text-gray-300 mb-2">
                          <span>Progresso do episódio</span>
                          <span className="text-white font-medium">67%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full w-2/3"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Volume/Sound Toggle */}
              <button className="absolute bottom-8 right-8 bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 9v6a1 1 0 001.447.894L12 13h3a1 1 0 001-1V8a1 1 0 00-1-1h-3L7.447 4.106A1 1 0 006 5v4z" />
                </svg>
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  )
}