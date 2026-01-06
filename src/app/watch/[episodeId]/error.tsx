'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function WatchError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg bg-gray-900 border border-gray-800 p-8 rounded-2xl">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold">Erro no Player</h2>

                <p className="text-gray-400">
                    Não foi possível carregar o vídeo. Tente recarregar a página ou verifique sua conexão.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/browse"
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                    >
                        Voltar
                    </Link>

                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    )
}
