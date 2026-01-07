import { PlanType } from "@prisma/client"

export interface CheckoutSessionOptions {
    userId: string
    email: string
    planType: PlanType
    priceId: string
    mode: 'subscription' | 'payment'
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
}

export interface CheckoutSessionResponse {
    id: string
    url: string | null
    provider: string
}

export interface WebhookVerificationResult {
    isValid: boolean
    event: any // Provider-specific event object
}

export interface PaymentProvider {
    readonly name: string

    /**
     * Create a checkout session for the gateway
     */
    createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse>

    /**
     * Verify then construct the webhook event
     */
    verifyWebhook(body: string, signature: string, secret: string): Promise<WebhookVerificationResult>

    /**
     * Parse a verified event into a standardized format if possible
     * or return the raw event for the gateway's specific handler
     */
    parseEvent(event: any): { type: string; data: any }
}
