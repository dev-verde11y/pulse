'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BackwardIcon,
  ForwardIcon,
  LanguageIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  RectangleStackIcon,
  ComputerDesktopIcon,
  TvIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Hls from 'hls.js'

// Tipos para trilhas de áudio nativas do HTML5
interface AudioTrackAPI {
  id: string
  label: string
  language: string
  enabled: boolean
}

// Global Chrome types
declare global {
  interface Window {
    chrome: any
  }
}

interface AudioTrackList extends EventTarget {
  readonly length: number
  [index: number]: AudioTrackAPI
  addEventListener(type: 'change', listener: (event: Event) => void): void
  removeEventListener(type: 'change', listener: (event: Event) => void): void
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

interface SubtitleTrack {
  id: string
  label: string
  language: string
  src: string
  enabled: boolean
}

interface VideoPlayerV2Props {
  episode: Episode
  onNextEpisode?: () => void
  onPreviousEpisode?: () => void
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
  animeId: string
  // Arquivos de legenda externos (opcional)
  subtitles?: SubtitleTrack[]
}

// Configurações de qualidade
interface QualityLevel {
  height: number
  bitrate: number
  label: string
  url?: string
}

// Playback speeds
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoPlayerV2({ 
  episode, 
  onNextEpisode, 
  onPreviousEpisode, 
  hasNextEpisode, 
  hasPreviousEpisode,
  animeId,
  subtitles = []
}: VideoPlayerV2Props) {
  const videoRef = useRef<ExtendedHTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)

