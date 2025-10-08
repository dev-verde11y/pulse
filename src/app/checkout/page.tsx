'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  type: string
  price: number
  description: string
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan')

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!planType) {
      router.push('/plans')
      return
    }

    fetchPlan()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType])

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plans')
      const data = await response.json()

      const selectedPlan = data.plans?.find((p: Plan) => p.type === planType?.toUpperCase())

      if (!selectedPlan) {
        setError('Plano não encontrado')
        setLoading(false)
        return
      }

      setPlan(selectedPlan)
    } catch (err) {
      console.error('Error fetching plan:', err)
      setError('Erro ao carregar plano')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!plan) return

    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      // Redireciona para o Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      const error = err as Error
      console.error('Checkout error:', error)
      setError(error.message || 'Erro ao processar pagamento')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando plano...</div>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link href="/plans" className="text-orange-400 hover:text-orange-300">
            Voltar para planos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            PULSE
          </Link>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h1 className="text-3xl font-bold mb-8 text-center">Confirmar Assinatura</h1>

            {plan && (
              <>
                {/* Plan Summary */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <p className="text-gray-400 mt-1">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        R$ {Number(plan.price).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">por mês</div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Pagamento seguro processado via Stripe</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Cancele quando quiser, sem compromisso</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Acesso imediato a todo o catálogo</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    'Continuar para Pagamento'
                  )}
                </button>

                <p className="text-center text-sm text-gray-400 mt-4">
                  Você será redirecionado para o Stripe para completar o pagamento de forma segura
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
