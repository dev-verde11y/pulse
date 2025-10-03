'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  type: string
  billingCycle: string
  price: number
  description: string
  features: string[]
  popular: boolean
}

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchPlans()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      setIsAuthenticated(response.ok)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planType: string) => {
    if (isAuthenticated) {
      // Se já está autenticado, vai direto pro checkout
      router.push(`/checkout?plan=${planType}`)
    } else {
      // Se não está autenticado, vai pro registro com o plano selecionado
      router.push(`/register?plan=${planType}&redirect=checkout`)
    }
  }

  const getBillingCycleText = (cycle: string) => {
    if (cycle === 'MONTHLY') return '/mês'
    if (cycle === 'ANNUALLY') return '/ano'
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando planos...</div>
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
          <div className="flex gap-4">
            <Link href="/browse" className="px-4 py-2 text-gray-300 hover:text-white transition">
              Catálogo
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-6 py-2 bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg hover:opacity-90 transition">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition">
                  Entrar
                </Link>
                <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-orange-600 to-pink-600 rounded-lg hover:opacity-90 transition">
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Acesso ilimitado a milhares de animes, filmes e séries. Cancele quando quiser.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-pink-600 px-6 py-1 rounded-full text-sm font-bold">
                    MAIS POPULAR
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      R$ {Number(plan.price).toFixed(2)}
                    </span>
                    <span className="text-gray-500">{getBillingCycleText(plan.billingCycle)}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    handleSelectPlan(plan.type)
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-600 to-pink-600 hover:opacity-90 shadow-lg shadow-orange-500/30'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  Assinar Agora
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / Info */}
        <div className="container mx-auto max-w-4xl px-4 mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-400">
            <div>
              <svg className="w-12 h-12 mx-auto mb-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h4 className="font-bold text-white mb-2">Pagamento Seguro</h4>
              <p>Processamento via Stripe, seus dados estão protegidos.</p>
            </div>
            <div>
              <svg className="w-12 h-12 mx-auto mb-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h4 className="font-bold text-white mb-2">Cancele Quando Quiser</h4>
              <p>Sem compromisso. Cancele sua assinatura a qualquer momento.</p>
            </div>
            <div>
              <svg className="w-12 h-12 mx-auto mb-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-bold text-white mb-2">Conteúdo Ilimitado</h4>
              <p>Acesso completo a todo catálogo de animes e séries.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
