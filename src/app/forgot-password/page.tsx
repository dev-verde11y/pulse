'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const validateForm = () => {
    if (!email) {
      setError('Email é obrigatório')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email de recuperação')
      }

      setEmailSent(true)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar solicitação')
    } finally {
      setIsSubmitting(false)
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-baseline space-x-2 group">
              <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PULSE
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ANIME
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-900/20 p-6 sm:p-8 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-600/5 rounded-3xl"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              {!emailSent ? (
                <>
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      Esqueceu sua senha?
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Digite seu email e enviaremos um link para redefinir sua senha
                    </p>
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
                      {error && (
                        <p className="text-sm text-red-400 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group overflow-hidden"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>

                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-base">Enviando...</span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg font-black relative z-10">Enviar Link de Recuperação</span>
                      )}
                    </button>

                    <div className="text-center">
                      <Link href="/login" className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para o login
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Success Message */}
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Email Enviado!</h3>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Enviamos um link de recuperação para <strong className="text-blue-400">{email}</strong>
                      </p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-gray-300">
                      <p className="mb-2">
                        <strong className="text-blue-400">Próximos passos:</strong>
                      </p>
                      <ul className="text-left space-y-1 ml-4">
                        <li>• Verifique sua caixa de entrada</li>
                        <li>• Clique no link de recuperação</li>
                        <li>• Crie uma nova senha</li>
                      </ul>
                    </div>

                    <div className="text-xs text-gray-400">
                      O link expira em 1 hora
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEmailSent(false)
                          setEmail('')
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all duration-300"
                      >
                        Enviar Novamente
                      </button>
                      <Link
                        href="/login"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-300 text-center"
                      >
                        Voltar ao Login
                      </Link>
                    </div>
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
