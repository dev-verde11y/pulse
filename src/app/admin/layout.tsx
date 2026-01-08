'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/admin/Sidebar'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Loading state with Cinematic flare
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 to-blue-900/10"></div>

        <div className="text-center space-y-6 relative z-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-wider">
              ACESSO RESTRITO
            </h2>
            <p className="text-sm text-purple-400/60 font-mono animate-pulse">
              Identificando assinatura de energia...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Not Authenticated / Error State
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-red-500 mb-2">ACESSO NEGADO</h1>
          <p className="text-gray-400">Você não possui as credenciais de Mestre do Jogo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex text-gray-100 font-sans selection:bg-purple-500/30">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Cinematic Admin Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a]/90 to-[#1e1b4b]/80"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Top Header - Starship Deck Style */}
        <header className="relative z-10 bg-gray-900/40 backdrop-blur-xl border-b border-white/5 h-16">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 uppercase tracking-widest">
                    Central de Comando
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <p className="text-[10px] font-mono text-green-500/80">SISTEMAS OPERACIONAIS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Quick Actions */}
            <div className="flex items-center space-x-3">
              {/* Add Anime Button */}
              <div className="hidden md:block">
                <Link href="/admin/animes" className="group relative px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/20 overflow-hidden flex items-center gap-2">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12"></div>
                  <svg className="w-3 h-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative z-10">Novo Grimório (Anime)</span>
                </Link>
              </div>

              {/* Mobile Quick Action */}
              <div className="md:hidden">
                <Link href="/admin/animes" className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}