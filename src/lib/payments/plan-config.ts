// Centralized plan configuration
export const STRIPE_PLANS = {
  ADVENTURER: {
    priceId: process.env.STRIPE_FAN_PRICE_ID || 'price_1S5nLD91l9itSVBOCQpvSL1R',
    name: 'Cavaleiro',
    phase: 'Rising Knight',
    amount: 14.99,
    currency: 'BRL',
    interval: 'month',
    planType: 'ADVENTURER' as const,
    features: [
      'Sem anúncios',
      'HD Quality',
      '1 tela simultânea'
    ],
    icon: '⚔️',
    color: 'blue'
  },

  HERO: {
    priceId: process.env.STRIPE_MEGA_FAN_PRICE_ID || 'price_1S5rQZ91l9itSVBOIF3iJBPH',
    name: 'Titã',
    phase: 'Divine Power',
    amount: 19.99,
    currency: 'BRL',
    interval: 'month',
    planType: 'HERO' as const,
    features: [
      'Tudo do Cavaleiro',
      '4K Ultra HD',
      '4 telas simultâneas',
      'Download offline',
      'Game Vault'
    ],
    icon: '👑',
    color: 'purple',
    popular: true
  },

  LEGEND: {
    priceId: process.env.STRIPE_MEGA_FAN_ANNUAL_PRICE_ID || 'price_1S5nOM91l9itSVBOqsJ2vJQU',
    name: 'Titã Anual',
    phase: 'Legendary Soul',
    amount: 199.99,
    currency: 'BRL',
    interval: 'year',
    planType: 'LEGEND' as const,
    features: [
      'Tudo do Titã',
      'Pagamento anual',
      'R$ 16,66/mês',
      'Suporte prioritário'
    ],
    icon: '💎',
    color: 'green',
    savings: '16%'
  }
} as const

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [key, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceId === priceId) {
      return { key, ...plan }
    }
  }
  return null
}

// Helper function to format price
export function formatPrice(amount: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Legacy mapping for backward compatibility
export const LEGACY_PRICE_MAPPING = {
  [process.env.STRIPE_PRICE_ID || '']: 'ADVENTURER',
  [process.env.STRIPE_SUBSCRIPTION_PRICE_ID || '']: 'LEGEND'
} as const