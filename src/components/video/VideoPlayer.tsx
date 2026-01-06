'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BackwardIcon,
  ForwardIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Definições de tipos para audioTracks
interface AudioTrackAPI {
  id: string
  label: string
  language: string
  enabled: boolean
}

interface AudioTrackList extends EventTarget {
  readonly length: number
  [index: number]: AudioTrackAPI
}

interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  audioTracks?: AudioTrackList
}

interface AudioTrack {
  id: number
  label: string
  language: string
  enabled: boolean
}

interface VideoPlayerProps {
  episode: Episode
  onNextEpisode?: () => void
  onPreviousEpisode?: () => void
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
  animeId: string
  initialProgress?: number
  nextEpisodeId?: string
}

export function VideoPlayer({
  episode,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode,
  hasPreviousEpisode,
  animeId,
  initialProgress = 0,
  nextEpisodeId
}: VideoPlayerProps) {
  const videoRef = useRef<ExtendedHTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)
  const [quality, setQuality] = useState('1080p')
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0)
  const [showAudioMenu, setShowAudioMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null)
  const [hasSeekedInitial, setHasSeekedInitial] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [hasPrefetchedNext, setHasPrefetchedNext] = useState(false)
  const [isAmbilightEnabled, setIsAmbilightEnabled] = useState(true)
  const [previewThumb, setPreviewThumb] = useState<{ x: number, time: number } | null>(null)
  const lastApiSyncRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { user } = useAuth()

  // Função para salvar progresso na API (Throttled)
  const saveProgressToAPI = useCallback(async (currTime: number, dur: number, force = false) => {
    if (!user || !episode.id || !animeId || dur <= 0) return

    const now = Date.now()
    // Somente envia se for forçado (pause/exit) ou se passaram 30 segundos
    if (!force && now - lastApiSyncRef.current < 30000) return

    const progressPercent = (currTime / dur) * 100
    try {
      await api.updateWatchHistory(animeId, episode.id, progressPercent)
      lastApiSyncRef.current = now
      console.log(`[Pulse Sync] Progresso sincronizado com servidor: ${Math.round(progressPercent)}%`)
    } catch (error) {
      console.error('Erro ao sincronizar com servidor:', error)
    }
  }, [user, episode.id, animeId])

  // Função para salvar no LocalStorage (Alta frequência)
  const saveProgressLocal = useCallback((currTime: number, dur: number) => {
    if (!episode.id || dur <= 0) return
    const progressPercent = (currTime / dur) * 100
    const storageKey = `pulse_progress_${episode.id}`
    localStorage.setItem(storageKey, JSON.stringify({
      progress: progressPercent,
      time: currTime,
      updatedAt: Date.now()
    }))
  }, [episode.id])

  // Salvar progresso periódico
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying && user && videoRef.current) {
      interval = setInterval(() => {
        if (videoRef.current) {
          const cTime = videoRef.current.currentTime
          const duration = videoRef.current.duration

          saveProgressLocal(cTime, duration)
          saveProgressToAPI(cTime, duration)
          setLastProgressUpdate(cTime)
        }
      }, 2000) // Verifica a cada 2 segundos localmente
    }
    return () => {
      if (interval) clearInterval(interval)
      // Tentar um save final ao desmontar se o vídeo estava tocando
      if (videoRef.current) {
        saveProgressToAPI(videoRef.current.currentTime, videoRef.current.duration, true)
      }
    }
  }, [isPlaying, user, saveProgressToAPI, saveProgressLocal])

  // Lógica de "Pular Intro" e "Auto-Play"
  useEffect(() => {
    if (currentTime > 40 && currentTime < 110) {
      setShowSkipIntro(true)
    } else {
      setShowSkipIntro(false)
    }

    if (duration > 0 && duration - currentTime < 15 && hasNextEpisode) {
      if (autoPlayCountdown === null) setAutoPlayCountdown(15)
      const secondsLeft = Math.floor(duration - currentTime)
      if (secondsLeft >= 0) setAutoPlayCountdown(secondsLeft)

      if (secondsLeft <= 1 && isPlaying) {
        onNextEpisode?.()
      }
    } else {
      setAutoPlayCountdown(null)
    }

    // Prefetching do próximo episódio aos 90%
    if (!hasPrefetchedNext && nextEpisodeId && duration > 0 && (currentTime / duration) > 0.9) {
      setHasPrefetchedNext(true)
      console.log(`[Pulse Performance] Prefetching iniciado para o próximo episódio: ${nextEpisodeId}`)
      const prefetchLink = document.createElement('link')
      prefetchLink.rel = 'prefetch'
      prefetchLink.as = 'video'
      prefetchLink.href = `/api/video/${nextEpisodeId}`
      document.head.appendChild(prefetchLink)
    }
  }, [currentTime, duration, hasNextEpisode, isPlaying, onNextEpisode, autoPlayCountdown, nextEpisodeId, hasPrefetchedNext])

  // Efeito Ambilight Premium
  useEffect(() => {
    if (!isAmbilightEnabled || !videoRef.current || !canvasRef.current || !isPlaying) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number

    const updateAmbilight = () => {
      if (video.paused || video.ended) return

      // Draw a small portion to the canvas for the blur effect
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      animationFrameId = requestAnimationFrame(updateAmbilight)
    }

    const startLoop = () => {
      animationFrameId = requestAnimationFrame(updateAmbilight)
    }

    video.addEventListener('play', startLoop)
    if (!video.paused) startLoop()

    return () => {
      video.removeEventListener('play', startLoop)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isAmbilightEnabled, isPlaying])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleActivity = () => {
      setShowControls(true)
      clearTimeout(timeout)
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }
    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleActivity)
      container.addEventListener('click', handleActivity)
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleActivity)
        container.removeEventListener('click', handleActivity)
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

  // Resetar busca inicial e prefetch ao trocar de episódio
  useEffect(() => {
    setHasSeekedInitial(false)
    setShowResumePrompt(false)
    setHasPrefetchedNext(false)
    setLoading(true)
  }, [episode.id])

  // Verificar progresso inicial quando o vídeo estiver pronto
  useEffect(() => {
    if (duration > 0 && initialProgress > 0 && !hasSeekedInitial) {
      console.log('Detectado progresso inicial:', initialProgress)
      setShowResumePrompt(true)
      const timer = setTimeout(() => setShowResumePrompt(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [duration, initialProgress, hasSeekedInitial])

  const handlePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        await videoRef.current.play().catch(e => console.error('Erro ao dar play:', e))
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
        // Salvar imediatamente ao pausar
        saveProgressToAPI(videoRef.current.currentTime, videoRef.current.duration, true)
      }
    }
  }

  const handleResume = () => {
    if (videoRef.current && duration > 0) {
      const seekTime = (initialProgress / 100) * duration
      videoRef.current.currentTime = seekTime
      setHasSeekedInitial(true)
      setShowResumePrompt(false)
      handlePlay()
      console.log(`Resumindo em ${initialProgress}% (${seekTime}s)`)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setLoading(false)
      const video = videoRef.current

      // Carregar áudios após um delay para garantir que o stream estabilizou
      setTimeout(() => {
        const tracks: AudioTrack[] = []
        if (video.audioTracks && video.audioTracks.length > 1) {
          for (let i = 0; i < video.audioTracks.length; i++) {
            tracks.push({
              id: i,
              label: video.audioTracks[i].label || (i === 0 ? 'Japonês (Original)' : `Áudio ${i + 1}`),
              language: video.audioTracks[i].language || 'unknown',
              enabled: video.audioTracks[i].enabled
            })
            if (video.audioTracks[i].enabled) setSelectedAudioTrack(i)
          }
        } else {
          tracks.push({ id: 0, label: 'Japonês (Original)', language: 'ja', enabled: true })
        }
        setAudioTracks(tracks)
      }, 1000)
    }
  }

  const skipIntro = () => {
    if (videoRef.current) videoRef.current.currentTime = 110
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) videoRef.current.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleAudioTrackChange = (trackId: number) => {
    if (videoRef.current?.audioTracks && videoRef.current.audioTracks.length > 1) {
      for (let i = 0; i < videoRef.current.audioTracks.length; i++) {
        videoRef.current.audioTracks[i].enabled = (i === trackId)
      }
    }
    setSelectedAudioTrack(trackId)
    setAudioTracks(prev => prev.map(track => ({ ...track, enabled: track.id === trackId })))
    setShowAudioMenu(false)
  }

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600)
    const m = Math.floor((time % 3600) / 60)
    const s = Math.floor(time % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-3xl overflow-hidden group shadow-2xl border border-white/5"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Ambilight Canvas Background */}
      {isAmbilightEnabled && (
        <canvas
          ref={canvasRef}
          width="32"
          height="18"
          className="absolute inset-0 w-full h-full opacity-30 blur-[100px] scale-110 pointer-events-none transition-opacity duration-1000 z-0"
        />
      )}
      <video
        ref={videoRef}
        className="relative w-full h-full cursor-none z-10"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onClick={handlePlay}
        playsInline
      >
        <source src={`/api/video/${episode.id}`} type="video/mp4" />
      </video>

      {/* Premium Overlays */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-start transition-all duration-500 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">Episódio {episode.episodeNumber}</span>
            <h3 className="text-white text-xl font-black tracking-tight drop-shadow-lg">{episode.title}</h3>
          </div>
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Pulse Unlimited • UHD Streaming</span>
        </div>

        <div className="flex gap-4">
          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); setShowAudioMenu(false); }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black transition-all pointer-events-auto"
            >
              <Cog6ToothIcon className="w-4 h-4 text-blue-500" />
              <span>{quality}</span>
            </button>
            {showQualityMenu && (
              <div className="absolute top-full right-0 mt-2 bg-gray-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl min-w-[160px] overflow-hidden shadow-2xl animate-fade-in pointer-events-auto">
                {['4K', '1080p', '720p', '480p'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-all hover:bg-white/5 ${quality === q ? 'text-blue-500 bg-blue-500/5' : 'text-white/60'}`}
                  >
                    {q} {q === '1080p' && <span className="text-[10px] opacity-40 ml-1">HD</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Selector */}
          {audioTracks.length > 1 && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowAudioMenu(!showAudioMenu); setShowQualityMenu(false); }}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-black transition-all pointer-events-auto"
              >
                <LanguageIcon className="w-4 h-4 text-blue-500" />
                <span>{audioTracks[selectedAudioTrack]?.label}</span>
              </button>
              {showAudioMenu && (
                <div className="absolute top-full right-0 mt-2 bg-gray-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl min-w-[200px] overflow-hidden shadow-2xl animate-fade-in pointer-events-auto">
                  {audioTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => handleAudioTrackChange(track.id)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold transition-all hover:bg-white/5 ${selectedAudioTrack === track.id ? 'text-blue-500 bg-blue-500/5' : 'text-white/60'}`}
                    >
                      {track.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Play Animation */}
      <div className={`absolute inset-0 flex items-center justify-center z-15 pointer-events-auto transition-all duration-500 bg-black/20 ${!isPlaying && !loading && !showResumePrompt ? 'scale-100 opacity-100' : 'scale-150 opacity-0 pointer-events-none'}`}>
        <button onClick={handlePlay} className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/20 rounded-full p-8 focus:outline-none pulse-primary">
          <PlayIcon className="w-12 h-12 text-white ml-2" />
        </button>
      </div>

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute bottom-32 left-8 z-30 bg-gray-950/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 animate-slide-up-soft flex items-center gap-3 pointer-events-auto"
        >
          PULAR INTRODUÇÃO
          <ChevronRightIcon className="w-4 h-4 text-blue-500" />
        </button>
      )}

      {/* Auto-Play Countdown */}
      {autoPlayCountdown !== null && (
        <div className="absolute bottom-32 right-8 z-30 bg-blue-600/90 backdrop-blur-xl text-white p-6 rounded-3xl border border-white/20 animate-slide-up-soft shadow-2xl flex flex-col items-center min-w-[180px]">
          <span className="text-[10px] font-black tracking-widest uppercase opacity-70 mb-2">Próximo Episódio</span>
          <div className="text-4xl font-black mb-4 font-mono">{autoPlayCountdown}s</div>
          <button
            onClick={() => onNextEpisode?.()}
            className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors pointer-events-auto"
          >
            ASSISTIR AGORA
          </button>
        </div>
      )}

      {/* Resume Playback Prompt (Premium Style) */}
      {showResumePrompt && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900/95 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-slide-up-soft flex flex-col items-center max-w-sm text-center pointer-events-auto">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-600/10">
            <PlayIcon className="w-10 h-10 text-blue-500 ml-1" />
          </div>
          <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Resume Play?</h4>
          <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">Detectamos progresso anterior ({Math.round(initialProgress)}%). Deseja retomar de onde parou ou recomeçar?</p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleResume}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20"
            >
              RETOMAR REPRODUÇÃO
            </button>
            <button
              onClick={() => { setShowResumePrompt(false); setHasSeekedInitial(true); }}
              className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all"
            >
              RECOMEÇAR DO ZERO
            </button>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-40 p-8 transition-all duration-500 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>

        {/* Progress Slider with Thumb Preview */}
        <div className="flex flex-col gap-4 mb-6 relative">
          {previewThumb && (
            <div
              className="absolute bottom-full mb-4 animate-fade-in pointer-events-none"
              style={{ left: `${previewThumb.x}%`, transform: 'translateX(-50%)' }}
            >
              <div className="relative group/thumb">
                <div className="absolute inset-0 bg-blue-600 blur-xl opacity-20 group-hover/thumb:opacity-40 transition-opacity" />
                <div className="relative bg-gray-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl w-48 h-28">
                  <Image
                    src={(episode.thumbnailUrl || episode.thumbnail)!}
                    alt="Preview"
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
                    <span className="text-[10px] font-black font-mono text-white tracking-widest">{formatTime(previewThumb.time)}</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-white/20 rotate-45" />
              </div>
            </div>
          )}

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const time = ((e.clientX - rect.left) / rect.width) * duration
              setPreviewThumb({ x, time })
            }}
            onMouseLeave={() => setPreviewThumb(null)}
            className="video-slider w-full h-1.5 pointer-events-auto"
            style={{ '--progress': `${(currentTime / (duration || 1)) * 100}%` } as any}
          />
          <div className="flex justify-between items-center text-[10px] font-black font-mono text-white/50 tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/80">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-8">
            <button onClick={handlePlay} className="text-white hover:text-blue-500 transition-all hover:scale-110 active:scale-90">
              {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 ml-1" />}
            </button>

            <div className="flex items-center gap-4">
              {hasPreviousEpisode && <button onClick={onPreviousEpisode} className="text-white/60 hover:text-white transition-all"><BackwardIcon className="w-6 h-6" /></button>}
              {hasNextEpisode && <button onClick={onNextEpisode} className="text-white/60 hover:text-white transition-all"><ForwardIcon className="w-6 h-6" /></button>}
            </div>

            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white">
                {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-5 h-5 text-red-500" /> : <SpeakerWaveIcon className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="video-slider w-16"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleFullscreen}
              className="text-white/60 hover:text-white transition-all hover:scale-110"
            >
              {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6" /> : <ArrowsPointingOutIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {loading && !showResumePrompt && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-blue-500 tracking-tighter">PULSE</div>
          </div>
        </div>
      )}
    </div>
  )
}