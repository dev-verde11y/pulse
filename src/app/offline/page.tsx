'use client'

import { WifiIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiIcon className="w-8 h-8 text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Você está offline
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Voltar
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Algumas funcionalidades podem estar disponíveis offline:</p>
            <ul className="space-y-1">
              <li>• Navegação entre páginas visitadas</li>
              <li>• Visualização de favoritos salvos</li>
              <li>• Conteúdo em cache</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}