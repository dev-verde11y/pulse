'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AnimeError({
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-black text-white">
            <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-red-400">Erro ao carregar anime</h2>
                <p className="text-gray-400 max-w-md">
                    Não foi possível carregar os detalhes deste anime. Pode ter sido removido ou estamos com problemas técnicos.
                </p>
                <div className="flex gap-4 justify-center mt-4">
                    <Link
                        href="/browse"
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Voltar ao Catálogo
                    </Link>
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    )
}
