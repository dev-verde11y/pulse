'use client'

import { useState } from 'react'

interface StripeCheckoutButtonProps {
  priceId: string
  planName: string
  mode?: 'subscription' | 'payment'
  className?: string
}

export function StripeCheckoutButton({ 
  priceId, 
  planName, 
  mode = 'subscription',
  className = ''
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Checkout error response:', errorData)
        throw new Error(errorData.details || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }

    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? 'Processando...' : `Assinar ${planName}`}
    </button>
  )
}