'use client'

import { useState } from 'react'

export default function ModalTest() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-4">
      <h1 className="text-2xl text-white mb-4">Teste do Modal</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Mostrar Modal
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Modal de Teste</h3>
              <p className="text-gray-300 mb-4">Este modal está funcionando!</p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}