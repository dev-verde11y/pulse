'use client'

interface Episode {
  id: string
  episodeNumber: number
  title: string
  description?: string
  duration?: number
  thumbnail?: string
  thumbnailUrl?: string
  videoUrl?: string
  r2Key?: string
  thumbnailR2Key?: string
  airDate?: string
  createdAt: string
  updatedAt: string
  season: {
    id: string
    seasonNumber: number
    title?: string
    anime: {
      id: string
      title: string
      posterUrl?: string
      thumbnail?: string
    }
  }
}

interface ViewEpisodeModalProps {
  episode: Episode | null
  isOpen: boolean
  onClose: () => void
}

export function ViewEpisodeModal({ episode, isOpen, onClose }: ViewEpisodeModalProps) {
  if (!isOpen || !episode) return null

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAirDate = (dateString?: string) => {
    if (!dateString) return 'Não definida'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Detalhes do Episódio</h2>
              <p className="text-sm text-gray-400 mt-1">
                {episode.season.anime.title} - Temporada {episode.season.seasonNumber}
                {episode.season.title && ` (${episode.season.title})`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-8">
            {/* Episode Info Card */}
            <div className="bg-gradient-to-br from-blue-600/10 via-blue-700/5 to-blue-800/5 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-6">
                {/* Thumbnail */}
                <div className="w-48 h-28 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {episode.thumbnailUrl || episode.thumbnail ? (
                    <img 
                      src={episode.thumbnailUrl || episode.thumbnail} 
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Episode Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                        Episódio {episode.episodeNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        episode.videoUrl
                          ? 'bg-green-600/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {episode.videoUrl ? 'Disponível' : 'Pendente'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{episode.title}</h3>
                    {episode.description && (
                      <p className="text-gray-300 leading-relaxed">{episode.description}</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Duração</p>
                      <p className="text-white font-medium">{formatDuration(episode.duration)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Data de Lançamento</p>
                      <p className="text-white font-medium">{formatAirDate(episode.airDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Information */}
              <div className="bg-gradient-to-br from-green-600/10 via-green-700/5 to-green-800/5 border border-green-500/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Vídeo</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">URL do Vídeo</p>
                    {episode.videoUrl ? (
                      <div className="flex items-center space-x-2">
                        <p className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex-1 truncate">
                          {episode.videoUrl}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(episode.videoUrl!)}
                          className="p-1 text-green-400 hover:text-green-300"
                          title="Copiar URL"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">Não definida</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Chave R2</p>
                    <p className="text-gray-300 font-mono text-sm">{episode.r2Key || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail Information */}
              <div className="bg-gradient-to-br from-purple-600/10 via-purple-700/5 to-purple-800/5 border border-purple-500/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Thumbnail</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">URL da Thumbnail</p>
                    {episode.thumbnailUrl || episode.thumbnail ? (
                      <div className="flex items-center space-x-2">
                        <p className="text-purple-400 font-mono text-sm bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 flex-1 truncate">
                          {episode.thumbnailUrl || episode.thumbnail}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(episode.thumbnailUrl || episode.thumbnail!)}
                          className="p-1 text-purple-400 hover:text-purple-300"
                          title="Copiar URL"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">Não definida</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Chave R2 da Thumbnail</p>
                    <p className="text-gray-300 font-mono text-sm">{episode.thumbnailR2Key || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anime & Season Information */}
            <div className="bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/20 border border-gray-600/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Informações da Série</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {episode.season.anime.posterUrl || episode.season.anime.thumbnail ? (
                      <img 
                        src={episode.season.anime.posterUrl || episode.season.anime.thumbnail} 
                        alt={episode.season.anime.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Anime</p>
                    <p className="text-white font-medium">{episode.season.anime.title}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Temporada</p>
                  <p className="text-white font-medium">
                    Temporada {episode.season.seasonNumber}
                    {episode.season.title && (
                      <span className="text-gray-400"> - {episode.season.title}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">IDs</p>
                  <p className="text-gray-300 font-mono text-sm">
                    Anime: {episode.season.anime.id.slice(0, 8)}...
                  </p>
                  <p className="text-gray-300 font-mono text-sm">
                    Temporada: {episode.season.id.slice(0, 8)}...
                  </p>
                  <p className="text-gray-300 font-mono text-sm">
                    Episódio: {episode.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/10 border border-gray-600/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Metadados</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Criado em</p>
                  <p className="text-gray-300">{formatDate(episode.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Atualizado em</p>
                  <p className="text-gray-300">{formatDate(episode.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}