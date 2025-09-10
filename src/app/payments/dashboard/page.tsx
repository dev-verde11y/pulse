'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PaymentAnalytics {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  payments: {
    totalRevenue: number
    totalPayments: number
    successfulPayments: number
    failedPayments: number
    paymentsByMethod: Record<string, number>
  }
  checkoutSessions: {
    byStatus: Record<string, number>
    abandoned: number
  }
}

interface CheckoutSession {
  id: string
  stripeSessionId: string
  status: string
  paymentStatus: string
  mode: string
  amount: number
  currency: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
  subscription?: {
    id: string
    planName: string
    status: string
  }
}

export default function PaymentsDashboard() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [sessions, setSessions] = useState<CheckoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, sessionsRes] = await Promise.all([
        fetch('/api/payments/analytics?days=30'),
        fetch('/api/payments/sessions?limit=20')
      ])

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData.sessions)
      }
    } catch (error) {
      console.error('Error loading payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-400 bg-green-400/10'
      case 'open': return 'text-yellow-400 bg-yellow-400/10'
      case 'expired': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Pagamentos</h1>
            <p className="text-gray-400">Monitoramento completo do sistema de pagamentos</p>
          </div>
          <Link 
            href="/payments/checkout-demo"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Testar Checkout
          </Link>
        </div>

        {analytics && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium">Receita Total (30d)</h3>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(analytics.payments.totalRevenue)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium">Pagamentos</h3>
                <p className="text-2xl font-bold">
                  {analytics.payments.successfulPayments}/{analytics.payments.totalPayments}
                </p>
                <p className="text-sm text-gray-400">
                  {Math.round((analytics.payments.successfulPayments / analytics.payments.totalPayments) * 100)}% sucesso
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium">Checkouts Completos</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {analytics.checkoutSessions.byStatus.complete || 0}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium">Checkouts Abandonados</h3>
                <p className="text-2xl font-bold text-red-400">
                  {analytics.checkoutSessions.abandoned}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Methods */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.payments.paymentsByMethod).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span className="capitalize">{method}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Status */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Status dos Checkouts</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.checkoutSessions.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recent Sessions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Sessões Recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Criado</th>
                  <th className="text-left py-3 px-4">Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-700">
                    <td className="py-3 px-4 font-mono text-xs">
                      {session.stripeSessionId.slice(-8)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {formatCurrency(Number(session.amount), session.currency)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {session.subscription ? (
                        <span className="text-blue-400">
                          {session.subscription.planName}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}