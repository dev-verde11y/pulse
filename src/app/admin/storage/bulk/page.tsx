'use client'

import { useState, useRef } from 'react'

interface UploadFile {
  id: string
  file: File
  animeId: string
  episodeId: string
  uploadType: 'video' | 'thumbnail'
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  result?: {
    url?: string
    key?: string
    message?: string
  }
  error?: string
}

interface Episode {
  id: string
  episodeNumber: number
  title: string
  animeId: string
  animeTitle: string
  animeSlug: string
  seasonId: string
  seasonNumber: number
  hasVideo: boolean
  hasThumbnail: boolean
}

export default function BulkUploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedAnimeId, setSelectedAnimeId] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const newUploadFiles = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      animeId: '',
      episodeId: '',
      uploadType: 'video' as const,
      status: 'pending' as const,
      progress: 0
    }))

    setUploadFiles(prev => [...prev, ...newUploadFiles])
  }

  const updateUploadFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    )
  }

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id))
  }

  const searchEpisodes = async () => {
    if (!searchTerm.trim()) return

    try {
      const response = await fetch(`/api/episodes/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setEpisodes(data.episodes || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    if (!uploadFile.file || !uploadFile.animeId || !uploadFile.episodeId) return

    updateUploadFile(uploadFile.id, { status: 'uploading', progress: 0 })

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      
      formData.append('file', uploadFile.file)
      formData.append('type', uploadFile.uploadType)
      formData.append('animeId', uploadFile.animeId)
      formData.append('episodeId', uploadFile.episodeId)

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          updateUploadFile(uploadFile.id, { progress: percentComplete })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            updateUploadFile(uploadFile.id, {
              status: 'completed',
              progress: 100,
              result
            })
            resolve()
          } catch (error) {
            updateUploadFile(uploadFile.id, {
              status: 'error',
              progress: 0,
              error: 'Erro ao processar resposta'
            })
            reject(error)
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            updateUploadFile(uploadFile.id, {
              status: 'error',
              progress: 0,
              error: errorData.error || `HTTP ${xhr.status}`
            })
          } catch {
            updateUploadFile(uploadFile.id, {
              status: 'error',
              progress: 0,
              error: `HTTP ${xhr.status} - ${xhr.statusText}`
            })
          }
          reject(new Error(`HTTP ${xhr.status}`))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        updateUploadFile(uploadFile.id, {
          status: 'error',
          progress: 0,
          error: 'Erro de conexão'
        })
        reject(new Error('Network error'))
      })

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        updateUploadFile(uploadFile.id, {
          status: 'error',
          progress: 0,
          error: 'Timeout na conexão'
        })
        reject(new Error('Timeout'))
      })

      xhr.open('POST', '/api/upload')
      xhr.timeout = 300000 // 5 minutes timeout
      xhr.send(formData)
    })
  }

  const startBulkUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending' && f.animeId && f.episodeId)
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file)
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsUploading(false)
  }

  const selectEpisodeForFile = (fileId: string, episode: Episode) => {
    updateUploadFile(fileId, {
      episodeId: episode.id,
      animeId: episode.animeId || selectedAnimeId
    })
  }

  const applyToAllFiles = (animeId: string, uploadType: 'video' | 'thumbnail') => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.status === 'pending' ? { ...file, animeId, uploadType } : file
      )
    )
  }

  const clearAllFiles = () => {
    setUploadFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400'
      case 'uploading': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
      case 'completed':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      case 'error':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100">
            Upload em Lote - Cloudflare R2
          </h1>
          <p className="text-gray-400 mt-1">Upload múltiplos arquivos com fila de processamento</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-500/30">
            BULK
          </span>
          <span className="text-gray-400 text-sm font-mono">
            /api/upload
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* File Selection */}
        <div className="xl:col-span-1">
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📁 Selecionar Arquivos</h2>
            
            {/* File Input */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {/* Episode Search */}
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Buscar episódios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchEpisodes()}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                />
                <button
                  onClick={searchEpisodes}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  🔍 Buscar Episódios
                </button>
              </div>

              {/* Episodes List */}
              {episodes.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  <div className="text-xs text-gray-400 mb-2">
                    {episodes.length} episódio(s) encontrado(s)
                  </div>
                  {episodes.map(episode => (
                    <div key={episode.id} className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{episode.animeTitle}</div>
                          <div className="text-xs text-gray-400 flex items-center space-x-2">
                            <span>S{episode.seasonNumber}E{episode.episodeNumber} - {episode.title}</span>
                            {episode.hasVideo && <span className="text-green-400">🎬</span>}
                            {episode.hasThumbnail && <span className="text-blue-400">🖼️</span>}
                          </div>
                          <div className="text-xs font-mono text-gray-500 mt-1">
                            Anime: {episode.animeId} | Episode: {episode.id}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => applyToAllFiles(episode.animeId, 'video')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs mr-1"
                          >
                            Aplicar Anime ID
                          </button>
                          <button
                            onClick={() => {
                              const fileToUpdate = uploadFiles.find(f => f.status === 'pending' && !f.episodeId)
                              if (fileToUpdate) {
                                selectEpisodeForFile(fileToUpdate.id, episode)
                              }
                            }}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                          >
                            Usar Episode
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={clearAllFiles}
                className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
              >
                🗑️ Limpar Tudo
              </button>
              <button
                onClick={startBulkUpload}
                disabled={isUploading || uploadFiles.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? '⏳ Enviando...' : '🚀 Iniciar Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Queue */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">📤 Fila de Upload</h2>
              <span className="text-sm text-gray-400">
                {uploadFiles.length} arquivo(s) | {uploadFiles.filter(f => f.status === 'completed').length} concluído(s)
              </span>
            </div>

            {uploadFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p>Nenhum arquivo selecionado</p>
                <p className="text-sm mt-1">Selecione arquivos para iniciar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadFiles.map(uploadFile => (
                  <div key={uploadFile.id} className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={getStatusColor(uploadFile.status)}>
                          {getStatusIcon(uploadFile.status)}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{uploadFile.file.name}</div>
                          <div className="text-xs text-gray-400">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadFile(uploadFile.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Configuration */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <select
                        value={uploadFile.uploadType}
                        onChange={(e) => updateUploadFile(uploadFile.id, { uploadType: e.target.value as 'video' | 'thumbnail' })}
                        disabled={uploadFile.status === 'uploading' || uploadFile.status === 'completed'}
                        className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm disabled:opacity-50"
                      >
                        <option value="video">🎬 Vídeo</option>
                        <option value="thumbnail">🖼️ Thumbnail</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Anime ID"
                        value={uploadFile.animeId}
                        onChange={(e) => updateUploadFile(uploadFile.id, { animeId: e.target.value })}
                        disabled={uploadFile.status === 'uploading' || uploadFile.status === 'completed'}
                        className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm placeholder-gray-400 disabled:opacity-50 font-mono"
                      />

                      <input
                        type="text"
                        placeholder="Episode ID"
                        value={uploadFile.episodeId}
                        onChange={(e) => updateUploadFile(uploadFile.id, { episodeId: e.target.value })}
                        disabled={uploadFile.status === 'uploading' || uploadFile.status === 'completed'}
                        className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm placeholder-gray-400 disabled:opacity-50 font-mono"
                      />
                    </div>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-blue-400">Enviando...</span>
                          <span className="text-xs text-blue-400">{uploadFile.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <div className="text-xs text-red-400 mt-2">
                        ❌ {uploadFile.error}
                      </div>
                    )}

                    {/* Success Message */}
                    {uploadFile.status === 'completed' && uploadFile.result && (
                      <div className="text-xs text-green-400 mt-2">
                        ✅ Upload concluído - {uploadFile.result.file?.url}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}