// Payment API utilities
export const PAYMENT_ROUTES = {
  CREATE_CHECKOUT: '/api/payments/create-checkout',
  WEBHOOK: '/api/payments/webhook', 
  STRIPE_INFO: '/api/payments/stripe-info'
} as const

export const PAYMENT_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted'
} as const