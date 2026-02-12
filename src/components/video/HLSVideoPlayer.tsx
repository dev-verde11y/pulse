'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
    ChevronRightIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface HLSVideoPlayerProps {
    episode: Episode
    onNextEpisode?: () => void
    onPreviousEpisode?: () => void
    hasNextEpisode?: boolean
    hasPreviousEpisode?: boolean
    animeId: string
    initialProgress?: number
    nextEpisodeId?: string

    // Watch Party Props
    onPlayCallback?: () => void
    onPauseCallback?: () => void
    onSeekCallback?: (time: number) => void
    externalTime?: number
    externalIsPlaying?: boolean
    isWatchParty?: boolean
}

export function HLSVideoPlayer({
    episode,
    onNextEpisode,
    onPreviousEpisode,
    hasNextEpisode,
    hasPreviousEpisode,
    animeId,
    initialProgress = 0,
    nextEpisodeId,
    onPlayCallback,
    onPauseCallback,
    onSeekCallback,
    externalTime,
    externalIsPlaying,
    isWatchParty = false
}: HLSVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<Hls | null>(null)

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

    const [showQualityMenu, setShowQualityMenu] = useState(false)
    const [showAudioMenu, setShowAudioMenu] = useState(false)

    const [showSkipIntro, setShowSkipIntro] = useState(false)
    const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null)
    const [hasSeekedInitial, setHasSeekedInitial] = useState(false)
    const [showResumePrompt, setShowResumePrompt] = useState(false)
    const [hasPrefetchedNext, setHasPrefetchedNext] = useState(false)
    const [previewThumb, setPreviewThumb] = useState<{ x: number, time: number } | null>(null)
    const lastApiSyncRef = useRef<number>(0)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const { user } = useAuth()

    // Initialize HLS
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Clean up previous instance
        if (hlsRef.current) {
            hlsRef.current.destroy()
        }

        // Determine Source URL (Assume prop has hlsUrl or fall back to standard videoUrl if it ends in m3u8)
        const src = (episode.videoUrl && episode.videoUrl.includes('.m3u8'))
            ? episode.videoUrl
            : (episode.r2Key ? `/api/video/${episode.id}/hls` : (episode.videoUrl || ''))

        if (Hls.isSupported()) {
            const hls = new Hls({
                capLevelToPlayerSize: true, // Auto quality based on size
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
                    setAudioTracks(hls.audioTracks.map((t, i) => ({ id: i, name: t.name })))
                    setCurrentAudioTrack(hls.audioTrack)
                }

                // Initial Seek if needed
                if (initialProgress > 0 && !hasSeekedInitial) {
                    setShowResumePrompt(true)
                } else if (currentTime > 0) {
                    video.currentTime = currentTime
                }
            })

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                const level = hls.levels[data.level]
                console.log(`Quality switched to: ${level.height}p`)
            })

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                console.log(`Audio switched to: ${data.id}`)
                setCurrentAudioTrack(data.id)
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('fatal network error encountered, try to recover')
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('fatal media error encountered, try to recover')
                            hls.recoverMediaError()
                            break
                        default:
                            // cannot recover
                            hls.destroy()
                            break
                    }
                }
            })

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src
            video.addEventListener('loadedmetadata', () => {
                setDuration(video.duration)
                setLoading(false)
            })
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
            }
        }
    }, [episode.id, episode.videoUrl, episode.r2Key])

    // Sync Audio Track Selection
    const changeAudioTrack = (trackId: number) => {
        if (hlsRef.current) {
            hlsRef.current.audioTrack = trackId
            setCurrentAudioTrack(trackId)
            setShowAudioMenu(false)
        }
    }

    // Sync Quality Selection
    const changeQuality = (levelIndex: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex
            setCurrentQuality(levelIndex)
            setShowQualityMenu(false)
        }
    }

    // Reuse existing logic for syncing save progress (simplified)
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
                saveProgressToAPI(videoRef.current.currentTime, videoRef.current.duration)
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [isPlaying, saveProgressToAPI])

    const handlePlay = async () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                await videoRef.current.play().catch(console.error)
                setIsPlaying(true)
                if (isWatchParty) onPlayCallback?.()
            } else {
                videoRef.current.pause()
                setIsPlaying(false)
                if (isWatchParty) onPauseCallback?.()
            }
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
    }

    const formatTime = (time: number) => {
        const h = Math.floor(time / 3600)
        const m = Math.floor((time % 3600) / 60)
        const s = Math.floor(time % 60)
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
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
            className="relative w-full bg-black rounded-3xl overflow-hidden group shadow-2xl border border-white/5"
            style={{ aspectRatio: '16/9' }}
            onMouseMove={() => { setShowControls(true); }}
            onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
        >
            <video
                ref={videoRef}
                className="relative w-full h-full cursor-none z-10"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onClick={handlePlay}
                playsInline
            />

            {/* Top Bar */}
            <div className={`absolute top-0 left-0 right-0 z-20 p-8 flex justify-between items-start transition-all duration-500 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">HLS BETA</span>
                        <h3 className="text-white text-xl font-black tracking-tight drop-shadow-lg">{episode.title}</h3>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Quality */}
                    <div className="relative">
                        <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-black">
                            <Cog6ToothIcon className="w-4 h-4" />
                            {currentQuality === -1 ? 'AUTO' : `${qualities.find(q => q.level === currentQuality)?.height}p`}
                        </button>
                        {showQualityMenu && (
                            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden min-w-[120px]">
                                <button onClick={() => changeQuality(-1)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === -1 ? 'text-blue-500' : 'text-white'}`}>AUTO</button>
                                {qualities.map(q => (
                                    <button key={q.level} onClick={() => changeQuality(q.level)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentQuality === q.level ? 'text-blue-500' : 'text-white'}`}>{q.height}p</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Audio */}
                    {audioTracks.length > 0 && (
                        <div className="relative">
                            <button onClick={() => setShowAudioMenu(!showAudioMenu)} className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-black">
                                <LanguageIcon className="w-4 h-4" />
                                Audio {currentAudioTrack + 1}
                            </button>
                            {showAudioMenu && (
                                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden min-w-[120px]">
                                    {audioTracks.map(t => (
                                        <button key={t.id} onClick={() => changeAudioTrack(t.id)} className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentAudioTrack === t.id ? 'text-blue-500' : 'text-white'}`}>{t.name}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Center Play */}
            <div className={`absolute inset-0 flex items-center justify-center z-15 pointer-events-auto transition-all duration-500 bg-black/20 ${!isPlaying && !loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={handlePlay} className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/20 rounded-full p-8 focus:outline-none pulse-primary">
                    <PlayIcon className="w-12 h-12 text-white ml-2" />
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Controls */}
            <div className={`absolute bottom-0 left-0 right-0 z-40 p-8 transition-all duration-500 ${showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                        const time = parseFloat(e.target.value)
                        if (videoRef.current) videoRef.current.currentTime = time
                    }}
                    className="video-slider w-full h-1.5 pointer-events-auto"
                    style={{ '--progress': `${(currentTime / (duration || 1)) * 100}%` } as React.CSSProperties}
                />
                <div className="flex justify-between mt-4">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlay} className="text-white hover:text-blue-500">
                            {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                        </button>
                        <span className="text-white text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <button onClick={toggleFullscreen} className="text-white hover:text-blue-500">
                        {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6" /> : <ArrowsPointingOutIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

        </div>
    )
}
