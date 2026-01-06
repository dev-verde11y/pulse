'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([])
  const [loadingAnimes, setLoadingAnimes] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    checkAuth()
    fetchTrendingAnimes()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchTrendingAnimes = async () => {
    try {
      const response = await fetch('/api/public/animes?limit=4')
      const data = await response.json()
      if (data.animes) {
        setTrendingAnimes(data.animes)
      }
    } catch (error) {
      console.error('Error fetching trending animes:', error)
    } finally {
      setLoadingAnimes(false)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      setIsAuthenticated(response.ok)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleStartQuest = () => {
    router.push('/plans')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      {/* Header - Transparent to Solid on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg w-full h-full flex items-center justify-center font-black text-white text-xl">P</div>
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">PULSE</span>
          </div>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-10">
              {[
                { label: 'Catálogo', href: '/browse' },
                { label: 'Novidades', href: '/news' },
                { label: 'Top Animes', href: '/popular' },
                { label: 'Comunidade', href: '/browse' }
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{item.label}</Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest">Login</Link>
                <button
                  onClick={handleStartQuest}
                  className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-400 hover:text-white transition-all shadow-xl shadow-white/5"
                >
                  Iniciar Quest
                </button>
              </>
            ) : (
              <Link href="/dashboard" className="bg-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-500 transition-all">DASHBOARD</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Cinematic Impact */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-[#020617] z-10"></div>
          <div className="absolute inset-0 bg-black/40 z-10"></div>

          {/* Moving particles/mesh could be added here later with canvas */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Nova Temporada Disponível</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter drop-shadow-2xl">
            SUA PRÓXIMA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 animate-gradient-x underline decoration-blue-500/30 decoration-8 underline-offset-8">AVENTURA</span>
            <br /> COMEÇA AQUI
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Mergulhe em universos infinitos com qualidade Superior cinematográfica.
            A forja dos maiores títulos de anime, agora ao seu alcance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in-up delay-300">
            <button
              onClick={handleStartQuest}
              className="group relative px-12 py-5 bg-blue-600 rounded-full font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-blue-500 active:scale-95 shadow-2xl shadow-blue-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              Escolher sua Classe
            </button>
            <Link
              href="/browse"
              className="px-10 py-5 rounded-full border border-white/10 font-black text-sm uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
            >
              Explorar Catálogo
            </Link>
          </div>

          {/* Scrolling Brand Bar */}
          <div className="relative mt-20 opacity-30 mask-fade-edges overflow-hidden whitespace-nowrap py-10">
            <div className="inline-block animate-marquee">
              {['SHONEN', 'SEINEN', 'SHOUJO', 'JOSEI', 'SLICE OF LIFE', 'FANTASY', 'MECHANICAL', 'PSYCHOLOGICAL'].map((genre) => (
                <span key={genre} className="text-4xl font-black mx-12 text-slate-700 tracking-[0.5em]">{genre}</span>
              ))}
            </div>
            <div className="inline-block animate-marquee">
              {['SHONEN', 'SEINEN', 'SHOUJO', 'JOSEI', 'SLICE OF LIFE', 'FANTASY', 'MECHANICAL', 'PSYCHOLOGICAL'].map((genre) => (
                <span key={genre} className="text-4xl font-black mx-12 text-slate-700 tracking-[0.5em]">{genre}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Showcase - Premium Visuals */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Lendários em Exibição</h2>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight">O que está em <span className="text-slate-500">alta</span></h3>
            </div>
            <Link href="/browse" className="text-sm font-black uppercase tracking-widest border-b-2 border-blue-500 pb-2 hover:text-blue-400 transition-all">Ver todos</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingAnimes ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900/50 animate-pulse border border-white/5"></div>
              ))
            ) : trendingAnimes.length > 0 ? (
              trendingAnimes.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => router.push(`/animes/${anime.slug}`)}
                  className="group relative aspect-[2/3] overflow-hidden rounded-2xl bg-slate-900 border border-white/5 cursor-pointer"
                >
                  <Image
                    src={anime.posterUrl || anime.thumbnail || 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=500&h=750&fit=crop'}
                    alt={anime.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    {anime.type === 'ANIME' ? `${anime.year}` : 'Filme'}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block">
                      {anime.genres[0] || 'Ação'}
                    </span>
                    <h4 className="text-xl font-black uppercase leading-tight tracking-tighter">{anime.title}</h4>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 col-span-full text-center py-10">Nenhum lendário encontrado na forja.</p>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section - "Adventurer's Perks" */}
      <section className="py-32 bg-slate-950/40 relative border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Vantagens de Elite</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight">O PODER DA FORJA <span className="text-slate-500">PULSE</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: '🚀', title: 'Speed of Sound', desc: 'Sincronização global. Assista apenas 1 hora após a estréia no Japão.' },
              { icon: '💎', title: 'Infinite Clarity', desc: 'Resolução 4K nativa com HDR para uma imersão Visual nunca vista em animes.' },
              { icon: '⚔️', title: 'Ad-Free Battle', desc: 'Lute contra as distrações. Zero propaganda em todos os planos de assinatura.' }
            ].map((benefit, i) => (
              <div key={i} className="text-center group">
                <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500 inline-block">{benefit.icon}</div>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{benefit.title}</h4>
                <p className="text-slate-400 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quest Selection CTA - Replaces the Pricing Section */}
      <section className="py-40 relative overflow-hidden">
        {/* Background visual for the CTA */}
        <div className="absolute inset-0 bg-blue-600/5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-black p-12 md:p-24 rounded-[3rem] border border-white/10 text-center shadow-3xl shadow-blue-500/10">
            <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.5em] mb-8">O Chamado para a Evolução</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-tight">
              SUA CLASSE <br /> ESTÁ À SUA <br /> <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ESPERA</span>
            </h3>

            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              De aventureiro a titã. Escolha o seu caminho e desbloqueie o verdadeiro potencial da sua experiência anime.
            </p>

            <button
              onClick={handleStartQuest}
              className="px-16 py-6 bg-white text-black rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-400 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95"
            >
              Iniciar Evolução
            </button>

            <p className="mt-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
              Garantia de 7 dias • Sem contratos • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Minimal & Bold */}
      <footer className="py-20 bg-black border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">P</div>
              <span className="text-2xl font-black tracking-tighter">PULSE</span>
            </div>

            <div className="flex gap-10">
              <Link href="/browse" className="text-xs font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">Catálogo</Link>
              <Link href="/pricing" className="text-xs font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">Planos</Link>
              <Link href="/terms" className="text-xs font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">Privacidade</Link>
            </div>

            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} PULSE STREAMING INTERACTIVE
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles for animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
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
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
