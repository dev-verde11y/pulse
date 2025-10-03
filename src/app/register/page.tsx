'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

function RegisterContent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Captura query params
  const selectedPlan = searchParams.get('plan')
  const shouldRedirectToCheckout = searchParams.get('redirect') === 'checkout'

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 12) {
      newErrors.password = 'Senha deve ter pelo menos 12 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Senha deve conter letras maiúsculas, minúsculas e números'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!agreedToTerms) {
      newErrors.general = 'Você deve aceitar os Termos de Uso'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsRegistering(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Erro ao criar conta' })
        setIsRegistering(false)
        return
      }

      // Sucesso - redireciona conforme configuração
      if (shouldRedirectToCheckout && selectedPlan) {
        // Faz login automático e redireciona para checkout
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        })

        if (loginResponse.ok) {
          router.push(`/checkout?plan=${selectedPlan}`)
        } else {
          router.push(`/login?registered=true&plan=${selectedPlan}`)
        }
      } else {
        // Fluxo normal - redireciona para login
        router.push('/login?registered=true')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Erro ao conectar com o servidor' })
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/20 via-transparent to-gray-800/20"></div>

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <span className="text-6xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  PULSE
                </span>
              </Link>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight text-white">
                  Comece sua{' '}
                  <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    jornada anime
                  </span>
                </h1>

                <p className="text-xl text-gray-400 leading-relaxed">
                  7 dias grátis para explorar milhares de títulos em alta qualidade.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 text-left bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">7 Dias Grátis</h3>
                  <p className="text-sm text-gray-400">Teste todos os recursos premium sem compromisso</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-left bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎬</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Acesso Completo</h3>
                  <p className="text-sm text-gray-400">Todo catálogo disponível em HD e 4K</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-left bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🚫</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Sem Anúncios</h3>
                  <p className="text-sm text-gray-400">Maratone sem interrupções</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  PULSE
                </span>
              </Link>
              <p className="text-sm text-gray-400 mt-2">O maior acervo de anime</p>
            </div>

            {/* Register Card */}
            <div className="bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 rounded-3xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {selectedPlan ? 'Quase lá!' : 'Crie sua conta'}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    {selectedPlan ? (
                      <>Crie sua conta para continuar com o pagamento</>
                    ) : (
                      <>Comece agora com <span className="font-bold text-orange-400">7 dias grátis</span></>
                    )}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-200 block">
                      Nome Completo
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        autoComplete="name"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
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
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
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

                  {/* Password Field */}
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
                        placeholder="Mínimo 12 caracteres"
                        autoComplete="new-password"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-200 block">
                      Confirmar Senha
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        autoComplete="new-password"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm sm:text-base"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-600 text-orange-600 focus:ring-orange-500 bg-gray-700"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                      Eu concordo com os{' '}
                      <Link href="/terms" className="text-orange-400 hover:text-orange-300 font-semibold">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link href="/privacy" className="text-orange-400 hover:text-orange-300 font-semibold">
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>

                  {errors.general && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{errors.general}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="relative w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>

                    {isRegistering ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-base">Criando conta...</span>
                      </>
                    ) : (
                      <span className="text-base sm:text-lg font-black relative z-10">
                        {selectedPlan ? 'Criar Conta e Continuar' : 'Começar 7 Dias Grátis'}
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-6 sm:mt-8 text-center space-y-4">
                  <p className="text-gray-300 text-sm">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-all duration-300 hover:underline">
                      Faça login
                    </Link>
                  </p>

                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400">
                      Ao criar sua conta, você recebe <span className="font-semibold text-orange-400">7 dias de acesso gratuito</span> a todos os recursos premium. Cancele quando quiser.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 space-y-2">
              <p>© {new Date().getFullYear()} Pulse Anime. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
