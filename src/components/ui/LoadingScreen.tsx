'use client'

//import Image from 'next/image'

interface LoadingScreenProps {
  fullscreen?: boolean
  message?: string
}

export function LoadingScreen({ fullscreen = true, message = "Carregando..." }: LoadingScreenProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">

        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-8">

          {/* Logo Container with Glow */}
          <div className="relative group">
            {/* Pinging Effect */}
            <div className="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20"></div>

            {/* Outer Glow Ring */}
            <div className="absolute -inset-4 bg-blue-600 rounded-2xl opacity-20 blur-xl animate-pulse"></div>

            {/* Icon Container */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-900 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              {/* Internal Gradient Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-50"></div>

              {/* The "P" */}
              <span className="text-4xl md:text-5xl font-black text-blue-500 z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                P
              </span>
            </div>
          </div>

          {/* Loading Indicator & Message */}
          <div className="flex flex-col items-center space-y-4">
            {/* Custom Spinner */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Message with Typing Effect (Simple fade for now) */}
            <div className="text-center">
              <span className="text-gray-400 text-sm md:text-base tracking-widest uppercase font-medium animate-pulse">
                {message}
              </span>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // Inline Loading State (fallback)
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-gray-700/50 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <span className="text-gray-500 text-xs tracking-wider uppercase">{message}</span>
    </div>
  )
}