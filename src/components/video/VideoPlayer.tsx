'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Hls from 'hls.js'
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
  ChevronRightIcon,
  ChatBubbleBottomCenterTextIcon,
  Square2StackIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface VideoPlayerProps {
  episode: Episode
  onNextEpisode?: () => void
  onPreviousEpisode?: () => void
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
  animeId: string
  initialProgress?: number
  subtitleTrackUrl?: string
  externalSubtitles?: {
    id: string
    languageCode: string
    label: string
    url: string
  }[]

  // Watch Party Props
  onPlayCallback?: () => void
  onPauseCallback?: () => void
  onSeekCallback?: (time: number) => void
  externalTime?: number
  externalAudioTracks?: {
    id: string
    languageCode: string
    label: string
  }[]
  externalIsPlaying?: boolean
  isWatchParty?: boolean
}

export function VideoPlayer({
  episode,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode,
  hasPreviousEpisode,
  animeId,
  initialProgress = 0,
  subtitleTrackUrl,
  externalSubtitles = [],
  externalAudioTracks = [],
  onPlayCallback,
  onPauseCallback,
  onSeekCallback,
  externalTime,
  externalIsPlaying,
  isWatchParty = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    console.log('🎬 [VideoPlayer] Mounted. Props:', { episodeId: episode.id, subtitleTrackUrl })
  }, [episode.id, subtitleTrackUrl])

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)

  // HLS Specific State
  const [qualities, setQualities] = useState<{ height: number, level: number }[]>([])
  const [currentQuality, setCurrentQuality] = useState<number>(-1) // -1 = Auto
  const [audioTracks, setAudioTracks] = useState<{ id: number, name: string }[]>([])
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0)
  const [subtitles, setSubtitles] = useState<{ id: number, lang: string, label: string }[]>([])
  const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1) // -1 = Off

  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showAudioMenu, setShowAudioMenu] = useState(false)
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)

  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null)
  const [hasSeekedInitial, setHasSeekedInitial] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [isAmbilightEnabled] = useState(true)
  const lastApiSyncRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls logic
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowQualityMenu(false)
        setShowAudioMenu(false)
        setShowSubtitleMenu(false)
      }, 3000)
    }
  }, [isPlaying])

  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [isPlaying, resetControlsTimer])

  // Custom Subtitle State
  const [customSubtitleText, setCustomSubtitleText] = useState('')
  const [selectedExternalSubtitle, setSelectedExternalSubtitle] = useState<string | null>(null)
  const parsedCuesRef = useRef<{ start: number, end: number, text: string }[]>([])

  // Initialize selected subtitle
  useEffect(() => {
    if (externalSubtitles.length > 0 && !selectedExternalSubtitle) {
      // Default to PT-BR if available, otherwise first one
      const por = externalSubtitles.find(s => s.languageCode.toLowerCase().includes('por') || s.languageCode.toLowerCase().includes('pt'))
      setSelectedExternalSubtitle(por ? por.id : externalSubtitles[0].id)
    }
  }, [externalSubtitles, selectedExternalSubtitle])

  const { user } = useAuth()

  // Initialize Player Strategy (HLS vs native)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Clean up HLS
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Determine Source
    // Priority: 1. videoUrl (.m3u8) -> HLS
    //           2. r2Key (+ .m3u8 check?) -> Legacy HLS via API? or just failover
    //           3. videoUrl (.mp4) -> Native
    //           4. Legacy API -> Native

    // Logic:
    let src = ''
    let isHLS = false

    if (episode.videoUrl && episode.videoUrl.includes('.m3u8')) {
      src = episode.videoUrl
      isHLS = true
    } else if (episode.r2Key) {
      // Legacy R2 Key usually means standard MP4 via API proxy?
      // Or if we implemented HLS backend proxy...
      // For migration, we assume r2Key = legacy MP4 unless explicitly HLS
      src = `/api/video/${episode.id}` // Legacy MP4 Proxy
      isHLS = false
    } else if (episode.videoUrl) {
      // Direct video Url (likely MP4)
      src = episode.videoUrl
      isHLS = false
    }

    console.log(`[Pulse Player] Initializing. Source: ${src} | Mode: ${isHLS ? 'HLS' : 'Native'}`)

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        debug: false
      })
      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setDuration(video.duration)
        setLoading(false)
        console.log('HLS Manifest Loaded', data)

        // Get Qualities
        const levels = data.levels.map((level, index) => ({
          height: level.height,
          level: index
        }))
        setQualities(levels)

        // Get Audio Tracks
        if (hls.audioTracks && hls.audioTracks.length > 0) {
          setAudioTracks(hls.audioTracks.map((t, i) => {
            // Find matching external label by language or index
            const external = externalAudioTracks.find(ea =>
              ea.languageCode.toLowerCase() === t.lang?.toLowerCase()
            )
            return {
              id: i,
              name: external ? external.label : (t.name || `Audio ${i + 1}`)
            }
          }))
          setCurrentAudioTrack(hls.audioTrack)
        }

        // Get Subtitles
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          setSubtitles(hls.subtitleTracks.map((t, i) => ({ id: i, lang: t.lang || 'und', label: t.name })))
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level]
        console.log(`Quality switched to: ${level?.height}p`)
      })

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
        console.log(`Audio switched to: ${data.id}`)
        setCurrentAudioTrack(data.id)
      })


      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
        if (data.id !== -1) console.log(`Subtitle switched to: ${data.id}`)
        setCurrentSubtitle(data.id)
      })


      let recoverDecodingErrorDate = 0
      let recoverSwapAudioCodecDate = 0

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('[VideoPlayer] Fatal network error encountered, trying to recover:', data)
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('[VideoPlayer] Fatal media error encountered, trying to recover:', data)
              const now = Date.now()
              if (!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
                recoverDecodingErrorDate = Date.now()
                hls.recoverMediaError()
              } else if (!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
                recoverSwapAudioCodecDate = Date.now()
                hls.swapAudioCodec()
                hls.recoverMediaError()
              } else {
                console.error('[VideoPlayer] Fatal media error, recovery failed:', data)
                hls.destroy()
              }
              break
            default:
              console.error('[VideoPlayer] Fatal error, cannot recover:', data)
              hls.destroy()
              break
          }
        }
      })

    } else {
      // Native Player (MP4 or Safari HLS)
      video.src = src
      video.load() // Important for native reload

      // Is it native HLS?
      if (video.canPlayType('application/vnd.apple.mpegurl') && (isHLS || src.includes('.m3u8'))) {
        // Native HLS (Safari)
        // We can't access levels/tracks easily here
        // But verified playback works
      }
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy()
    }

  }, [episode.id, episode.videoUrl, episode.r2Key])

  // Manual VTT Parsing and Injection
  useEffect(() => {
    // If we have external subtitles but none selected yet, wait for initialization
    if (externalSubtitles.length > 0 && !selectedExternalSubtitle) {
      return
    }

    let subtitleUrl = externalSubtitles.find(s => s.id === selectedExternalSubtitle)?.url || subtitleTrackUrl

    if (!subtitleUrl) {
      parsedCuesRef.current = []
      setCustomSubtitleText('')
      return
    }

    // Normalize URL: remove potential double slashes (except after protocol)
    subtitleUrl = subtitleUrl.replace(/([^:]\/)\/+/g, '$1')

    const fetchAndParseSubtitle = async () => {
      try {
        console.log('📝 [VideoPlayer] Fetching subtitle:', subtitleUrl)
        const response = await fetch(subtitleUrl)
        if (!response.ok) {
          console.warn(`⚠️ [VideoPlayer] Subtitle 404 or Error: ${response.statusText} at ${subtitleUrl}`)
          return
        }
        const text = await response.text()

        // Simple VTT Parser
        const lines = text.split(/\r?\n/)
        let currentStart = 0
        let currentEnd = 0
        let currentText = ''
        let state = 0

        const timeToSeconds = (timeStr: string) => {
          const parts = timeStr.split(':')
          let seconds = 0
          if (parts.length === 3) {
            seconds += parseInt(parts[0]) * 3600
            seconds += parseInt(parts[1]) * 60
            seconds += parseFloat(parts[2].replace(',', '.'))
          } else if (parts.length === 2) {
            seconds += parseInt(parts[0]) * 60
            seconds += parseFloat(parts[1].replace(',', '.'))
          }
          return seconds
        }

        const timeRegex = /((?:\d{2}:)?\d{2}:\d{2}[\.,]\d{3})\s-->\s((?:\d{2}:)?\d{2}:\d{2}[\.,]\d{3})/
        const newCues: { start: number, end: number, text: string }[] = []

        for (let line of lines) {
          line = line.trim()
          if (!line || line === 'WEBVTT') continue

          const timeMatch = line.match(timeRegex)
          if (timeMatch) {
            if (state === 1 && currentText) {
              newCues.push({ start: currentStart, end: currentEnd, text: currentText.trim() })
              currentText = ''
            }
            currentStart = timeToSeconds(timeMatch[1])
            currentEnd = timeToSeconds(timeMatch[2])
            state = 1
          } else if (state === 1) {
            if (line === '') {
              newCues.push({ start: currentStart, end: currentEnd, text: currentText.trim() })
              currentText = ''
              state = 0
            } else {
              currentText += (currentText ? '\n' : '') + line
            }
          }
        }
        if (state === 1 && currentText) {
          newCues.push({ start: currentStart, end: currentEnd, text: currentText.trim() })
        }

        parsedCuesRef.current = newCues
        console.log(`✅ [VideoPlayer] Loaded ${newCues.length} cues.`)

        // Update internal subtitles state for the menu if needed
        if (externalSubtitles.length > 0) {
          setSubtitles(externalSubtitles.map((s, i) => ({ id: i, lang: s.languageCode, label: s.label })))
          const selectedIdx = externalSubtitles.findIndex(s => s.id === selectedExternalSubtitle)
          setCurrentSubtitle(selectedIdx)
        }

      } catch (error) {
        console.error('❌ [Player] VTT Parsing Error:', error)
      }
    }

    fetchAndParseSubtitle()
  }, [subtitleTrackUrl, externalSubtitles, selectedExternalSubtitle]) // Run when URL changes

  // Sync Logic (HLS)
  const changeAudioTrack = (trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId
      setCurrentAudioTrack(trackId)
      setShowAudioMenu(false)
    }
  }

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex
      setCurrentQuality(levelIndex)
      setShowQualityMenu(false)
    }
  }

  const changeSubtitle = (trackId: number) => {
    if (externalSubtitles.length > 0) {
      if (trackId === -1) {
        setSelectedExternalSubtitle(null)
      } else {
        setSelectedExternalSubtitle(externalSubtitles[trackId].id)
      }
      setCurrentSubtitle(trackId)
      setShowSubtitleMenu(false)
      return
    }

    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId
      setCurrentSubtitle(trackId)
      setShowSubtitleMenu(false)
    }
  }

  const saveProgressToAPI = useCallback(async (currTime: number, dur: number, force = false) => {
    if (!user || !episode.id || !animeId || dur <= 0) return
    const now = Date.now()
    if (!force && now - lastApiSyncRef.current < 30000) return
    const progressPercent = (currTime / dur) * 100
    try {
      await api.updateWatchHistory(animeId, episode.id, progressPercent)
      lastApiSyncRef.current = now
    } catch (error) { console.error(error) }
  }, [user, episode.id, animeId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const video = videoRef.current
        // For HLS, duration might be Infinity initially or 0, check logic
        const dur = video.duration || duration
        if (dur > 0) saveProgressToAPI(video.currentTime, dur)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [isPlaying, saveProgressToAPI, duration])

  // ... Ambilight ...
  useEffect(() => {
    if (!isAmbilightEnabled || !videoRef.current || !canvasRef.current || !isPlaying) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number

    const updateAmbilight = () => {
      if (video.paused || video.ended) return
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

  // Initial Progress Resume Logic (Restored)
  const handleResume = () => {
    if (videoRef.current && duration > 0) {
      const seekTime = (initialProgress / 100) * duration
      videoRef.current.currentTime = seekTime
      setHasSeekedInitial(true)
      setShowResumePrompt(false)
      handlePlay()
    }
  }

  // Watch Party Sync
  useEffect(() => {
    if (!isWatchParty || !videoRef.current) return

    if (externalIsPlaying !== undefined) {
      if (externalIsPlaying && !isPlaying) {
        videoRef.current.play().catch(() => { })
        setIsPlaying(true)
      } else if (!externalIsPlaying && isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }

    if (externalTime !== undefined && Math.abs(currentTime - externalTime) > 2) {
      videoRef.current.currentTime = externalTime
      setCurrentTime(externalTime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalIsPlaying, externalTime, isWatchParty])

  const handlePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        try {
          await videoRef.current.play()
          if (isWatchParty) onPlayCallback?.()
        } catch (error: unknown) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Playback error:', error)
          }
        }
      } else {
        videoRef.current.pause()
        if (isWatchParty) onPauseCallback?.()
        saveProgressToAPI(videoRef.current.currentTime, videoRef.current.duration, true)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      if (!duration && videoRef.current.duration) setDuration(videoRef.current.duration)

      // Custom Subtitle Logic
      if (currentSubtitle !== -1 && parsedCuesRef.current.length > 0) {
        // Find visible cue
        const activeCue = parsedCuesRef.current.find(cue => time >= cue.start && time <= cue.end)
        setCustomSubtitleText(activeCue ? activeCue.text : '')
      } else {
        setCustomSubtitleText('')
      }

      // Skip Intro Logic
      if (videoRef.current.currentTime > 40 && videoRef.current.currentTime < 110) setShowSkipIntro(true)
      else setShowSkipIntro(false)

      // Autoplay Logic
      const timeLeft = videoRef.current.duration - videoRef.current.currentTime
      if (hasNextEpisode && timeLeft < 15) {
        if (autoPlayCountdown === null) setAutoPlayCountdown(15)
        setAutoPlayCountdown(Math.floor(timeLeft))
        if (timeLeft <= 1 && isPlaying) onNextEpisode?.()
      } else {
        setAutoPlayCountdown(null)
      }
    }
  }

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600)
    const m = Math.floor((time % 3600) / 60)
    const s = Math.floor(time % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const togglePiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureElement !== videoRef.current) {
        await videoRef.current.requestPictureInPicture()
      } else if (document.exitPictureInPicture) {
        await document.exitPictureInPicture()
      }
    } catch (error) {
      console.error('PiP Error:', error)
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-none md:rounded-3xl overflow-hidden group shadow-2xl border-y md:border border-white/5 transition-all duration-500 ${!showControls && isPlaying ? 'cursor-none' : 'cursor-default'}`}
      style={{ aspectRatio: '16/9' }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
    >
      {/* Ambilight Canvas */}
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
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration)
          setLoading(false)
          if (initialProgress > 0 && !hasSeekedInitial) setShowResumePrompt(true)
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onClick={handlePlay}
        playsInline
      >
        {/* Native tracks removed in favor of custom overlay */}
      </video>

      {/* Custom Subtitle Overlay */}
      {customSubtitleText && (
        <div className="absolute bottom-12 md:bottom-20 left-0 right-0 text-center z-20 pointer-events-none px-4">
          <span
            className="inline-block bg-black/60 text-white text-lg md:text-xl lg:text-2xl px-4 py-2 rounded-lg backdrop-blur-sm leading-relaxed whitespace-pre-line shadow-lg"
            dangerouslySetInnerHTML={{ __html: customSubtitleText }}
          />
        </div>
      )}

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 p-3 md:p-8 flex justify-between items-start transition-all duration-500 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {/* Show HLS Badge if using HLS */}
            {qualities.length > 0 && <span className="bg-purple-600 text-white text-[7px] md:text-[10px] font-black px-1 md:px-2 py-0.5 rounded tracking-widest uppercase">HLS</span>}
            <span className="bg-blue-600 text-white text-[7px] md:text-[10px] font-black px-1 md:px-2 py-0.5 rounded tracking-widest uppercase shrink-0">EP {episode.episodeNumber}</span>
            <h3 className="text-white text-xs md:text-xl font-black tracking-tight drop-shadow-lg truncate max-w-[120px] md:max-w-none">{episode.title}</h3>
          </div>
          <span className="hidden md:block text-white/40 text-xs font-bold uppercase tracking-widest">Pulse Unlimited • UHD Streaming</span>
        </div>

        <div className="flex gap-4">
          {/* Quality Selector (HLS Only) */}
          {qualities.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="flex items-center gap-1.5 bg-white/5 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black">
                <Cog6ToothIcon className="w-3 h-3 md:w-4 md:h-4" />
                {currentQuality === -1 ? 'AUTO' : `${qualities.find(q => q.level === currentQuality)?.height}p`}
              </button>
              {showQualityMenu && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden min-w-[120px] z-50">
                  <button onClick={() => changeQuality(-1)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === -1 ? 'text-blue-500' : 'text-white'}`}>AUTO</button>
                  {qualities.map(q => (
                    <button key={q.level} onClick={() => changeQuality(q.level)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === q.level ? 'text-blue-500' : 'text-white'}`}>{q.height}p</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Selector (HLS Only) */}
          {audioTracks.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowAudioMenu(!showAudioMenu)} className="flex items-center gap-1.5 bg-white/5 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black">
                <LanguageIcon className="w-3 h-3 md:w-4 md:h-4" />
                Audio {currentAudioTrack + 1}
              </button>
              {showAudioMenu && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden min-w-[120px] z-50">
                  {audioTracks.map(t => (
                    <button key={t.id} onClick={() => changeAudioTrack(t.id)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentAudioTrack === t.id ? 'text-blue-500' : 'text-white'}`}>{t.name}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtitle Selector */}
          {subtitles.length > 0 && (
            <div className="relative">
              <button onClick={() => { setShowSubtitleMenu(!showSubtitleMenu); setShowQualityMenu(false); setShowAudioMenu(false); }} className="flex items-center gap-1.5 bg-white/5 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black">
                <ChatBubbleBottomCenterTextIcon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="truncate max-w-[50px] md:max-w-none">{currentSubtitle === -1 ? 'OFF' : (subtitles[currentSubtitle]?.label || 'CC')}</span>
              </button>
              {showSubtitleMenu && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden min-w-[120px] z-50">
                  <button onClick={() => changeSubtitle(-1)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentSubtitle === -1 ? 'text-blue-500' : 'text-white'}`}>Desativado</button>
                  {subtitles.map(t => (
                    <button key={t.id} onClick={() => changeSubtitle(t.id)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentSubtitle === t.id ? 'text-blue-500' : 'text-white'}`}>{t.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Watch Party Overlay */}
      {isWatchParty && !isPlaying && currentTime === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <button
            onClick={handlePlay}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-3 transition-transform hover:scale-105"
          >
            <PlayIcon className="w-8 h-8" />
            ENTRAR NA SESSÃO
          </button>
        </div>
      )}

      {/* Play/Loading Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center z-15 pointer-events-auto transition-all duration-500 bg-black/20 ${!isPlaying && !loading && !showResumePrompt && (!isWatchParty || currentTime > 0) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={handlePlay} className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/20 rounded-full p-6 md:p-8 focus:outline-none pulse-primary">
          <PlayIcon className="w-8 h-8 md:w-12 md:h-12 text-white ml-1 md:ml-2" />
        </button>
      </div>

      {/* Loading */}
      {loading && !showResumePrompt && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Resume Prompt */}
      {showResumePrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[40px] md:rounded-[56px] shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] animate-slide-up-soft flex flex-col items-center max-w-sm w-full text-center pointer-events-auto relative overflow-hidden group/modal">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent opacity-50" />

            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-8 ring-8 ring-blue-600/5 relative z-10 transition-transform duration-700 group-hover/modal:scale-110">
              <PlayIcon className="w-10 h-10 md:w-12 md:h-12 text-blue-500 ml-1.5 md:ml-2" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping opacity-20" />
            </div>

            <h4 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-3 relative z-10">Continuar?</h4>
            <p className="text-gray-400 text-sm md:text-base font-medium mb-10 leading-relaxed relative z-10 px-2">
              Detectamos progresso anterior em <span className="text-white font-black">{Math.round(initialProgress)}%</span>. Deseja retomar de onde parou?
            </p>

            <div className="flex flex-col w-full gap-4 relative z-10">
              <button
                onClick={handleResume}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm tracking-[0.2em] uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]"
              >
                RETOMAR SESSÃO
              </button>
              <button
                onClick={() => { setShowResumePrompt(false); setHasSeekedInitial(true); }}
                className="w-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs tracking-[0.2em] uppercase transition-all"
              >
                RECOMEÇAR DO ZERO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Intro */}
      {showSkipIntro && (
        <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = 110; }} className="absolute bottom-24 md:bottom-32 left-4 md:left-8 z-30 bg-gray-950/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-black text-[9px] md:text-xs tracking-[0.2em] transition-all hover:scale-105 active:scale-95 animate-slide-up-soft flex items-center gap-3 pointer-events-auto">
          PULAR INTRODUÇÃO <ChevronRightIcon className="w-4 h-4 text-blue-500" />
        </button>
      )}

      {/* Autoplay Countdown */}
      {autoPlayCountdown !== null && (
        <div className="absolute bottom-24 md:bottom-32 right-4 md:right-8 z-30 bg-blue-600/90 backdrop-blur-xl text-white p-4 md:p-6 rounded-3xl border border-white/20 animate-slide-up-soft shadow-2xl flex flex-col items-center min-w-[140px] md:min-w-[180px]">
          <span className="text-[8px] md:text-[10px] font-black tracking-widest uppercase opacity-70 mb-1 md:mb-2">Próximo Episódio</span>
          <div className="text-2xl md:text-4xl font-black mb-2 md:mb-4 font-mono">{autoPlayCountdown}s</div>
          <button onClick={() => onNextEpisode?.()} className="bg-white text-blue-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors pointer-events-auto">ASSISTIR AGORA</button>
        </div>
      )}

      {/* Controls Container */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-40 p-4 md:p-8 transition-all duration-700 pointer-events-none
          ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent -z-10" />

        {/* Slider Area */}
        <div className="flex flex-col gap-4 mb-6 relative group/slider">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                const newTime = parseFloat(e.target.value)
                videoRef.current.currentTime = newTime
                if (isWatchParty) onSeekCallback?.(newTime)
              }
            }}
            className="video-slider w-full h-1 md:h-1.5 pointer-events-auto transition-all group-hover/slider:h-2"
            style={{ '--progress': `${(currentTime / (duration || 1)) * 100}%` } as React.CSSProperties}
          />
          <div className="flex justify-between items-center text-[10px] md:text-xs font-black font-mono text-white/50 tracking-widest px-1">
            <span className="text-blue-500">{formatTime(currentTime)}</span>
            <span className="text-white/30">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bottom Bar Area */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4 md:gap-10">
            <button onClick={handlePlay} className="text-white hover:text-blue-500 transition-all hover:scale-110 active:scale-90 p-1">
              {isPlaying ? <PauseIcon className="w-8 h-8 md:w-10 md:h-10" /> : <PlayIcon className="w-8 h-8 md:w-10 md:h-10 ml-1" />}
            </button>

            <div className="flex items-center gap-6 md:gap-8">
              {hasPreviousEpisode && (
                <button onClick={onPreviousEpisode} className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-90">
                  <BackwardIcon className="w-7 h-7 md:w-8 md:h-8" />
                </button>
              )}
              {hasNextEpisode && (
                <button onClick={onNextEpisode} className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-90">
                  <ForwardIcon className="w-7 h-7 md:w-8 md:h-8" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4 bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/5 group/volume">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <SpeakerXMarkIcon className="w-5 h-5 text-red-500" /> : <SpeakerWaveIcon className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setVolume(val)
                  if (videoRef.current) videoRef.current.volume = val
                  setIsMuted(val === 0)
                }}
                className="video-slider w-20 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={togglePiP}
              className="text-white/40 hover:text-blue-500 transition-all p-2 rounded-xl hover:bg-blue-500/10"
              title="Miniatura (PiP)"
            >
              <Square2StackIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white/40 hover:text-white transition-all hover:scale-110 p-2"
              title="Tela Cheia"
            >
              {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6 md:w-7 md:h-7" /> : <ArrowsPointingOutIcon className="w-6 h-6 md:w-7 md:h-7" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}