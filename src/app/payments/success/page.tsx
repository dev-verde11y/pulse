'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { RevealSection } from '@/components/ui/RevealSection'
import { SimpleFooter } from '@/components/layout/SimpleFooter'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [dots, setDots] = useState('')

  // Efeito visual de "carregamento místico"
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-emerald-600/20 to-teal-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-green-600/10 to-emerald-500/5 blur-[100px]" />
      </div>

      <main className="flex-grow relative z-10 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full text-center">
          <RevealSection>
            {/* Victory Icon / Badge */}
            <div className="relative inline-block mb-12">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
              <div className="relative w-32 h-32 mx-auto bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] border-4 border-white/10">
                <svg className="w-16 h-16 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              MISSÃO CUMPRIDA!
            </h1>

            <p className="text-xl text-emerald-400 font-bold mb-8 tracking-widest uppercase">
              SEU PODER FOI DESBLOQUEADO
            </p>

            <div className="bg-gray-900/50 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl mb-12">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Sua assinatura foi processada e os portais do reino estão abertos para você.
                Prepare-se para uma jornada sem limites.
              </p>

              {sessionId && (
                <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-500 font-mono tracking-tighter">
                  ID DA SESSÃO: {sessionId}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="group relative overflow-hidden bg-white text-black font-black py-5 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  ENTRAR NO REINO
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/profile"
                className="bg-gray-800/50 text-white font-bold py-5 px-8 rounded-2xl border border-white/10 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                VER STATUS DA CLASSE
              </Link>
            </div>

            <p className="mt-12 text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              Sincronizando dimensões{dots}
            </p>
          </RevealSection>
        </div>
      </main>

      <SimpleFooter />
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Abrindo portais..." />}>
      <SuccessContent />
    </Suspense>
  )
}