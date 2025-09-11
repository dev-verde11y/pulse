'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Agora confia no middleware para fazer a verificação de permissão
  // Se chegou até aqui, é porque passou pela verificação do middleware

  // Loading state simples
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-t-transparent animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">Carregando painel admin...</p>
            <p className="text-xs text-gray-400">Aguarde um momento</p>
          </div>
        </div>
      </div>
    )
  }

  // Se não tem usuário ainda (mas não está loading), aguarda
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-800 border-t-blue-500 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">Inicializando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gradient-to-r from-gray-900/60 via-gray-900/50 to-gray-900/60 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden group p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 transition-all duration-300"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div>
                  <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-blue-100">
                    Painel Administrativo
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">
                    Central de gerenciamento da plataforma
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/admin/animes" className="group relative px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-blue-500/20">
                    <div className="relative flex items-center space-x-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Novo Anime</span>
                    </div>
                  </Link>
                  
                  <button className="group relative px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-500/20">
                    <div className="relative flex items-center space-x-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span>Upload Episódio</span>
                    </div>
                  </button>
                  
                  <button className="group relative px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20">
                    <div className="relative flex items-center space-x-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Nova Temporada</span>
                    </div>
                  </button>
                </div>

                {/* Mobile Quick Actions */}
                <div className="md:hidden relative">
                  <button className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}