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
  Cog6ToothIcon
} from '@heroicons/react/24/solid'
import { Episode } from '@/types/anime'

interface VideoPlayerProps {
  episode: Episode
  onNextEpisode?: () => void
  onPreviousEpisode?: () => void
  hasNextEpisode?: boolean
  hasPreviousEpisode?: boolean
}

export function VideoPlayer({ 
  episode, 
  onNextEpisode, 
  onPreviousEpisode, 
  hasNextEpisode, 
  hasPreviousEpisode 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
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
  const [quality, setQuality] = useState('1080p')

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

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setLoading(false)
    }
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

  const videoSrc = `/api/video/${episode.id}?quality=${quality}`

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
        Seu navegador não suporta o elemento de vídeo.
      </video>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent" />
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Episode Title */}
        <div className="absolute top-4 left-4 right-4">
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
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
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

              {/* Previous Episode */}
              {hasPreviousEpisode && (
                <button
                  onClick={onPreviousEpisode}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>
              )}

              {/* Next Episode */}
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
              {/* Quality Selector */}
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-transparent text-white text-sm border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="720p" className="bg-gray-800">720p</option>
                <option value="1080p" className="bg-gray-800">1080p</option>
              </select>

              {/* Settings */}
              <button className="text-white hover:text-blue-400 transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>

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