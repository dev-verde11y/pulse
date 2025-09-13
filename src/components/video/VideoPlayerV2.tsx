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
  Cog6ToothIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Tipos para trilhas de áudio nativas do HTML5
interface AudioTrackAPI {
  id: string
  label: string
  language: string
  enabled: boolean
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

  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)
  
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

      // Configurar legendas apenas se fornecidas externamente
      // Para evitar 404s desnecessários, não carregar legendas automáticas por padrão
      console.log('🎵 Legendas disponíveis:', subtitles.length)
    }
  }

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

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
    }
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
          skipTime(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipTime(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(prev => Math.min(1, prev + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(prev => Math.max(0, prev - 0.1))
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
  }, [currentTime, duration])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const videoSrc = `/api/video/${episode.id}`

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
      >
        <source src={videoSrc} type="video/mp4" />
        
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
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 bg-blue-600/80 text-white text-xs rounded font-bold backdrop-blur-sm">
          V2 HYBRID
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

            <div className="flex items-center space-x-4">
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

              {/* Subtitle Selector */}
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
                        Legendas
                      </div>
                      <button
                        onClick={() => handleSubtitleChange('none')}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedSubtitle === 'none'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        Desativado
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
                        <div>💬 Legendas: {subtitleTracks.length}</div>
                        <div>📺 Resolução: Auto</div>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <span className="text-xs text-blue-400">VideoPlayer V2 Hybrid</span>
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