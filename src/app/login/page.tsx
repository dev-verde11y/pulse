'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { AuthResponse, SubscriptionInfo } from '@/types/auth'

interface Plan {
  id: string
  name: string
  price: number
  description?: string
  billingCycle?: string
}

function LoginContent() {
  // Inicializa email com valor do localStorage se existir
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

  const { login, logout, loading, error, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verifica se veio da página de registro ou reset de senha
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }

    if (searchParams.get('reset') === 'success') {
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
  }, [searchParams])

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user && !loading && !showRenewalModal) {
      router.push('/dashboard')
    }
  }, [user, loading, router, showRenewalModal])

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showRenewalModal) {
        setShowRenewalModal(false)
        logout()
      }
    }

    if (showRenewalModal) {
      document.addEventListener('keydown', handleKeyDown)
      // Previne scroll do body quando modal está aberto
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

    if (!validateForm()) {
      return
    }

    setIsLogging(true)

    try {
      const response: AuthResponse = await login(email, password)

      // Salva ou remove email do localStorage baseado em "Lembrar-me"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      // Verifica se precisa mostrar modal de renovação
      if (response.subscriptionInfo?.showRenewalModal) {
        setRenewalInfo(response.subscriptionInfo)
        setShowRenewalModal(true)
        setIsLogging(false)
        return // Não redireciona, fica na página com o modal
      } else {
        // Login normal - redireciona para dashboard
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de renovação')
      }

      // Redireciona para o Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Renewal error:', error)
      alert('Erro ao processar renovação. Tente novamente.')
      setIsRenewing(false)
      setSelectedPlanForRenewal(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Anime-inspired Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-blue-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

        {/* Animated gradient orbs - Blue theme */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/15 to-cyan-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-indigo-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Anime-style floating elements */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400/60 rounded-full blur-sm animate-float"></div>
        <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-cyan-400/40 rounded-full blur-sm animate-float-delayed"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-blue-300/50 rounded-full blur-sm animate-float"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="max-w-lg text-center space-y-10 relative z-10">
            {/* Logo Section */}
            <div className="space-y-8">
              <Link href="/" className="inline-flex items-baseline space-x-2 group">
                <span className="text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  PULSE
                </span>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  ANIME
                </span>
              </Link>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight text-white">
                  Plataforma de{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    streaming
                  </span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed">
                  Seus animes favoritos em HD+ com legendas e dublagens de qualidade.
                </p>
              </div>
            </div>

            {/* Anime Features Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="group bg-gradient-to-br from-blue-900/30 to-slate-800/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">15K+</div>
                <div className="text-sm text-gray-300 font-semibold">Títulos Disponíveis</div>
              </div>
              <div className="group bg-gradient-to-br from-blue-900/30 to-slate-800/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">HD+</div>
                <div className="text-sm text-gray-300 font-semibold">Alta Qualidade</div>
              </div>
              <div className="group bg-gradient-to-br from-blue-900/30 to-slate-800/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">∞</div>
                <div className="text-sm text-gray-300 font-semibold">Acesso Completo</div>
              </div>
              <div className="group bg-gradient-to-br from-blue-900/30 to-slate-800/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-300 font-semibold">Disponível</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full space-y-6 sm:space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <Link href="/" className="inline-flex items-baseline space-x-1.5 group">
                <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  PULSE
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ANIME
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-2">Plataforma de streaming</p>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-xl flex items-center animate-fade-in">
                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  {searchParams.get('registered') === 'true' ? (
                    <>
                      <p className="font-semibold">Conta criada com sucesso!</p>
                      <p className="text-green-400/80 text-xs mt-0.5">Você ganhou 7 dias de acesso gratuito. Faça login para começar.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Senha redefinida com sucesso!</p>
                      <p className="text-green-400/80 text-xs mt-0.5">Faça login com sua nova senha.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Login Card */}
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-900/20 p-6 sm:p-8 relative overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-600/5 rounded-3xl"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">Acesse sua conta</p>
                </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-200 block">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="w-full bg-slate-800/50 border border-blue-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 focus:bg-slate-800/70 transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-200 block">
                    Senha
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      className="w-full bg-slate-800/50 border border-blue-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/60 focus:bg-slate-800/70 transition-all duration-300 text-sm sm:text-base"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-400 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-blue-500/50 text-blue-500 focus:ring-blue-500 bg-slate-800 mr-2 cursor-pointer"
                    />
                    <span className="group-hover:text-gray-300 transition-colors">Lembrar de mim</span>
                  </label>
                  <Link href="/forgot-password" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLogging}
                  className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>

                  {isLogging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base">Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base sm:text-lg font-black relative z-10">Entrar</span>
                    </>
                  )}
                </button>

              </form>

              <div className="mt-6 sm:mt-8 text-center space-y-4">
                <p className="text-gray-300 text-sm">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="text-blue-400 hover:text-cyan-400 font-bold transition-all duration-300 hover:underline">
                    Cadastre-se
                  </Link>
                </p>

                {/* Trial Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 text-xs text-gray-300">
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Novos usuários ganham <strong className="text-blue-400">7 dias grátis</strong> ao se cadastrar</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 space-y-2">
              <p>© {new Date().getFullYear()} Pulse. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Renovação de Assinatura */}
      {showRenewalModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            // Se clicar no fundo (não no modal), fecha e faz logout
            if (e.target === e.currentTarget) {
              setShowRenewalModal(false)
              logout()
            }
          }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* Botão Fechar */}
            <button
              onClick={() => {
                setShowRenewalModal(false)
                logout()
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6">
              {!showContactMessage ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`mx-auto w-16 h-16 ${renewalInfo?.isExpired ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'} rounded-full flex items-center justify-center mb-4`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {renewalInfo?.isExpired ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {renewalInfo?.isExpired ? 'Assinatura Expirada' : 'Período de Graça'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {renewalInfo?.isExpired 
                        ? renewalInfo.expiredWarning
                        : `${renewalInfo?.gracePeriodWarning} Você ainda pode usar a plataforma com algumas limitações.`
                      }
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Mensagem de Contato */}
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Entre em Contato
                    </h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                      <p className="text-gray-300 text-sm mb-3">
                        Para renovar sua assinatura, entre em contato conosco através dos canais oficiais.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {!showContactMessage ? (
                <>
                  {/* Informações da Situação */}
                  <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Status:</span>
                      <span className={`text-sm font-semibold ${renewalInfo?.isExpired ? 'text-red-400' : 'text-orange-400'}`}>
                        {renewalInfo?.isExpired ? 'Expirada' : 'Período de Graça'}
                      </span>
                    </div>
                    {renewalInfo?.graceDaysLeft && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">Dias restantes:</span>
                        <span className="text-orange-400 font-semibold text-sm">{renewalInfo.graceDaysLeft} dias</span>
                      </div>
                    )}
                    
                    {/* Limitações do período de graça */}
                    {!renewalInfo?.isExpired && renewalInfo?.isInGracePeriod && (
                      <div className="border-t border-gray-700 pt-3">
                        <div className="text-yellow-400 text-xs font-semibold mb-2">⚠️ Limitações Ativas:</div>
                        <div className="text-gray-400 text-xs space-y-1">
                          <div>• Qualidade limitada a HD</div>
                          <div>• Sem downloads offline</div>
                          <div>• Anúncios ocasionais</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="space-y-3">
                    {/* Botões de Renovação por Plano */}
                    {renewalInfo?.availablePlans && renewalInfo.availablePlans.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-white text-sm font-semibold mb-2">Escolha um plano para renovar:</p>
                        {renewalInfo.availablePlans.map((plan) => {
                          const typedPlan = plan as unknown as Plan
                          return (
                            <button
                              key={typedPlan.id}
                              onClick={() => handleRenewSubscription(typedPlan.id)}
                              disabled={isRenewing}
                              className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-between"
                            >
                              <div className="text-left">
                                <div className="font-bold">{typedPlan.name}</div>
                                <div className="text-xs opacity-80">{typedPlan.description}</div>
                              </div>
                              {isRenewing && selectedPlanForRenewal === typedPlan.id ? (
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <div className="font-black">R$ {Number(typedPlan.price).toFixed(2)}</div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowContactMessage(true)}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Renovar Assinatura
                      </button>
                    )}
                    {renewalInfo?.isExpired ? (
                      <button
                        onClick={() => {
                          setShowRenewalModal(false)
                          logout()
                        }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-all duration-300"
                      >
                        Cancelar e Sair
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowRenewalModal(false)
                          router.push('/dashboard')
                        }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-all duration-300"
                      >
                        Continuar com Acesso Limitado
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowRenewalModal(false)
                      logout()
                    }}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowContactMessage(false)
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-all duration-300"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}