import crypto from 'crypto'

// 🔐 Chave secreta para assinatura (em produção, usar variável de ambiente)
const SECRET_KEY = process.env.VIDEO_SECRET_KEY || 'seu-secret-key-super-seguro-aqui'

export interface SignedVideoToken {
  episodeId: string
  quality: string
  expiresAt: number
  userId?: string
  signature: string
}

/**
 * 🔐 Gera token temporário para acesso ao vídeo
 */
export function generateSecureVideoToken(
  episodeId: string,
  quality: string = '1080p',
  userId?: string,
  expirationMinutes: number = 60
): string {
  const expiresAt = Date.now() + (expirationMinutes * 60 * 1000)

  const payload = {
    episodeId,
    quality,
    expiresAt,
    userId
  }

  // Criar assinatura HMAC
  const dataToSign = `${episodeId}:${quality}:${expiresAt}:${userId || ''}`
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(dataToSign)
    .digest('hex')

  // Encodar token
  const token = Buffer.from(JSON.stringify({
    ...payload,
    signature
  })).toString('base64url')

  console.log(`🔐 Token gerado para episódio ${episodeId}, válido por ${expirationMinutes}min`)

  return token
}

/**
 * 🔍 Valida token temporário
 */
export function validateSecureVideoToken(token: string): {
  valid: boolean
  data?: SignedVideoToken
  error?: string
} {
  try {
    // Decodificar token
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))

    const { episodeId, quality, expiresAt, userId, signature } = decoded

    // Verificar expiração
    if (Date.now() > expiresAt) {
      return { valid: false, error: 'Token expirado' }
    }

    // Recriar assinatura para validar
    const dataToSign = `${episodeId}:${quality}:${expiresAt}:${userId || ''}`
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataToSign)
      .digest('hex')

    // Comparar assinaturas
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Assinatura inválida' }
    }

    console.log(`✅ Token válido para episódio ${episodeId}`)

    return {
      valid: true,
      data: decoded
    }

  } catch {
    return { valid: false, error: 'Token malformado' }
  }
}

/**
 * 🎯 Gera URL temporária para vídeo
 */
export function generateSecureVideoUrl(
  episodeId: string,
  quality: string = '1080p',
  userId?: string
): string {
  const token = generateSecureVideoToken(episodeId, quality, userId)
  return `/api/video/secure?token=${token}`
}

/**
 * 🕒 Utilitário para formatar tempo de expiração
 */
export function getTokenExpirationInfo(token: string): string {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    const expiresIn = Math.max(0, decoded.expiresAt - Date.now())
    const minutes = Math.ceil(expiresIn / 60000)
    return `${minutes} minutos`
  } catch {
    return 'Desconhecido'
  }
}