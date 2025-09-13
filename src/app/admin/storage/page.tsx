'use client'

import { useState } from 'react'

interface UploadResult {
  success: boolean
  message?: string
  data?: any
  error?: string
}

export default function StoragePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [animeId, setAnimeId] = useState('')
  const [episodeId, setEpisodeId] = useState('')
  const [uploadType, setUploadType] = useState('video')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !animeId.trim() || !episodeId.trim()) {
      setUploadResult({
        success: false,
        error: 'Por favor, preencha todos os campos obrigatórios'
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', uploadType)
      formData.append('animeId', animeId.trim())
      formData.append('episodeId', episodeId.trim())

      console.log('Uploading:', {
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        type: uploadType,
        animeId: animeId.trim(),
        episodeId: episodeId.trim()
      })

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP Error: ${response.status}`)
      }

      const result = await response.json()
      
      setUploadResult({
        success: true,
        message: 'Upload realizado com sucesso!',
        data: result
      })

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setAnimeId('')
        setEpisodeId('')
        setUploadType('video')
        setUploadProgress(0)
        // Reset file input
        const fileInput = document.getElementById('video-file') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante o upload'
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const clearForm = () => {
    setSelectedFile(null)
    setAnimeId('')
    setEpisodeId('')
    setUploadType('video')
    setUploadProgress(0)
    setUploadResult(null)
    const fileInput = document.getElementById('video-file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100">
            Upload - Cloudflare R2
          </h1>
          <p className="text-gray-400 mt-1">Upload de arquivos</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-500/30">
            POST
          </span>
          <span className="text-gray-400 text-sm font-mono">
            /api/upload
          </span>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-8">
          <div className="space-y-6">
            {/* Upload Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="text-red-400">*</span> Tipo de Upload
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="video">Vídeo do Episódio</option>
                <option value="thumbnail">Imagem de Thumbnail</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="text-red-400">*</span> {uploadType === 'video' ? 'Arquivo de Vídeo' : 'Arquivo de Imagem'}
              </label>
              <div className="relative">
                <input
                  id="video-file"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-400">
                  <p>📁 {selectedFile.name}</p>
                  <p>📊 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {/* Anime ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="text-red-400">*</span> Anime ID
              </label>
              <input
                type="text"
                placeholder="Ex: 506d1c46-f268-4e7b-925f-b9ee97db4c9f"
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
              />
            </div>

            {/* Episode ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="text-red-400">*</span> Episode ID
              </label>
              <input
                type="text"
                placeholder="Ex: 3908b961-652e-463d-a7ec-2d018234a8c1"
                value={episodeId}
                onChange={(e) => setEpisodeId(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Enviando arquivo...</span>
                  <span className="text-blue-400 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Result */}
            {uploadResult && (
              <div className={`border rounded-lg p-4 ${
                uploadResult.success
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {uploadResult.success ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {uploadResult.success ? 'Sucesso!' : 'Erro no Upload'}
                    </p>
                    <p className="text-sm mt-1">
                      {uploadResult.message || uploadResult.error}
                    </p>
                    {uploadResult.success && uploadResult.data && (
                      <pre className="mt-3 text-xs bg-gray-800/50 p-3 rounded overflow-x-auto max-w-full whitespace-pre-wrap break-words">
                        {JSON.stringify(uploadResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={clearForm}
                disabled={isUploading}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpar Form
              </button>
              
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !animeId.trim() || !episodeId.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span>Fazer Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-6 bg-gray-900/40 border border-gray-700/30 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Parâmetros da API</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">file:</span>
              <span className="text-green-400">Arquivo de vídeo ou imagem (multipart/form-data)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">type:</span>
              <span className="text-blue-400">"video" ou "thumbnail"</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">animeId:</span>
              <span className="text-yellow-400">UUID do anime</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">episodeId:</span>
              <span className="text-yellow-400">UUID do episódio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}