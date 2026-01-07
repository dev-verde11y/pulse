import { PaymentProvider, CheckoutSessionOptions, CheckoutSessionResponse, WebhookVerificationResult } from "../gateway-interface"
import { stripe } from "../../stripe"
import Stripe from "stripe"

export class StripeGateway implements PaymentProvider {
    readonly name = 'Stripe'

    async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse> {
        const session = await stripe.checkout.sessions.create({
            mode: options.mode,
            customer_email: options.email,
            client_reference_id: options.userId,
            line_items: [
                {
                    price: options.priceId,
                    quantity: 1,
                },
            ],
            success_url: options.successUrl,
            cancel_url: options.cancelUrl,
            metadata: {
                ...options.metadata,
                userId: options.userId,
                planType: options.planType
            },
        })

        return {
            id: session.id,
            url: session.url,
            provider: this.name
        }
    }

    async verifyWebhook(body: string, signature: string, secret: string): Promise<WebhookVerificationResult> {
        try {
            const event = stripe.webhooks.constructEvent(body, signature, secret)
            return { isValid: true, event }
        } catch (err) {
            console.error(`[${this.name}] Webhook verification failed:`, err)
            return { isValid: false, event: null }
        }
    }

    parseEvent(event: Stripe.Event) {
        return {
            type: event.type,
            data: event.data.object
        }
    }

    // Helper for direct retrieval if needed
    async retrieveSession(sessionId: string) {
        return await stripe.checkout.sessions.retrieve(sessionId)
    }

    async retrieveSubscription(subscriptionId: string) {
        return await stripe.subscriptions.retrieve(subscriptionId)
    }
}
