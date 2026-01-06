'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

function RegisterContent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
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
            <h1 className="text-2xl font-bold text-white">
              {selectedPlan ? 'Finalize sua assinatura' : 'Crie sua conta'}
            </h1>
            <p className="text-gray-400 text-sm">
              {selectedPlan ? 'Mais um passo para o seu acervo digital' : 'Seu acervo digital de animes em alta qualidade'}
            </p>
          </div>
        </div>

        {/* Register Form Card */}
        <div
          className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 animate-slide-up opacity-0 shadow-2xl"
          style={{ animationDelay: '200ms' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] transition-all duration-300"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.name}</p>}
            </div>

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
                  placeholder="No mínimo 12 caracteres"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 ml-1">Confirmar Senha</label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex flex-col space-y-4">
              <label className="flex items-start text-xs text-gray-400 cursor-pointer px-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-blue-500 mr-3 mt-0.5"
                />
                <span>
                  Eu concordo com os{' '}
                  <Link href="/terms" className="text-blue-400 hover:underline">Termos de Uso</Link>
                  {' '}e{' '}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacidade</Link>
                </span>
              </label>
            </div>

            {errors.general && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm italic">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              {isRegistering ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </span>
              ) : (
                selectedPlan ? 'Criar conta e pagar' : 'Começar 7 dias grátis'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta? <Link href="/login" className="text-white font-bold hover:underline">Entre agora</Link>
            </p>
          </div>
        </div>

        <div
          className="text-center text-gray-600 text-[10px] uppercase tracking-widest animate-fade-in opacity-0"
          style={{ animationDelay: '400ms' }}
        >
          © {new Date().getFullYear()} Pulse. Todos os direitos reservados.
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
