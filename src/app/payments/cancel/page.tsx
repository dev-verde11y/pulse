import { Suspense } from 'react'
import Link from 'next/link'

function CancelContent() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Cancelado
        </h1>
        
        <p className="text-gray-300 mb-8">
          Seu pagamento foi cancelado. Você pode tentar novamente quando quiser.
        </p>

        <div className="space-y-4">
          <Link 
            href="/payments/checkout-demo"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </Link>
          
          <Link 
            href="/"
            className="block w-full bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Voltar ao App
          </Link>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          Nenhuma cobrança foi realizada.
        </p>
      </div>
    </div>
  )
}

export default function Cancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  )
}