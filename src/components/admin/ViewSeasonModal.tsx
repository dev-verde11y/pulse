'use client'

import Image from 'next/image'

interface Season {
  id: string
  animeId: string
  seasonNumber: number
  title?: string
  description?: string
  releaseDate?: string
  endDate?: string
  bannerUrl?: string
  bannerR2Key?: string
  r2BucketPath?: string
  createdAt: string
  updatedAt: string
  anime: {
    id: string
    title: string
    posterUrl?: string
    thumbnail?: string
  }
  _count: {
    episodes: number
  }
}

interface ViewSeasonModalProps {
  season: Season | null
  isOpen: boolean
  onClose: () => void
}

export function ViewSeasonModal({ season, isOpen, onClose }: ViewSeasonModalProps) {
  if (!isOpen || !season) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeasonDuration = () => {
    if (!season.releaseDate || !season.endDate) return 'Em andamento'
    
    const start = new Date(season.releaseDate)
    const end = new Date(season.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    
    if (diffMonths > 0) {
      return `${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`
    }
    return `${diffDays} dias`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Detalhes da Temporada</h2>
              <p className="text-sm text-gray-400 mt-1">
                {season.anime.title} - Temporada {season.seasonNumber}
                {season.title && ` (${season.title})`}
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
            {/* Season Info Card */}
            <div className="bg-gradient-to-br from-purple-600/10 via-purple-700/5 to-purple-800/5 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-6">
                {/* Season Banner or Anime Poster */}
                <div className="w-48 h-28 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {(season.bannerUrl || season.anime.posterUrl || season.anime.thumbnail) ? (
                    <Image
                      src={(season.bannerUrl || season.anime.posterUrl || season.anime.thumbnail)!}
                      alt={season.title || `Temporada ${season.seasonNumber}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Season Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                        Temporada {season.seasonNumber}
                      </span>
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                        {season._count.episodes} episódios
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {season.title || `Temporada ${season.seasonNumber}`}
                    </h3>
                    {season.description && (
                      <p className="text-gray-300 leading-relaxed">{season.description}</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Período</p>
                      <p className="text-white font-medium">{formatDate(season.releaseDate)} - {formatDate(season.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duração</p>
                      <p className="text-white font-medium">{getSeasonDuration()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Banner Information */}
              <div className="bg-gradient-to-br from-green-600/10 via-green-700/5 to-green-800/5 border border-green-500/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Banner</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">URL do Banner</p>
                    {season.bannerUrl ? (
                      <div className="flex items-center space-x-2">
                        <p className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex-1 truncate">
                          {season.bannerUrl}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(season.bannerUrl!)}
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
                    <p className="text-sm text-gray-400">Chave R2 do Banner</p>
                    <p className="text-gray-300 font-mono text-sm">{season.bannerR2Key || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Storage Information */}
              <div className="bg-gradient-to-br from-blue-600/10 via-blue-700/5 to-blue-800/5 border border-blue-500/20 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Armazenamento</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Caminho do Bucket R2</p>
                    <p className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                      {season.r2BucketPath || 'Padrão'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anime Information */}
            <div className="bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/20 border border-gray-600/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v12a1 1 0 001 1h16a1 1 0 001-1V8H3z" />
                </svg>
                <span>Informações do Anime</span>
              </h4>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
                    {(season.anime.posterUrl || season.anime.thumbnail) ? (
                      <Image
                        src={(season.anime.posterUrl || season.anime.thumbnail)!}
                        alt={season.anime.title}
                        fill
                        className="object-cover"
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
                    <p className="text-white font-medium">{season.anime.title}</p>
                    <p className="text-gray-300 font-mono text-sm">ID: {season.anime.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gradient-to-br from-yellow-600/10 via-yellow-700/5 to-yellow-800/5 border border-yellow-500/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Estatísticas</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{season._count.episodes}</div>
                  <div className="text-sm text-gray-400">Total de Episódios</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{season.seasonNumber}</div>
                  <div className="text-sm text-gray-400">Número da Temporada</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{getSeasonDuration()}</div>
                  <div className="text-sm text-gray-400">Duração</div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Criado em</p>
                  <p className="text-gray-300">{formatDateTime(season.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Atualizado em</p>
                  <p className="text-gray-300">{formatDateTime(season.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">ID da Temporada</p>
                  <p className="text-gray-300 font-mono text-sm">{season.id.slice(0, 8)}...</p>
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