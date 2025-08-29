interface RateLimitInfo {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitInfo> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 requests per 15 minutes
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isRateLimited(identifier: string): { limited: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now()
    const requestInfo = this.requests.get(identifier)

    // Se não existe ou o tempo expirou, inicia novo window
    if (!requestInfo || now > requestInfo.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return { limited: false, remaining: this.maxRequests - 1 }
    }

    // Incrementa contador
    requestInfo.count++

    // Verifica se excedeu o limite
    if (requestInfo.count > this.maxRequests) {
      return { 
        limited: true, 
        resetTime: requestInfo.resetTime,
        remaining: 0
      }
    }

    return { 
      limited: false, 
      remaining: this.maxRequests - requestInfo.count 
    }
  }

  // Limpa entradas expiradas (executar periodicamente)
  cleanup() {
    const now = Date.now()
    for (const [key, info] of this.requests.entries()) {
      if (now > info.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Instância global para login
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 tentativas por 15 minutos

// Instância global para registro
export const registerRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 tentativas por hora

// Cleanup automático a cada 30 minutos
setInterval(() => {
  loginRateLimiter.cleanup()
  registerRateLimiter.cleanup()
}, 30 * 60 * 1000)