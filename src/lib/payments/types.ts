import Stripe from 'stripe'

// Helper types for better type safety
export type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null
}

export type StripeCheckoutSession = Stripe.Checkout.Session & {
  subscription?: string | Stripe.Subscription | null
}

// Webhook event types  
export interface WebhookEventData {
  checkoutCompleted: {
    session: StripeCheckoutSession
  }
  paymentSucceeded: {
    invoice: StripeInvoiceWithSubscription
  }
  paymentFailed: {
    invoice: StripeInvoiceWithSubscription
  }
  subscriptionUpdated: {
    subscription: Stripe.Subscription
  }
  subscriptionDeleted: {
    subscription: Stripe.Subscription
  }
}

// Database subscription status mapping
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'GRACE_PERIOD'

export const mapStripeStatusToDb = (stripeStatus: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE'
    case 'canceled':
    case 'unpaid':
      return 'CANCELLED'
    case 'incomplete':
    case 'incomplete_expired':
    case 'past_due':
      return 'EXPIRED'
    case 'trialing':
      return 'ACTIVE'
    default:
      return 'PENDING'
  }
}