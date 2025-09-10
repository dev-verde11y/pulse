import { Suspense } from 'react'
import Link from 'next/link'

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Realizado!
        </h1>
        
        <p className="text-gray-300 mb-8">
          Sua assinatura foi ativada com sucesso. Você receberá um email de confirmação em breve.
        </p>

        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para o App
          </Link>
          
          <Link 
            href="/api/subscriptions/status"
            className="block w-full bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Ver Status da Assinatura
          </Link>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          Em caso de dúvidas, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}