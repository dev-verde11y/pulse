'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { SimpleFooter } from '@/components/layout/SimpleFooter'
import { STRIPE_PLANS } from '@/lib/payments/plan-config'
import { RevealSection } from '@/components/ui/RevealSection'

interface PlanData {
  id: string
  name: string
  type: string
  price: number
  billingCycle: string
  description: string
  features: string[]
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planTypeParam = searchParams.get('plan')?.toUpperCase()

  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'pix'>('stripe')

  const isValidPlan = planTypeParam && planTypeParam in STRIPE_PLANS
  const planConfig = isValidPlan ? STRIPE_PLANS[planTypeParam as keyof typeof STRIPE_PLANS] : null

  useEffect(() => {
    if (!planTypeParam) {
      router.push('/pricing')
      return
    }

    fetchPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planTypeParam])

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plans')
      const data = await response.json()

      const selectedPlan = data.plans?.find((p: PlanData) => p.type === planTypeParam)

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
      // Usando o novo endpoint que agora aceita o provedor (embora fixo em stripe por enquanto no Manager)
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: planConfig?.priceId || plan.id,
          mode: plan.type === 'MEGA_FAN_ANNUAL' ? 'subscription' : 'subscription', // Ajustar conforme necessário
          provider: selectedGateway
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout')
      }

      // Redireciona para a URL do gateway (Stripe ou futura url de Pix)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const error = err as Error
      console.error('Checkout error:', error)
      setError(error.message || 'Erro ao processar pagamento')
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Invocando detalhes do plano..." />
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-gray-900/50 backdrop-blur-xl p-12 rounded-3xl border border-red-500/20 max-w-lg">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Falha na Conexão</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link href="/pricing" className="inline-block bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors">
            Voltar para Planos
          </Link>
        </div>
      </div>
    )
  }

  // Cores dinâmicas baseadas no plano
  const getThemeColor = () => {
    switch (planTypeParam) {
      case 'FAN': return 'from-blue-600 to-cyan-500'
      case 'MEGA_FAN': return 'from-purple-600 to-pink-500'
      case 'MEGA_FAN_ANNUAL': return 'from-emerald-600 to-teal-500'
      default: return 'from-orange-600 to-pink-600'
    }
  }

  const getBorderColor = () => {
    switch (planTypeParam) {
      case 'FAN': return 'border-blue-500/30'
      case 'MEGA_FAN': return 'border-purple-500/30'
      case 'MEGA_FAN_ANNUAL': return 'border-emerald-500/30'
      default: return 'border-orange-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br ${getThemeColor()} opacity-[0.07] blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr ${getThemeColor()} opacity-[0.05] blur-[100px]`} />
      </div>

      {/* Header Simples */}
      <header className="relative z-50 pt-12 text-center mb-16 px-4">
        <RevealSection>
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
              PULSE
            </span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Forje sua <span className={`bg-gradient-to-r ${getThemeColor()} bg-clip-text text-transparent`}>Jornada</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Confirme os detalhes da sua classe e prepare-se para entrar no reino.
          </p>
        </RevealSection>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-32">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Coluna Esquerda: Detalhes do Plano */}
          <div className="lg:col-span-7 space-y-6">
            <RevealSection delay="delay-100">
              <div className={`bg-gray-900/40 backdrop-blur-2xl rounded-3xl p-8 border ${getBorderColor()} relative overflow-hidden group`}>
                {/* Glow interativo */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColor()} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
                  <div className="flex gap-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getThemeColor()} flex items-center justify-center text-3xl shadow-lg shadow-black/50`}>
                      {planConfig?.icon || '🛡️'}
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1 block">
                        CLASSE SELECIONADA
                      </span>
                      <h2 className="text-3xl font-black mb-1">{plan?.name || planConfig?.name}</h2>
                      <p className="text-gray-400 font-medium italic">&quot;{planConfig?.phase || 'Pronto para a Batalha'}&quot;</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-black bg-gradient-to-r ${getThemeColor()} bg-clip-text text-transparent`}>
                      R$ {plan?.price.toFixed(2)}
                    </div>
                    <div className="text-xs font-bold text-gray-500 tracking-widest mt-1 uppercase">
                      {plan?.billingCycle === 'ANNUALLY' ? 'PAGAMENTO ÚNICO ANUAL' : 'RECORRÊNCIA MENSAL'}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 grid sm:grid-cols-2 gap-4">
                  {plan?.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getThemeColor()} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
                      <span className="text-sm text-gray-300 group-hover/item:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay="delay-200">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-1">QUALIDADE</p>
                  <p className="font-bold">{planConfig?.planType === 'FAN' ? 'HD' : '4K HDR'}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-1">TELAS</p>
                  <p className="font-bold">{planConfig?.planType === 'FAN' ? '1 Tela' : '4 Telas'}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-1">OFFLINE</p>
                  <p className="font-bold">{planConfig?.planType === 'FAN' ? 'Não' : 'Sim'}</p>
                </div>
              </div>
            </RevealSection>
          </div>

          {/* Coluna Direita: Métodos de Pagamento e CTA */}
          <div className="lg:col-span-5">
            <RevealSection delay="delay-300">
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <span className={`w-1.5 h-6 bg-gradient-to-b ${getThemeColor()} rounded-full`} />
                  Escolha seu Caminho
                </h3>

                <div className="space-y-4 mb-8">
                  {/* Stripe Option */}
                  <button
                    onClick={() => setSelectedGateway('stripe')}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${selectedGateway === 'stripe'
                      ? `bg-white text-black border-transparent scale-[1.02] shadow-xl shadow-white/10`
                      : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${selectedGateway === 'stripe' ? 'bg-black/5' : 'bg-white/5'}`}>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Cartão de Crédito</p>
                        <p className={`text-[10px] uppercase tracking-widest font-bold opacity-60`}>VIA STRIPE</p>
                      </div>
                    </div>
                    {selectedGateway === 'stripe' && (
                      <div className="bg-black text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Pix Placeholder */}
                  <div className="relative group/disabled">
                    <button
                      disabled
                      className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/5 cursor-not-allowed opacity-50 grayscale"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-black/20">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 12h6M12 9v6" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Pix Instantâneo</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-emerald-500">EM BREVE</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
                    <span className="mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className={`group relative w-full overflow-hidden bg-gradient-to-r ${getThemeColor()} text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        RECLAMANDO PODER...
                      </>
                    ) : (
                      <>
                        ATIVAR ASSINATURA
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>

                <p className="text-center text-[10px] text-gray-500 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                  Ao continuar, você concorda em iniciar sua jornada virtual. <br />
                  Acesso imediato garantido após sincronização do fluxo.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Sincronizando dimensões..." />}>
      <CheckoutContent />
    </Suspense>
  )
}
