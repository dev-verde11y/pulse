// Payment utilities and types
export { stripe } from '../stripe'

// Re-export types
export * from './types'

// Legacy types (deprecated - use types.ts instead)
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

export interface SubscriptionData {
  userId: string
  subscriptionId: string
  priceId: string
  status: 'active' | 'canceled' | 'expired'
  currentPeriodStart: Date
  currentPeriodEnd: Date
}