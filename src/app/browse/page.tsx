'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
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

type BrowseTab = 'all' | 'new' | 'top'

export default function BrowsePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<BrowseTab>('all')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  // Auth Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const genres = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Terror',
    'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Esportes'
  ]

  const types = ['ANIME', 'FILME', 'SERIE']

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user) {
      fetchAnimes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, selectedType, activeTab, user])

  const fetchAnimes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGenre) params.append('genre', selectedGenre)
      if (selectedType) params.append('type', selectedType)
      if (search) params.append('search', search)

      // Dynamic sorting based on tab
      if (activeTab === 'new') {
        params.append('sortBy', 'createdAt')
        params.append('sortOrder', 'desc')
      } else if (activeTab === 'top') {
        params.append('sortBy', 'rating')
        params.append('sortOrder', 'desc')
      }

      const response = await fetch(`/api/public/animes?${params.toString()}`)
      const data: AnimeResponse = await response.json()
      setAnimes(data.animes)
    } catch (error) {
      console.error('Error fetching animes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAnimes()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Header forceSolid={isScrolled} />

      {/* Atmospheric Hero Header */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6">
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
                <span className="text-slate-700">/</span>
                <span className="text-slate-400">Hub do Aventureiro</span>
              </nav>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                EXPLORE O <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">MULTIVERSO</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl font-medium">
                Sua jornada pelos mundos mais épicos começa aqui. Filtre por gênero, tipo ou busque seu destino.
              </p>
            </div>

            {/* Premium Search Bar */}
            <div className="w-full md:w-96">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar na forja..."
                  className="relative w-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-4 pl-14 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-all font-bold"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>
          </div>

          {/* Dynamic Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
            {[
              { id: 'all', label: 'Catálogo', icon: '📜' },
              { id: 'new', label: 'Novidades', icon: '✨' },
              { id: 'top', label: 'Top Animes', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BrowseTab)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 active:scale-95'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar - Sticky on scroll? */}
      <div className="sticky top-[73px] z-50 px-6 mt-[-1px]">
        <div className={`max-w-7xl mx-auto transition-all duration-300 ${isScrolled ? 'translate-y-2' : ''}`}>
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-2xl">
            {/* Genre Pills - Scrollable */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mask-fade-right">
              <button
                onClick={() => setSelectedGenre('')}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === '' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
              >
                Todos
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === genre ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

            {/* Type Switcher */}
            <div className="flex items-center gap-2 ml-auto">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === type ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  {type === 'ANIME' ? 'Animes' : type === 'FILME' ? 'Filmes' : 'Séries'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900/50 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-sm">
            <div className="text-8xl mb-8">🔭</div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Nenhum mundo encontrado</h2>
            <p className="text-slate-500 font-medium">Tente ajustar seus filtros ou busca na forja.</p>
            <button
              onClick={() => { setSelectedGenre(''); setSelectedType(''); setSearch(''); setActiveTab('all'); }}
              className="mt-8 text-blue-400 font-black uppercase text-xs tracking-[0.2em] border-b-2 border-blue-500/50 pb-2 hover:text-blue-300 transition-all"
            >
              Resetar Aventura
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 animate-fade-in">
            {animes.map((anime) => (
              <div
                key={anime.id}
                onClick={() => router.push(`/animes/${anime.slug}`)}
                className="group relative flex flex-col cursor-pointer"
              >
                {/* Anime Card Poster */}
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-3xl">
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

                  {/* Type/Status Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-blue-600/90 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {anime.type === 'ANIME' ? 'Anime' : 'Filme'}
                    </span>
                    {anime.status === 'ONGOING' && (
                      <span className="bg-green-500/90 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Em Lançamento
                      </span>
                    )}
                  </div>

                  {/* Hover Info Reveal */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
                    <p className="text-xs text-slate-300 font-medium line-clamp-3 mb-4 leading-relaxed">
                      {anime.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.slice(0, 2).map((g) => (
                        <span key={g} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded-lg">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Info (Outside Card for legibility) */}
                <div className="mt-4 px-1">
                  <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-500">{anime.year}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <div className="flex gap-1.5">
                      {anime.isSubbed && <span className="text-[9px] font-black text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">Leg</span>}
                      {anime.isDubbed && <span className="text-[9px] font-black text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">Dub</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Navigation/Pagination Info */}
        {!loading && animes.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Página {activeTab === 'all' ? '1 de ??' : 'Destaques'}</span>
            <div className="flex gap-4">
              <button disabled className="text-[10px] font-black uppercase tracking-widest opacity-30 cursor-not-allowed">Anterior</button>
              <button className="text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Próxima</button>
            </div>
          </div>
        )}
      </main>

      {/* Redundant Footer Integration */}
      <Footer />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-right { mask-image: linear-gradient(to right, black 85%, transparent); }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradientX 5s ease infinite;
        }
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shadow-3xl {
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  )
}
