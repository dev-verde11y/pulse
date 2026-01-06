'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Anime {
  id: string
  title: string
  description: string
  thumbnail: string | null
  posterUrl: string | null
  bannerUrl: string | null
  year: number
  status: string
  type: string
  rating: string
  genres: string[]
  tags: string[]
  isSubbed: boolean
  isDubbed: boolean
  slug: string
}

interface AnimeResponse {
  animes: Anime[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function PopularesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  // Auth Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    if (user) {
      fetchPopulares()
    }
    return () => window.removeEventListener('scroll', handleScroll)
  }, [user])

  const fetchPopulares = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/animes?sortBy=rating&sortOrder=desc&limit=15')
      const data: AnimeResponse = await response.json()
      setAnimes(data.animes || [])
    } catch (error) {
      console.error('Error fetching populares:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Header forceSolid={isScrolled} />

      {/* Cinematic Hero Header */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 animate-fade-in-up">
            <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">Elite dos Mundos</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
            MUNDO DOS <br />
            <span className="bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent animate-gradient-x">LENDÁRIOS</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            Contemple a elite. Os 15 títulos mais aclamados por aventureiros de todo o multiverso, forjados em glória e perfeição.
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900/50 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-sm">
            <div className="text-8xl mb-8">⚔️</div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">A forja está vazia</h2>
            <p className="text-slate-500 font-medium">Os lendários ainda não foram convocados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            {animes.map((anime, index) => {
              const isTop3 = index < 3
              return (
                <div
                  key={anime.id}
                  onClick={() => router.push(`/animes/${anime.slug}`)}
                  className={`group relative flex flex-col cursor-pointer transition-all duration-500 ${isTop3 ? 'scale-105 z-10' : ''}`}
                >
                  {/* Position Badge Huge */}
                  <div className={`absolute -top-6 -left-4 z-20 font-black text-6xl md:text-7xl italic leading-none transition-transform duration-500 group-hover:-translate-y-2 ${index === 0 ? 'text-yellow-400 opacity-40 group-hover:opacity-70' :
                    index === 1 ? 'text-slate-300 opacity-30 group-hover:opacity-60' :
                      index === 2 ? 'text-orange-400 opacity-30 group-hover:opacity-60' :
                        'text-white/10 group-hover:text-blue-500/30'
                    }`}>
                    #{index + 1}
                  </div>

                  {/* Anime Card Poster */}
                  <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-500 ${index === 0 ? 'border-yellow-500/50 shadow-2xl shadow-yellow-500/10' :
                    index === 1 ? 'border-slate-400/30 shadow-2xl shadow-slate-400/5' :
                      index === 2 ? 'border-orange-500/30 shadow-2xl shadow-orange-500/5' :
                        'border-white/5 hover:border-blue-500/50'
                    }`}>
                    <Image
                      src={anime.posterUrl || anime.thumbnail || 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=500&h=750&fit=crop'}
                      alt={anime.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />

                    {/* Top 1 Glow Overlay */}
                    {index === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-transparent opacity-50"></div>
                    )}

                    {/* Rating Bubble */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-yellow-400 border border-yellow-400/20 flex items-center gap-1.5 shadow-xl">
                      <span>⭐</span> {anime.rating || 'N/A'}
                    </div>

                    {/* Content Logic Hover Reveal */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {anime.genres.slice(0, 2).map((g) => (
                          <span key={g} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded-lg backdrop-blur-md">{g}</span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium line-clamp-2 mb-2 leading-relaxed">
                        {anime.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-6 px-1 text-center">
                    <h3 className={`font-black text-base uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1 ${isTop3 ? 'md:text-lg' : 'text-sm'}`}>
                      {anime.title}
                    </h3>
                    <div className="flex items-center justify-center gap-3 mt-1 underline decoration-white/5 underline-offset-4">
                      <span className="text-[10px] font-bold text-slate-500">{anime.year}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{anime.type === 'ANIME' ? 'Anime' : 'Filme'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradientX 5s ease infinite;
        }
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}