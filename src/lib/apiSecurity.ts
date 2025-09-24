import { NextRequest } from 'next/server'

/**
 * 🔍 Detecta contexto da requisição para controle de dados sensíveis
 */
export function getRequestContext(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname
  const referer = request.headers.get('referer') || ''

  // 🛡️ Contexto ADMIN - pode ver URLs sensíveis
  const isAdminContext =
    pathname.includes('/api/admin/') ||
    referer.includes('/admin/')

  // 🔧 Contexto INTERNO - APIs internas que precisam de URLs
  const isInternalContext =
    pathname.includes('/api/video/') ||
    pathname.includes('/api/upload/')

  // 📱 Contexto PÚBLICO - frontend normal, precisa proteger URLs
  const isPublicContext = !isAdminContext && !isInternalContext

  return {
    isAdmin: isAdminContext,
    isInternal: isInternalContext,
    isPublic: isPublicContext,
    shouldHideUrls: isPublicContext
  }
}

/**
 * 🛡️ Remove campos sensíveis baseado no contexto
 */
export function sanitizeEpisodeByContext(episode: any, request: NextRequest) {
  const context = getRequestContext(request)

  // Se é contexto admin ou interno, retorna tudo
  if (context.isAdmin || context.isInternal) {
    return episode
  }

  // Se é contexto público, remove URLs e caminhos sensíveis
  const {
    videoUrl,
    r2Key,
    thumbnailR2Key,
    r2VideoPath,
    r2SubtitlePath,
    r2ThumbnailPath,
    ...sanitized
  } = episode
  return sanitized
}

/**
 * 🔍 Sanitiza array de episódios
 */
export function sanitizeEpisodesArray(episodes: any[], request: NextRequest) {
  return episodes.map(episode => sanitizeEpisodeByContext(episode, request))
}

/**
 * 📊 Log de contexto para debugging
 */
export function logRequestContext(request: NextRequest, label: string = '') {
  const context = getRequestContext(request)
  const url = new URL(request.url)

  console.log(`🔍 [${label}] Context:`, {
    pathname: url.pathname,
    referer: request.headers.get('referer'),
    isAdmin: context.isAdmin,
    isInternal: context.isInternal,
    isPublic: context.isPublic,
    shouldHideUrls: context.shouldHideUrls
  })
}