'use client'

interface Anime {
  id: string
  title: string
  description: string
  year: number
  status: string
  type: string
  rating: string
  genres: string[]
  slug: string
  totalEpisodes?: number
  isSubbed: boolean
  isDubbed: boolean
  tags: string[]
  director?: string
  studio?: string
  posterUrl?: string
  thumbnail?: string
  bannerUrl?: string
  logoUrl?: string
  createdAt: string
  updatedAt: string
  _count: {
    seasons: number
    favorites: number
  }
}

interface ViewAnimeModalProps {
  anime: Anime | null
  isOpen: boolean
  onClose: () => void
}

export function ViewAnimeModal({ anime, isOpen, onClose }: ViewAnimeModalProps) {
  if (!isOpen || !anime) return null

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'FINISHED': { label: 'Finalizado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      'ONGOING': { label: 'Em Andamento', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'UPCOMING': { label: 'Em Breve', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      'CANCELLED': { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.ONGOING
  }

  const getTypeDisplay = (type: string) => {
    const typeMap = {
      'ANIME': { label: 'Anime', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      'FILME': { label: 'Filme', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      'SERIE': { label: 'Série', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
    }
    return typeMap[type as keyof typeof typeMap] || typeMap.ANIME
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const status = getStatusDisplay(anime.status)
  const type = getTypeDisplay(anime.type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50">
          {anime.bannerUrl && (
            <div className="absolute inset-0 opacity-20">
              <img 
                src={anime.bannerUrl} 
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900"></div>
            </div>
          )}
          <div className="relative flex items-center justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {anime.posterUrl || anime.thumbnail ? (
                  <img 
                    src={anime.posterUrl || anime.thumbnail} 
                    alt={anime.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-gray-500 text-xs text-center p-2 ${anime.posterUrl || anime.thumbnail ? 'hidden' : ''}`}>
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Sem Imagem
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-black text-white mb-2">{anime.title}</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                    {status.label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${type.color}`}>
                    {type.label}
                  </span>
                  <span className="text-gray-400 text-sm">{anime.year}</span>
                  <span className="text-gray-400 text-sm">Classificação: {anime.rating}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-300">
                  {anime.totalEpisodes && (
                    <div>
                      <span className="text-gray-500">Episódios:</span> {anime.totalEpisodes}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Temporadas:</span> {anime._count.seasons}
                  </div>
                  <div>
                    <span className="text-gray-500">Favoritos:</span> {anime._count.favorites}
                  </div>
                </div>
              </div>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Sinopse</h3>
            <p className="text-gray-300 leading-relaxed">{anime.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genres */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Gêneros</h4>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            {anime.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {anime.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full text-sm border border-gray-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Production Info */}
            {(anime.director || anime.studio) && (
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Produção</h4>
                <div className="space-y-2 text-gray-300">
                  {anime.director && (
                    <div>
                      <span className="text-gray-500">Diretor:</span> {anime.director}
                    </div>
                  )}
                  {anime.studio && (
                    <div>
                      <span className="text-gray-500">Estúdio:</span> {anime.studio}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Info */}
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Informações Técnicas</h4>
              <div className="space-y-2 text-gray-300">
                <div>
                  <span className="text-gray-500">Slug:</span> <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">{anime.slug}</code>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${anime.isSubbed ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className={anime.isSubbed ? 'text-green-400' : 'text-gray-500'}>Legendado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${anime.isDubbed ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className={anime.isDubbed ? 'text-green-400' : 'text-gray-500'}>Dublado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-700/50 pt-6">
            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Metadados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">Criado em:</span> {formatDate(anime.createdAt)}
              </div>
              <div>
                <span className="text-gray-500">Atualizado em:</span> {formatDate(anime.updatedAt)}
              </div>
              <div>
                <span className="text-gray-500">ID:</span> <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">{anime.id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}