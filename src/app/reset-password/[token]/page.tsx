'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
  params: {
    token: string
  }
}

export default function ResetPasswordPage({ params }: PageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()

  // Validação de senha
  const validatePassword = (pass: string) => {
    if (pass.length < 12) {
      return 'A senha deve ter pelo menos 12 caracteres'
    }
    if (!/[A-Z]/.test(pass)) {
      return 'A senha deve conter pelo menos uma letra maiúscula'
    }
    if (!/[a-z]/.test(pass)) {
      return 'A senha deve conter pelo menos uma letra minúscula'
    }
    if (!/[0-9]/.test(pass)) {
      return 'A senha deve conter pelo menos um número'
    }
    return null
  }

  // Verifica se o token é válido ao carregar a página
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: params.token }),
        })

        setTokenValid(response.ok)
      } catch (error) {
        console.error('Token verification error:', error)
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [params.token])

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    const passwordError = validatePassword(password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha')
      }

      setResetSuccess(true)

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)

    } catch (err) {
      console.error('Reset password error:', err)
      setErrors({
        general: err instanceof Error ? err.message : 'Erro ao processar solicitação'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Verificando token...</p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-gray-900"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-3">Link Inválido ou Expirado</h2>
              <p className="text-gray-300 mb-6">
                Este link de recuperação de senha não é válido ou já expirou.
              </p>

              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300"
                >
                  Solicitar Novo Link
                </Link>
                <Link
                  href="/login"
                  className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  Voltar ao Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="Logo Pulse"
                  width={60}
                  height={60}
                  className="rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PULSE
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 rounded-3xl"></div>

            <div className="relative z-10">
              {!resetSuccess ? (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      Nova Senha
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Crie uma senha segura para sua conta
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-semibold text-gray-200 block">
                        Nova Senha
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
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <p>• Mínimo 12 caracteres</p>
                        <p>• Letras maiúsculas e minúsculas</p>
                        <p>• Pelo menos um número</p>
                      </div>
                    </div>

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
                          placeholder="Digite a senha novamente"
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
                      disabled={isSubmitting}
                      className="relative w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group overflow-hidden"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>

                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-base">Redefinindo...</span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg font-black relative z-10">Redefinir Senha</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Success Message */}
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Senha Redefinida!</h3>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Sua senha foi alterada com sucesso.
                      </p>
                    </div>

                    <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-sm text-gray-300">
                      Você será redirecionado para a página de login em instantes...
                    </div>

                    <Link
                      href="/login"
                      className="block w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all duration-300"
                    >
                      Ir para Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Pulse. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
