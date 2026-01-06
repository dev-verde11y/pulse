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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    checkAuth()
    fetchPlans()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      setIsAuthenticated(response.ok)
    } catch {
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

  // RPG Theme Icon Mapping
  const getPlanIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('aventureiro')) return '🛡️'
    if (lowerName.includes('cavaleiro')) return '⚔️'
    if (lowerName.includes('titã')) return lowerName.includes('anual') ? '💎' : '👑'
    return '✨'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse font-medium">Carregando planos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {/* Background with Parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-blue-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)` }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000 transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePosition.x * -60}px, ${mousePosition.y * -60}px)` }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-50 animate-fade-in">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-baseline space-x-2 group">
            <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PULSE
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              ANIME
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/browse" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Catálogo
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all backdrop-blur-md">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Entrar
                </Link>
                <Link href="/register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all">
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 pt-12 pb-24">
        {/* Title Section */}
        <div className="text-center space-y-4 max-w-3xl mb-16 animate-fade-in opacity-0">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Escolha sua <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Classe</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium">
            Assista a tudo na Pulse com a melhor qualidade. Evolua sua experiência.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.filter(plan => Number(plan.price) > 0).map((plan, index) => {
              const isAnnual = plan.billingCycle === 'ANNUALLY'
              return (
                <div
                  key={plan.id}
                  className={`group relative bg-white/[0.02] backdrop-blur-2xl border ${isAnnual
                      ? 'border-cyan-500/30 shadow-[0_0_30px_rgba(8,145,178,0.1)]'
                      : plan.popular
                        ? 'border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.1)]'
                        : 'border-white/10'
                    } rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.04] animate-slide-up opacity-0 shadow-2xl shadow-black/50`}
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  {/* Badges */}
                  <div className="absolute -top-4 left-8">
                    {isAnnual ? (
                      <span className="bg-cyan-600 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-cyan-900/40">
                        Economize 16%
                      </span>
                    ) : plan.popular ? (
                      <span className="bg-blue-600 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-blue-900/40">
                        Mais Popular
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-8 flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                      <p className="text-gray-500 text-sm font-medium">{plan.description}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ {Number(plan.price).toFixed(2)}</span>
                    <span className="text-gray-500 text-sm font-medium">{getBillingCycleText(plan.billingCycle)}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300 text-sm font-medium leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.type)}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${isAnnual
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] text-white'
                        : 'bg-white text-black hover:bg-gray-200'
                      }`}
                  >
                    Assinar Agora
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info Grid */}
        <div
          className="container mx-auto max-w-4xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in opacity-0"
          style={{ animationDelay: '600ms' }}
        >
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2 text-sm">Pagamento Seguro</h4>
            <p className="text-gray-500 text-xs text-balance">Transações 100% protegidas via Stripe.</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2 text-sm">Sem Compromisso</h4>
            <p className="text-gray-500 text-xs text-balance">Cancele sua aventura online a qualquer momento.</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2 text-sm">Acesso Imediato</h4>
            <p className="text-gray-500 text-xs text-balance">Todo o catálogo liberado instantaneamente após o pagamento.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-12 border-t border-white/5 animate-fade-in opacity-0"
        style={{ animationDelay: '800ms' }}
      >
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Pulse. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