  // Estados para controles avançados
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0)
  const [showAudioMenu, setShowAudioMenu] = useState(false)

  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>(subtitles)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('none')
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  // Estados para streaming avançado
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [selectedQuality, setSelectedQuality] = useState<number>(-1) // -1 = auto
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [isHlsSupported, setIsHlsSupported] = useState(false)
  const [skipDuration, setSkipDuration] = useState<number>(10)
  const [showSkipMenu, setShowSkipMenu] = useState(false)
  const [isCastSupported, setIsCastSupported] = useState(false)

  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)
  const hlsRef = useRef<Hls | null>(null)
  
  const { user } = useAuth()

  // Função para salvar progresso
  const saveProgress = async (currentTime: number, duration: number, forceComplete = false) => {
    if (!user || !episode.id || !animeId) return
    
    const progressPercent = (currentTime / duration) * 100
    const isCompleted = forceComplete || progressPercent >= 90
    
    try {
      await api.updateWatchHistory(
        animeId,
        episode.id, 
        progressPercent
      )
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
    }
  }

  // Auto-save progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isPlaying && user && videoRef.current) {
      const checkAndStart = () => {
        if (videoRef.current && videoRef.current.duration > 0 && videoRef.current.currentTime >= 0) {
          interval = setInterval(() => {
            if (videoRef.current) {
              const currentVideoTime = videoRef.current.currentTime
              const videoDuration = videoRef.current.duration
              saveProgress(currentVideoTime, videoDuration)
              setLastProgressUpdate(currentVideoTime)
            }
          }, 10000)
        }
      }
      
      setTimeout(checkAndStart, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying, user])

  // Save on pause/completion
  useEffect(() => {
    if (!isPlaying && currentTime > 0 && duration > 0 && user) {
      if (Math.abs(currentTime - lastProgressUpdate) >= 5) {
        saveProgress(currentTime, duration)
        setLastProgressUpdate(currentTime)
      }
    }
  }, [isPlaying, currentTime, duration, lastProgressUpdate, user])

  useEffect(() => {
    if (duration > 0 && currentTime > 0 && user) {
      const progressPercent = (currentTime / duration) * 100
      if (progressPercent >= 90) {
        saveProgress(currentTime, duration, true)
      }
    }
  }, [currentTime, duration, user])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }

    const handleMouseLeave = () => {
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 1000)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowAudioMenu(false)
        setShowSubtitleMenu(false)
        setShowSettingsMenu(false)
        setShowQualityMenu(false)
        setShowSpeedMenu(false)
        setShowSkipMenu(false)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      document.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(timeout)
    }
  }, [isPlaying])

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Initialize HLS and advanced features
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check HLS support
      setIsHlsSupported(Hls.isSupported())

      // Check Picture-in-Picture support
      setIsPictureInPicture(document.pictureInPictureEnabled || false)

      // Check Chromecast support
      setIsCastSupported(!!window.chrome && !!window.chrome.cast)
    }
  }, [])


  // Initialize video with HLS or fallback
  const initializeVideo = (videoSrc: string) => {
    const video = videoRef.current
    if (!video) return

    console.log('🎬 Inicializando vídeo:', videoSrc)

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Set video source directly - let the browser handle redirects
    console.log('📹 Configurando source direto no elemento video')
    video.src = videoSrc

    // Force load
    video.load()

    console.log('📹 Video.src configurado:', video.src)
    console.log('📹 Video canPlayType mp4:', video.canPlayType('video/mp4'))

    // Add event listeners for better debugging
    video.addEventListener('error', (e) => {
      console.error('❌ Erro no elemento de vídeo:', e)
      console.error('❌ Tipo do erro:', e.type)
      console.error('❌ Target:', e.target)

      if (video.error) {
        console.error('❌ Video.error code:', video.error.code)
        console.error('❌ Video.error message:', video.error.message)

        // Traduzir códigos de erro
        const errorMessages = {
          1: 'MEDIA_ERR_ABORTED - Download foi abortado',
          2: 'MEDIA_ERR_NETWORK - Erro de rede durante download',
          3: 'MEDIA_ERR_DECODE - Erro ao decodificar o vídeo',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato não suportado ou fonte inválida'
        }

        console.error('❌ Erro traduzido:', errorMessages[video.error.code as keyof typeof errorMessages] || 'Erro desconhecido')
      } else {
        console.error('❌ Nenhum erro específico do vídeo disponível')
      }

      console.error('❌ Video src atual:', video.src)
      console.error('❌ Video currentSrc:', video.currentSrc)
      console.error('❌ Video readyState:', video.readyState)
      console.error('❌ Video networkState:', video.networkState)

      setLoading(false)
    })

    video.addEventListener('loadstart', () => {
      console.log('▶️ Iniciando carregamento do vídeo')
      setLoading(true)
    })

    video.addEventListener('loadedmetadata', () => {
      console.log('📊 Metadados carregados')
    })

    video.addEventListener('canplay', () => {
      console.log('✅ Vídeo pronto para reprodução')
      setLoading(false)
    })

    video.addEventListener('canplaythrough', () => {
      console.log('🚀 Vídeo completamente carregado')
    })

    // Setup mock quality levels for now
    setQualityLevels([
      {height: 0, bitrate: 0, label: 'Auto'},
      {height: 1080, bitrate: 8000, label: '1080p (8M)'},
      {height: 720, bitrate: 4000, label: '720p (4M)'},
      {height: 480, bitrate: 2000, label: '480p (2M)'},
      {height: 360, bitrate: 1000, label: '360p (1M)'}
    ])
    setSelectedQuality(0) // Auto by default

    // HLS logic for when streams are available:
    /*
    if (Hls.isSupported() && videoSrc.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hlsRef.current = hls
      hls.loadSource(videoSrc)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('🎬 HLS manifest loaded')
        const levels = hls.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          label: `${level.height}p (${Math.round(level.bitrate / 1000)}k)`
        }))
        setQualityLevels([{height: 0, bitrate: 0, label: 'Auto'}, ...levels])
        setSelectedQuality(-1)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('🚨 HLS Error:', data)
        if (data.fatal) {
          video.src = videoSrc.replace('.m3u8', '.mp4')
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc
    } else {
      video.src = videoSrc
    }
    */
  }

  // Detectar trilhas de áudio disponíveis
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setLoading(false)

      const video = videoRef.current

      // Aguardar carregamento das trilhas de áudio
      setTimeout(() => {
        const tracks: AudioTrack[] = []

        if (video.audioTracks && video.audioTracks.length > 0) {
          for (let i = 0; i < video.audioTracks.length; i++) {
            const track = video.audioTracks[i]

            // Detectar idioma baseado no label ou usar padrão
            let label = track.label || `Trilha ${i + 1}`
            let language = track.language || 'unknown'

            // Mapeamento comum de idiomas
            if (label.toLowerCase().includes('japanese') || label.toLowerCase().includes('jpn') || language === 'ja') {
              label = '🇯🇵 Japonês (Original)'
              language = 'ja'
            } else if (label.toLowerCase().includes('portuguese') || label.toLowerCase().includes('por') || language === 'pt') {
              label = '🇧🇷 Português (Dublado)'
              language = 'pt-BR'
            } else if (label.toLowerCase().includes('english') || label.toLowerCase().includes('eng') || language === 'en') {
              label = '🇺🇸 Inglês (Dublado)'
              language = 'en'
            }

            tracks.push({
              id: i,
              label,
              language,
              enabled: track.enabled
            })

            if (track.enabled) {
              setSelectedAudioTrack(i)
            }
          }

          // Listener para mudanças de trilha
          video.audioTracks.addEventListener('change', () => {
            for (let i = 0; i < video.audioTracks!.length; i++) {
              if (video.audioTracks![i].enabled) {
                setSelectedAudioTrack(i)
                break
              }
            }
          })
        } else {
          // Trilha única/padrão
          tracks.push({
            id: 0,
            label: '🇯🇵 Japonês (Original)',
            language: 'ja',
            enabled: true
          })
        }

        setAudioTracks(tracks)
        console.log('🎵 Trilhas de áudio detectadas:', tracks)
      }, 1000)

      // Quality levels are now set in initializeVideo

      console.log('🎵 Legendas fornecidas:', subtitles.length)
      console.log('📹 Vídeo provavelmente tem legendas embutidas (nenhuma externa necessária)')
    }
  }

  // Simplified subtitle handling - only use provided external subtitles
  const setupSubtitles = () => {
    console.log('📝 Configurando legendas fornecidas:', subtitles.length)
    setSubtitleTracks(subtitles)
  }

  // Get secure video URL
  const getSecureVideoUrl = async (episodeId: string, quality: string = '1080p'): Promise<string> => {
    try {
      console.log('🔐 Solicitando token seguro para:', episodeId, quality)

      const response = await fetch(`/api/video/${episodeId}/token?quality=${quality}`, {
        method: 'GET',
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Token obtido, válido por:', data.expiresInMinutes, 'minutos')

      return data.videoUrl

    } catch (error) {
      console.error('❌ Erro ao obter URL segura:', error)
      // Fallback para URL direta (menos segura)
      return `/api/video/${episodeId}`
    }
  }

  // Initialize video on mount
  useEffect(() => {
    if (episode.id) {
      // 🔐 Usar URL segura com token temporário
      getSecureVideoUrl(episode.id)
        .then(secureUrl => {
          console.log('🎬 Usando URL segura:', secureUrl.substring(0, 50) + '...')
          initializeVideo(secureUrl)
        })
        .catch(() => {
          // Fallback para método anterior
          console.log('⚠️ Fallback para URL direta')
          initializeVideo(`/api/video/${episode.id}`)
        })

      setupSubtitles() // Only setup provided external subtitles
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [episode.id, isHlsSupported, subtitles])

  // Trocar trilha de áudio
  const handleAudioTrackChange = (trackId: number) => {
    if (videoRef.current && videoRef.current.audioTracks && videoRef.current.audioTracks.length > 1) {
      // Desabilitar todas as trilhas
      for (let i = 0; i < videoRef.current.audioTracks.length; i++) {
        videoRef.current.audioTracks[i].enabled = false
      }
      
      // Habilitar trilha selecionada
      if (trackId >= 0 && trackId < videoRef.current.audioTracks.length) {
        videoRef.current.audioTracks[trackId].enabled = true
      }
      
      console.log(`🎵 Trocando para trilha de áudio ${trackId}:`, audioTracks[trackId]?.label)
    }
    
    setSelectedAudioTrack(trackId)
    setAudioTracks(prev => prev.map(track => ({
      ...track,
      enabled: track.id === trackId
    })))
    setShowAudioMenu(false)
  }

  // Trocar legenda
  const handleSubtitleChange = (subtitleId: string) => {
    if (videoRef.current) {
      const textTracks = videoRef.current.textTracks
      
      // Desabilitar todas as legendas
      for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = 'disabled'
      }
      
      if (subtitleId !== 'none') {
        // Encontrar e habilitar a legenda selecionada
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i]
          if (track.label && track.label.includes(subtitleId)) {
            track.mode = 'showing'
            console.log(`💬 Habilitando legenda:`, track.label)
            break
          }
        }
      }
    }
    
    setSelectedSubtitle(subtitleId)
    setSubtitleTracks(prev => prev.map(track => ({
      ...track,
      enabled: track.id === subtitleId
    })))
    setShowSubtitleMenu(false)
  }

  const handleProgressClick = (e: React.MouseEvent) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      videoRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
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

  const skipTime = (seconds: number = skipDuration) => {
    if (videoRef.current) {
      const oldTime = videoRef.current.currentTime
      const newTime = Math.max(0, Math.min(duration, oldTime + seconds))
      videoRef.current.currentTime = newTime
      console.log(`⏭️ Skip: ${seconds}s | ${oldTime.toFixed(1)}s → ${newTime.toFixed(1)}s`)
    }
  }

  // Quality change handler
  const handleQualityChange = (qualityIndex: number) => {
    console.log(`📺 Mudando qualidade: ${qualityLevels[selectedQuality]?.label || 'N/A'} → ${qualityLevels[qualityIndex]?.label || 'N/A'}`)

    if (hlsRef.current) {
      if (qualityIndex === 0) {
        hlsRef.current.currentLevel = -1 // Auto
        console.log('📺 HLS: Configurado para Auto')
      } else {
        hlsRef.current.currentLevel = qualityIndex - 1 // Adjust for 'Auto' option
        console.log(`📺 HLS: Configurado para nível ${qualityIndex - 1}`)
      }
    } else {
      console.log('📺 HLS não disponível - mudança de qualidade é apenas visual')
      // Para vídeos MP4 normais, a mudança é apenas visual por enquanto
      // No futuro, aqui seria feita a troca da URL do vídeo para uma qualidade diferente
    }

    setSelectedQuality(qualityIndex)
    setShowQualityMenu(false)
  }

  // Speed change handler
  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
  }

  // Picture-in-Picture toggle
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPictureInPicture(false)
      } else {
        await videoRef.current.requestPictureInPicture()
        setIsPictureInPicture(true)
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error)
    }
  }

  // Chromecast handler
  const handleChromecast = () => {
    if (window.chrome && window.chrome.cast) {
      console.log('🖥️ Iniciando Chromecast...')
      // Implementation would go here
    }
  }

  // Custom skip duration handler
  const handleSkipDurationChange = (newDuration: number) => {
    console.log(`⏱️ Mudando duração do pulo: ${skipDuration}s → ${newDuration}s`)
    setSkipDuration(newDuration)
    setShowSkipMenu(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          handlePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skipTime(-skipDuration)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipTime(skipDuration)
          break
        case 'KeyJ':
          e.preventDefault()
          skipTime(-skipDuration)
          break
        case 'KeyL':
          e.preventDefault()
          skipTime(skipDuration)
          break
        case 'KeyK':
          e.preventDefault()
          handlePlay()
          break
        case 'KeyI':
          e.preventDefault()
          togglePictureInPicture()
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(prev => {
            const newVolume = Math.min(1, prev + 0.1)
            if (videoRef.current) {
              videoRef.current.volume = newVolume
            }
            return newVolume
          })
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(prev => {
            const newVolume = Math.max(0, prev - 0.1)
            if (videoRef.current) {
              videoRef.current.volume = newVolume
            }
            return newVolume
          })
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, duration, skipDuration])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onClick={handlePlay}
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
        playsInline
        muted={false}
      >
        {/* Legendas Externas */}
        {subtitleTracks.map((subtitle) => (
          <track
            key={subtitle.id}
            kind="subtitles"
            src={subtitle.src}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.id === 'pt-br'}
          />
        ))}

        Seu navegador não suporta o elemento de vídeo.
      </video>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Version Badge */}
      <div className="absolute top-4 right-4 flex gap-2">
        <span className="px-2 py-1 bg-blue-600/80 text-white text-xs rounded font-bold backdrop-blur-sm">
          V2 PRO
        </span>
      </div>

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent" />
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />

        {/* Episode Title */}
        <div className="absolute top-4 left-4 right-20">
          <h3 className="text-white text-lg font-bold truncate">
            {episode.title}
          </h3>
          <p className="text-gray-300 text-sm">
            Episódio {episode.episodeNumber}
          </p>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
            >
              <PlayIcon className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-600 rounded-full relative group-hover:h-2 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={handlePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* Previous/Next Episodes */}
              {hasPreviousEpisode && (
                <button
                  onClick={onPreviousEpisode}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>
              )}

              {hasNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <ForwardIcon className="w-5 h-5" />
                </button>
              )}

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  {/* <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center space-x-1 text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                  >
                    <RectangleStackIcon className="w-4 h-4" />
                    <span>{selectedQuality === -1 || selectedQuality === 0 ? 'Auto' : qualityLevels[selectedQuality]?.label}</span>
                  </button> */}

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-32 z-50">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">
                          Qualidade
                        </div>
                        {qualityLevels.map((quality, index) => (
                          <button
                            key={index}
                            onClick={() => handleQualityChange(index)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedQuality === index
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            {quality.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center space-x-1 text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-20 z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">
                        Velocidade
                      </div>
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            playbackSpeed === speed
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skip Duration Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSkipMenu(!showSkipMenu)}
                  className="flex items-center space-x-1 text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                >
                  <span>{skipDuration}s</span>
                </button>

                {showSkipMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-20 z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">
                        Pulo
                      </div>
                      {[5, 10, 15, 30, 60].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => handleSkipDurationChange(duration)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            skipDuration === duration
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {duration}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePictureInPicture}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Picture-in-Picture (I)"
                >
                  <ComputerDesktopIcon className="w-5 h-5" />
                </button>
              )}

              {/* Chromecast */}
              {isCastSupported && (
                <button
                  onClick={handleChromecast}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Transmitir para TV"
                >
                  <TvIcon className="w-5 h-5" />
                </button>
              )}

              {/* Audio Track Selector */}
              {audioTracks.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowAudioMenu(!showAudioMenu)}
                    className="flex items-center space-x-1 text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                  >
                    <LanguageIcon className="w-4 h-4" />
                    <span>Áudio</span>
                  </button>
                  
                  {showAudioMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-48 z-50">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">
                          Trilha de Áudio
                        </div>
                        {audioTracks.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => handleAudioTrackChange(track.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedAudioTrack === track.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{track.label}</span>
                              <span className="text-xs text-gray-400 uppercase">
                                {track.language}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subtitle Selector - Only show if external subtitles provided */}
              {subtitleTracks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                    className="flex items-center space-x-1 text-white hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    <span>CC</span>
                  </button>

                  {showSubtitleMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-48 z-50">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-2">
                          Legendas Externas
                        </div>
                        <button
                          onClick={() => handleSubtitleChange('none')}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedSubtitle === 'none'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          Usar Legendas Embutidas
                        </button>
                        {subtitleTracks.map((subtitle) => (
                          <button
                            key={subtitle.id}
                            onClick={() => handleSubtitleChange(subtitle.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedSubtitle === subtitle.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{subtitle.label}</span>
                              <span className="text-xs text-gray-400 uppercase">
                                {subtitle.language}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </button>
                
                {showSettingsMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl min-w-48 z-50">
                    <div className="p-3">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Configurações
                      </div>
                      <div className="text-sm text-gray-300 space-y-2">
                        <div>🎵 Trilhas de áudio: {audioTracks.length}</div>
                        <div>💬 Legendas externas: {subtitleTracks.length}</div>
                        <div>📽️ Legendas embutidas: ✅</div>
                        <div>📺 Qualidade: {selectedQuality === -1 || selectedQuality === 0 ? 'Auto' : qualityLevels[selectedQuality]?.label || 'N/A'}</div>
                        <div>⏱️ Velocidade: {playbackSpeed}x</div>
                        <div>⏭️ Pulo: {skipDuration}s</div>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <div className="text-xs text-blue-400">VideoPlayer V2 Pro</div>
                          <div className="text-xs text-green-400">Streaming Otimizado</div>
                          {document.pictureInPictureEnabled && <div className="text-xs text-purple-400">Picture-in-Picture</div>}
                          {isCastSupported && <div className="text-xs text-orange-400">Chromecast Ready</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}