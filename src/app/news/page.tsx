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

export default function NovidadesPage() {
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
      fetchNovidades()
    }
    return () => window.removeEventListener('scroll', handleScroll)
  }, [user])

  const fetchNovidades = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/animes?sortBy=createdAt&sortOrder=desc&limit=24')
      const data: AnimeResponse = await response.json()
      setAnimes(data.animes || [])
    } catch (error) {
      console.error('Error fetching novidades:', error)
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
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Novos Horizontes</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
            NOVAS <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-x underline decoration-blue-500/30 decoration-8 underline-offset-8">JORNADAS</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-12">
            Descubra as crônicas mais recentes adicionadas à biblioteca.
            Segredos recém-revelados e aventuras que acabaram de começar.
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900/50 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-sm text-center">
            <div className="text-8xl mb-8">✨</div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">O futuro ainda está sendo escrito</h2>
            <p className="text-slate-500 font-medium max-w-md">Novas histórias estão sendo forjadas neste exato momento. Retorne em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fade-in">
            {animes.map((anime) => (
              <div
                key={anime.id}
                onClick={() => router.push(`/anime/${anime.id}`)}
                className="group relative flex flex-col cursor-pointer"
              >
                {/* Anime Card Poster */}
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
                  <Image
                    src={anime.posterUrl || anime.thumbnail || 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=500&h=750&fit=crop'}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  {/* Subtle Top Gradient */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>

                  {/* Rating Bubble */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-yellow-400 border border-yellow-400/20 flex items-center gap-1">
                    <span>⭐</span> {anime.rating || 'N/A'}
                  </div>

                  {/* NEW Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none flex items-center gap-1 shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      Novo
                    </span>
                  </div>

                  {/* Hover Info Reveal */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 translate-y-4 group-hover:translate-y-0 text-center">
                    <p className="text-[10px] text-slate-300 font-medium line-clamp-3 mb-2 leading-relaxed">
                      {anime.description}
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 px-1">
                  <h3 className="font-black text-xs uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500">{anime.year}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <div className="flex gap-1.5">
                      {anime.isSubbed && <span className="text-[8px] font-black text-slate-400 bg-white/5 px-1 rounded uppercase tracking-tighter">Leg</span>}
                      {anime.isDubbed && <span className="text-[8px] font-black text-slate-400 bg-white/5 px-1 rounded uppercase tracking-tighter">Dub</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}