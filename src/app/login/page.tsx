'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { AuthResponse, SubscriptionInfo, SubscriptionPlan } from '@/types/auth'



function LoginContent() {
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rememberedEmail') || ''
    }
    return ''
  })
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('rememberedEmail')
    }
    return false
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLogging, setIsLogging] = useState(false)
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [renewalInfo, setRenewalInfo] = useState<SubscriptionInfo | null>(null)
  const [showContactMessage, setShowContactMessage] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showPassword, setShowPassword] = useState(false)

  const { login, logout, loading, error, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
    if (searchParams.get('reset') === 'success') {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

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

  useEffect(() => {
    if (user && !loading && !showRenewalModal) {
      router.push('/dashboard')
    }
  }, [user, loading, router, showRenewalModal])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showRenewalModal) {
        setShowRenewalModal(false)
        logout()
      }
    }
    if (showRenewalModal) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showRenewalModal, logout])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLogging(true)
    try {
      const response: AuthResponse = await login(email, password)
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      if (response.subscriptionInfo?.showRenewalModal) {
        setRenewalInfo(response.subscriptionInfo)
        setShowRenewalModal(true)
        setIsLogging(false)
      } else {
        await new Promise(resolve => setTimeout(resolve, 300))
        router.replace('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setIsLogging(false)
    }
  }

  const handleRenewSubscription = async (planId: string) => {
    setIsRenewing(true)
    setSelectedPlanForRenewal(planId)
    try {
      const response = await fetch('/api/checkout/renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erro ao criar sessão de renovação')
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Renewal error:', error)
      alert('Erro ao processar renovação. Tente novamente.')
      setIsRenewing(false)
      setSelectedPlanForRenewal(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
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

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-4 animate-fade-in opacity-0">
          <Link href="/" className="inline-flex items-baseline space-x-2 group">
            <span className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PULSE
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ANIME
            </span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
            <p className="text-gray-400 text-sm">Seu acervo digital de animes em alta qualidade</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-2xl flex items-center animate-fade-in text-sm">
            <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">{searchParams.get('registered') === 'true' ? 'Conta criada com sucesso!' : 'Senha redefinida!'}</p>
            </div>
          </div>
        )}

        {/* Login Form Card */}
        <div
          className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 animate-slide-up opacity-0"
          style={{ animationDelay: '200ms' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] transition-all duration-300"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">Senha</label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-blue-500 mr-2"
                />
                Lembrar de mim
              </label>
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Esqueceu a senha?</Link>
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm italic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLogging}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
            >
              {isLogging ? <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Entrando...</span> : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta? <Link href="/register" className="text-white font-bold hover:underline">Cadastre-se</Link>
            </p>
          </div>
        </div>

        <div
          className="text-center text-gray-600 text-[10px] uppercase tracking-widest animate-fade-in opacity-0"
          style={{ animationDelay: '400ms' }}
        >
          © {new Date().getFullYear()} Pulse. Todos os direitos reservados.
        </div>

        {/* Renewal Modal */}
        {showRenewalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center space-y-6">
              <h3 className="text-2xl font-bold text-white">
                {renewalInfo?.isExpired ? 'Assinatura Expirada' : 'Período de Graça'}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {renewalInfo?.isExpired ? renewalInfo?.expiredWarning : renewalInfo?.gracePeriodWarning}
              </p>
              <div className="space-y-3">
                {renewalInfo?.availablePlans?.map((plan: SubscriptionPlan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleRenewSubscription(plan.id)}
                    disabled={isRenewing}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Renovar - R$ {Number(plan.price).toFixed(2)}
                  </button>
                ))}
                <button
                  onClick={() => { setShowRenewalModal(false); logout(); }}
                  className="w-full text-gray-500 text-sm hover:text-white transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center opacity-50">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}