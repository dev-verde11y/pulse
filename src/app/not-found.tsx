import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="text-3xl font-bold">Página não encontrada</h2>

                <p className="text-gray-400 max-w-md mx-auto text-lg">
                    Ops! Parece que você se perdeu no multiverso. A página que você procura não existe ou foi removida.
                </p>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-full font-bold transition-all shadow-lg shadow-blue-500/30 hover:scale-105 inline-block"
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
