'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatPrice as formatCurrency } from '@/lib/payments/plan-config'

function formatPrice(amount: number) {
  const formatted = formatCurrency(amount)
  return formatted
}

interface UserSubscription {
  id: string
  planType: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt?: Date
  externalId?: string
  plan: {
    name: string
    price: number
    billingCycle: string
    features: string[]
  }
}

interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: string
  paidAt?: Date
  createdAt: Date
}

function getMoonPhaseName(planType: string) {
  const plans = {
    'FREE': 'Aventureiro',
    'FAN': 'Cavaleiro',
    'MEGA_FAN': 'Titã',
    'MEGA_FAN_ANNUAL': 'Titã Anual'
  }
  return plans[planType as keyof typeof plans] || planType
}

function getMoonPhaseIcon(planType: string) {
  const icons = {
    'FREE': '🛡️',
    'FAN': '⚔️',
    'MEGA_FAN': '👑',
    'MEGA_FAN_ANNUAL': '💎'
  }
  return icons[planType as keyof typeof icons] || '✨'
}

function getStatusColor(status: string) {
  const colors = {
    'active': 'text-green-400 bg-green-400/10 border-green-400/20',
    'trialing': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'canceled': 'text-red-400 bg-red-400/10 border-red-400/20',
    'past_due': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'incomplete': 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
  return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
}

function formatStatus(status: string) {
  const statusMap = {
    'active': 'Ativa',
    'trialing': 'Período Gratuito',
    'canceled': 'Cancelada',
    'past_due': 'Pagamento Pendente',
    'incomplete': 'Incompleta'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

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

export default function SubscriptionDashboard() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubscriptionData() {
      if (!user) return

      try {
        // Load subscription
        const subResponse = await fetch('/api/subscription/current')
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData)
        }

        // Load payment history
        const payResponse = await fetch('/api/payments/history')
        if (payResponse.ok) {
          const payData = await payResponse.json()
          setPayments(payData.payments || [])
        }

        // Load available plans (excluindo FREE)
        const plansResponse = await fetch('/api/plans')
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          const paidPlans = (plansData.plans || []).filter((p: Plan) => p.type !== 'FREE')
          setAvailablePlans(paidPlans)
        }
      } catch (error) {
        console.error('Erro ao carregar dados da assinatura:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionData()
  }, [user])

  const handleSubscribeToPlan = async (planId: string) => {
    setProcessingPlan(planId)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout')
      }

      // Redireciona para Stripe
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Erro ao processar assinatura:', error)
      alert('Erro ao processar assinatura. Tente novamente.')
      setProcessingPlan(null)
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-gray-400">Você precisa estar logado para ver esta página.</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-medium">Carregando sua assinatura...</div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-blue-600/5 to-cyan-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Minha <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Assinatura</span>
              </h1>
              <p className="text-gray-400 text-lg">Gerencie sua jornada e evolução no Pulse</p>
            </div>

            {/* Current Subscription Card */}
            {subscription ? (
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/30 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">{getMoonPhaseIcon(subscription.planType)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {getMoonPhaseName(subscription.planType)}
                      </h2>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subscription.status)}`}>
                        {formatStatus(subscription.status)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">
                      {formatPrice(subscription.plan.price)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      /{subscription.plan.billingCycle === 'MONTHLY' ? 'mês' : 'ano'}
                    </div>
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Período Atual</h3>
                    <p className="text-white">
                      {new Date(subscription.currentPeriodStart).toLocaleDateString('pt-BR')} - {' '}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      {subscription.cancelAt ? 'Cancela em' : 'Próxima Cobrança'}
                    </h3>
                    <p className="text-white">
                      {subscription.cancelAt
                        ? new Date(subscription.cancelAt).toLocaleDateString('pt-BR')
                        : new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
                      }
                    </p>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Recursos do seu plano</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-purple-400/20 text-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // No Subscription State (FREE users)
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-400/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🌙</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Nenhuma Assinatura Ativa</h2>
                <p className="text-gray-400">Escolha sua classe para começar sua jornada</p>
              </div>
            )}

            {/* Available Plans Section - Sempre visível para FREE */}
            {!subscription && availablePlans.length > 0 && (
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Planos Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white/[0.02] border rounded-xl p-4 transition-all hover:scale-[1.02] ${plan.popular
                          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-pink-600 px-3 py-0.5 rounded-full text-xs font-bold">
                          MAIS POPULAR
                        </div>
                      )}

                      <div className="text-center mb-3">
                        <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                        <p className="text-gray-400 text-xs mb-3">{plan.description}</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            R$ {Number(plan.price).toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-xs">
                            /{plan.billingCycle === 'MONTHLY' ? 'mês' : 'ano'}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 mb-4">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => handleSubscribeToPlan(plan.id)}
                        disabled={processingPlan === plan.id}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${plan.popular
                            ? 'bg-gradient-to-r from-orange-600 to-pink-600 hover:opacity-90'
                            : 'bg-gray-700 hover:bg-gray-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingPlan === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                          </span>
                        ) : (
                          'Assinar Agora'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Histórico de Pagamentos</h3>

              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${payment.status === 'completed' ? 'bg-green-400' :
                            payment.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                        <div>
                          <p className="text-white font-medium">
                            R$ {payment.amount.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString('pt-BR')
                              : new Date(payment.createdAt).toLocaleDateString('pt-BR')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'completed' ? 'text-green-400 bg-green-400/10' :
                            payment.status === 'failed' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'
                          }`}>
                          {payment.status === 'completed' ? 'Pago' :
                            payment.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-400/30 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Nenhum Pagamento</h4>
                  <p className="text-gray-400">Seus pagamentos aparecerão aqui quando você tiver uma assinatura ativa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}