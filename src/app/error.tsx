'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold">Algo deu errado!</h2>

                <p className="text-gray-400">
                    Encontramos um erro inesperado. Tente recarregar a página.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium"
                    >
                        Ir para Home
                    </button>

                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
                    >
                        Tentar Novamente
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-900 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-red-400">
                        {error.message}
                        {error.digest && <div className="mt-2 text-gray-500">Digest: {error.digest}</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
