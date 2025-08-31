'use client'

import Image from 'next/image'

interface LoadingScreenProps {
  fullscreen?: boolean
  message?: string
}

export function LoadingScreen({ fullscreen = true, message = "Carregando..." }: LoadingScreenProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
        <div className="text-center space-y-6">
          {/* Logo animado */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-75"></div>
            </div>
            <div className="relative">
              <Image
                src="/images/logo-ini.png"
                alt="Logo Pulse"
                width={64}
                height={64}
                className="rounded-xl shadow-2xl"
                priority
              />
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-white text-lg font-medium">{message}</span>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
        <span className="text-gray-400 text-sm">{message}</span>
      </div>
    </div>
  )
}