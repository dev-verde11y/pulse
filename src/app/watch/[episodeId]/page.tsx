'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { api } from '@/lib/api'
import { Episode, Anime, Season } from '@/types/anime'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon, StarIcon, HomeIcon } from '@heroicons/react/24/solid'
import { PlayIcon } from '@heroicons/react/24/solid'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const activeEpisodeRef = useRef<HTMLButtonElement>(null)

  const [episode, setEpisode] = useState<Episode | null>(null)
  const [anime, setAnime] = useState<Anime | null>(null)
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [showEpisodeList, setShowEpisodeList] = useState(true)
  const [isSwitchingEpisode, setIsSwitchingEpisode] = useState(false)
  const [initialProgress, setInitialProgress] = useState(0)

  const episodeId = params.episodeId as string

  // Auth Redirect
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadEpisodeData() {
      if (!user || !episodeId) return
      setIsSwitchingEpisode(true)
      try {
        const episodeData = await api.getEpisode(episodeId)
        setEpisode(episodeData)

        const animeData = await api.getAnime(episodeData.season.animeId)
        setAnime(animeData)

        const episodes: Episode[] = []
        animeData.seasons?.forEach((season: Season) => {
          if (season.episodes) {
            episodes.push(...season.episodes.map(ep => ({ ...ep, seasonNumber: season.seasonNumber })))
          }
        })

        episodes.sort((a, b) => {
          if ((a.seasonNumber ?? 1) !== (b.seasonNumber ?? 1)) return (a.seasonNumber ?? 1) - (b.seasonNumber ?? 1)
          return a.episodeNumber - b.episodeNumber
        })

        setAllEpisodes(episodes)
        setCurrentEpisodeIndex(episodes.findIndex(ep => ep.id === episodeId))

        // Buscar progresso salvo
        try {
          const history = await api.getAnimeWatchHistory(episodeData.season.animeId)
          if (history && history.watchHistory) {
            const episodeHistory = history.watchHistory.find((h: any) => h.episodeId === episodeId)
            console.log('Histórico encontrado:', episodeHistory)
            if (episodeHistory && episodeHistory.progress < 95) {
              setInitialProgress(episodeHistory.progress)
            } else {
              setInitialProgress(0)
            }
          }
        } catch (e) {
          console.error('Erro ao buscar histórico de progresso:', e)
        }
      } catch (error) {
        console.error('Error loading episode:', error)
        router.push('/dashboard')
      } finally {
        setDataLoading(false)
        setIsSwitchingEpisode(false)
      }
    }
    loadEpisodeData()
  }, [episodeId, user, router])

  // Efeito para rolar a lista lateral para o episódio atual
  useEffect(() => {
    if (activeEpisodeRef.current && showEpisodeList) {
      activeEpisodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentEpisodeIndex, showEpisodeList])

  const findNextAvailableIndex = useCallback(() => {
    for (let i = currentEpisodeIndex + 1; i < allEpisodes.length; i++) {
      if (allEpisodes[i].id) return i
    }
    return -1
  }, [allEpisodes, currentEpisodeIndex])

  const findPrevAvailableIndex = useCallback(() => {
    for (let i = currentEpisodeIndex - 1; i >= 0; i--) {
      if (allEpisodes[i].id) return i
    }
    return -1
  }, [allEpisodes, currentEpisodeIndex])

  const handleNextEpisode = useCallback(() => {
    const nextIdx = findNextAvailableIndex()
    if (nextIdx !== -1) router.push(`/watch/${allEpisodes[nextIdx].id}`)
  }, [findNextAvailableIndex, router, allEpisodes])

  const handlePreviousEpisode = useCallback(() => {
    const prevIdx = findPrevAvailableIndex()
    if (prevIdx !== -1) router.push(`/watch/${allEpisodes[prevIdx].id}`)
  }, [findPrevAvailableIndex, router, allEpisodes])

  // Atalhos de Teclado para Navegação de Página
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') handleNextEpisode()
      if (e.altKey && e.key.toLowerCase() === 'p') handlePreviousEpisode()
      if (e.altKey && e.key.toLowerCase() === 'l') setShowEpisodeList(prev => !prev)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNextEpisode, handlePreviousEpisode])

  if (authLoading || dataLoading) return <LoadingScreen message="Preparando sua experiência..." />
  if (!episode || !anime) return null

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-10" />
        <Image
          src={(anime.banner || anime.posterUrl || anime.thumbnail)!}
          alt=""
          fill
          className="object-cover blur-[140px] scale-150 opacity-25"
        />
      </div>

      {/* Header Premium (Navegação Focada) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

          {/* Lado Esquerdo: Identidade e Caminho */}
          <div className="flex items-center gap-6 lg:gap-10">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 group transition-all"
            >
              <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter hidden md:block"><span className="text-blue-500">P</span>ULSE</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10" />

            <nav className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/anime/${anime.id}`)}
                className="flex items-center gap-3 text-white/40 hover:text-white transition-all group"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] leading-none mb-1 text-blue-500/80">Série em Exibição</span>
                  <span className="text-sm font-black truncate max-w-[150px] lg:max-w-[300px] tracking-tight text-white uppercase italic">{anime.title}</span>
                </div>
                <ArrowLeftIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform rotate-180 opacity-40" />
              </button>
            </nav>
          </div>

          {/* Centro: Status Dinâmico */}
          <div className="hidden xl:flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 px-6 py-1.5 rounded-full flex items-center gap-3 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
                T{episode.seasonNumber} • EP {episode.episodeNumber} / {allEpisodes.length}
              </span>
            </div>
          </div>

          {/* Lado Direito: Controles de Playlist */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-2xl">
              <button
                onClick={handlePreviousEpisode}
                disabled={findPrevAvailableIndex() === -1}
                className="p-3 disabled:opacity-10 hover:bg-white/10 rounded-xl transition-all group"
                title="Episódio Anterior (Alt + P)"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNextEpisode}
                disabled={findNextAvailableIndex() === -1}
                className="p-3 disabled:opacity-10 hover:bg-white/10 rounded-xl transition-all group"
                title="Próximo Episódio (Alt + N)"
              >
                <ChevronRightIcon className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className={`p-4 rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showEpisodeList ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
              title="Alternar Playlist (Alt + L)"
            >
              <ListBulletIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`relative z-10 pt-28 pb-20 max-w-[1920px] mx-auto px-6 lg:px-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSwitchingEpisode ? 'opacity-20 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Seção do Player: O Cinema em Casa */}
          <div className={`flex-1 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showEpisodeList ? 'lg:w-[65%]' : 'w-full'}`}>
            <div className="relative group rounded-[56px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] bg-black border border-white/5 ring-1 ring-white/10">
              <VideoPlayer
                episode={episode}
                animeId={anime.id}
                initialProgress={initialProgress}
                onNextEpisode={handleNextEpisode}
                onPreviousEpisode={handlePreviousEpisode}
                hasNextEpisode={findNextAvailableIndex() !== -1}
                hasPreviousEpisode={findPrevAvailableIndex() !== -1}
              />
            </div>

            {/* Informações de Navegação e Contexto */}
            <div className="mt-20 animate-slide-up-soft">
              <div className="flex flex-col gap-8">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    TEMPORADA {episode.seasonNumber}
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                    {episode.duration || 24}M DURAÇÃO
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                    <StarIcon className="w-3 h-3 text-yellow-500" />
                    8.5 SCORE
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
                    {anime.rating}
                  </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.8] drop-shadow-2xl">{episode.title}</h1>

                <div className="max-w-4xl">
                  <p className="text-gray-400 text-2xl leading-relaxed font-medium italic opacity-90 relative">
                    <span className="text-blue-600 text-6xl absolute -left-10 -top-4 opacity-40">“</span>
                    {episode.description || `Um episódio emocionante que marca um ponto de virada crucial na saga de ${anime.title}.`}
                  </p>
                </div>
              </div>

              {/* Navegação Inferior de Contexto */}
              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div
                  onClick={() => router.push(`/anime/${anime.id}`)}
                  className="group bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 rounded-[48px] p-10 flex items-center gap-10 cursor-pointer hover:border-blue-500/40 transition-all duration-700"
                >
                  <div className="w-40 h-56 relative flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                    <Image src={(anime.posterUrl || anime.thumbnail)!} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em] mb-3 block">Explorar Série</span>
                    <h3 className="text-3xl font-black text-white italic tracking-tight mb-4 uppercase leading-none">{anime.title}</h3>
                    <button className="flex items-center gap-3 text-sm font-black text-white/50 group-hover:text-white transition-colors uppercase tracking-widest">
                      Ver Detalhes <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[48px] p-10 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Ano de Lançamento</span>
                      <span className="text-3xl font-black italic tracking-tighter">{anime.year}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Classificação</span>
                      <span className="text-2xl font-black italic tracking-tighter text-blue-500">{anime.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.slice(1, 5).map(g => (
                      <span key={g} className="text-[10px] font-bold text-white/30 border border-white/5 px-4 py-2 rounded-xl uppercase tracking-widest">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Playlist (O Coração da Navegação Lateral) */}
          <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showEpisodeList ? 'w-full lg:w-[420px] xl:w-[500px] translate-x-0 opacity-100' : 'w-0 translate-x-20 opacity-0 pointer-events-none'}`}>
            <aside className="sticky top-28 bg-white/[0.01] backdrop-blur-[100px] border border-white/5 rounded-[56px] overflow-hidden flex flex-col h-[calc(100vh-140px)] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
              {/* Header Playlist Premium */}
              <div className="p-12 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <ListBulletIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.5em] leading-none">Playlist Premium</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">Conteúdo</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Progresso</span>
                    <span className="text-2xl font-black italic text-blue-500 leading-none">
                      {currentEpisodeIndex + 1}<span className="text-white/20 px-1">/</span>{allEpisodes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Episódios com Auto-Scroll */}
              <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-4">
                {allEpisodes.map((ep, idx) => {
                  const isCurrent = ep.id === episodeId
                  const isWatched = idx < currentEpisodeIndex

                  return (
                    <button
                      key={ep.id}
                      ref={isCurrent ? activeEpisodeRef : null}
                      onClick={() => { if (!isCurrent) router.push(`/watch/${ep.id}`); }}
                      className={`w-full group relative flex items-center gap-6 p-5 rounded-[40px] transition-all duration-500 border ${isCurrent
                        ? 'bg-blue-600 border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.4)] ring-4 ring-blue-600/20'
                        : 'bg-white/[0.02] border-transparent hover:bg-white/[0.06] hover:border-white/10 hover:-translate-x-2'
                        }`}
                    >
                      <div className="relative w-36 h-24 flex-shrink-0 rounded-[28px] overflow-hidden bg-black/60 border border-white/10 shadow-lg">
                        <Image
                          src={(ep.thumbnailUrl || ep.thumbnail || anime.posterUrl || anime.thumbnail || '/images/episode-placeholder.svg')!}
                          alt=""
                          fill
                          className={`object-cover transition-transform duration-1000 group-hover:scale-125 ${!isCurrent && 'opacity-40 grayscale-[50%]'}`}
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-600/30 backdrop-blur-[2px]">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center pulse-primary">
                              <PlayIcon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        )}
                        {isWatched && !isCurrent && (
                          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-xl">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black font-mono tracking-tighter">
                          E{ep.episodeNumber}
                        </div>
                      </div>

                      <div className="text-left min-w-0 flex-1 py-1">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isCurrent ? 'text-blue-100' : 'text-blue-500'}`}>
                          EPISÓDIO {ep.episodeNumber}
                        </span>
                        <h4 className={`text-base font-black truncate tracking-tight uppercase leading-snug mt-1 ${isCurrent ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                          {ep.title}
                        </h4>
                        <div className={`flex items-center gap-3 mt-2 ${isCurrent ? 'text-blue-100/60' : 'text-gray-500'}`}>
                          <span className="text-[10px] font-black tracking-widest font-mono uppercase italic">{ep.duration || 24}M</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                          <span className="text-[9px] font-black tracking-[0.2em]">{isCurrent ? 'REPRODUZINDO' : isWatched ? 'VISUALIZADO' : 'AGUARDANDO'}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}