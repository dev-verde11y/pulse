'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import Link from 'next/link'
import { AuthResponse, SubscriptionInfo } from '@/types/auth'
import '@/styles/login-animations.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLogging, setIsLogging] = useState(false)
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [renewalInfo, setRenewalInfo] = useState<SubscriptionInfo | null>(null)
  const [showContactMessage, setShowContactMessage] = useState(false)
  
  const { login, logout, loading, error, user } = useAuth()
  const router = useRouter()

  // Redireciona se já estiver logado (mas não se o modal de renovação estiver aberto)
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
    } else if (password.length < 12) {
      newErrors.password = 'Senha deve ter pelo menos 12 caracteres'
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Anime-inspired Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950/30 to-purple-950/20"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-cyan-500/10 animate-pulse"></div>
        
        {/* Floating anime-style elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce delay-700"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-cyan-400 rounded-full opacity-80 animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full opacity-50 animate-bounce delay-300"></div>
        
        {/* Large animated orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-600/5 to-pink-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 border border-blue-500/10 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border border-cyan-500/10 rotate-12 animate-spin-slow-reverse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="max-w-lg text-center space-y-10 relative z-10">
            {/* Logo Section */}
            <div className="space-y-8">
              <Link href="/" className="inline-flex items-center space-x-4 group">
                <div className="relative">
                  <Image
                    src="/images/logo.png"
                    alt="Logo Pulse"
                    width={80}
                    height={80}
                    className="rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient-x">
                  PULSE
                </span>
              </Link>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight">
                  O futuro do{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-gradient-x">
                    anime streaming
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed">
                  Mergulhe em mundos extraordinários com a melhor qualidade e experiência imersiva do universo anime.
                </p>
              </div>
            </div>

            {/* Modern Features Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="group bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 text-center hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">15K+</div>
                <div className="text-sm text-gray-300 font-semibold">Episódios de Anime</div>
              </div>
              <div className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 text-center hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">4K</div>
                <div className="text-sm text-gray-300 font-semibold">Ultra HD</div>
              </div>
              <div className="group bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">∞</div>
                <div className="text-sm text-gray-300 font-semibold">Acesso Ilimitado</div>
              </div>
              <div className="group bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 text-center hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-gray-300 font-semibold">Sempre Online</div>
              </div>
            </div>

            {/* Anime Characters Silhouettes */}
            <div className="absolute -right-20 top-0 opacity-5 pointer-events-none">
              <div className="w-64 h-96 bg-gradient-to-b from-blue-500 to-transparent transform rotate-12"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full space-y-6 sm:space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 group">
                <div className="relative">
                  <Image
                    src="/images/logo.png"
                    alt="Logo Pulse"
                    width={50}
                    height={50}
                    className="rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                  PULSE
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-2">O futuro do anime streaming</p>
            </div>

            {/* Login Card */}
            <div className="bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-100 mb-2">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">Entre no seu mundo de aventuras épicas</p>
                </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-200 block">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
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
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
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
                  <label className="flex items-center text-gray-400">
                    <input type="checkbox" className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700 mr-2" />
                    Lembrar de mim
                  </label>
                  <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
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
                  className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                  
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
                      <span className="text-base sm:text-lg font-black relative z-10">Entrar no Pulse ✨</span>
                    </>
                  )}
                </button>

              </form>

              <div className="mt-6 sm:mt-8 text-center space-y-4">
                <p className="text-gray-300 text-sm">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 font-bold transition-all duration-300 hover:underline">
                    Cadastre-se gratuitamente
                  </Link>
                </p>
                
                {/* Social proof */}
                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>500K+ usuários ativos</span>
                  </div>
                  <div className="w-1 h-4 bg-gray-600"></div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
                    <span>Certificado SSL</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 space-y-2">
              <p>© {new Date().getFullYear()} Pulse Streaming. Todos os direitos reservados.</p>
              <p className="text-gray-600">Feito com ❤️ para otakus do mundo todo</p>
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
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Entre em Contato
                    </h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                      <p className="text-gray-300 text-sm mb-3">
                        Para renovar sua assinatura, entre em contato conosco:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-cyan-400 font-semibold text-sm">suporte@pulse.com</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-green-400 font-semibold text-sm">(11) 99999-9999</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Nossa equipe responderá em até 24 horas úteis
                    </p>
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
                    <button
                      onClick={() => {
                        setShowContactMessage(true)
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Renovar Assinatura
                    </button>
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

                  {/* Planos Disponíveis (se houver) */}
                  {renewalInfo?.availablePlans && renewalInfo.availablePlans.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-semibold mb-3 text-sm">Planos Disponíveis:</h4>
                      <div className="space-y-2">
                        {renewalInfo.availablePlans.slice(0, 2).map((plan: any) => (
                          <div key={plan.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-white font-medium text-sm">{plan.name}</span>
                                <div className="text-xs text-gray-400">{plan.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold text-sm">R$ {plan.price}</div>
                                <div className="text-xs text-gray-400">
                                  {plan.billingCycle === 'MONTHLY' ? '/mês' : '/ano'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowRenewalModal(false)
                      logout()
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
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