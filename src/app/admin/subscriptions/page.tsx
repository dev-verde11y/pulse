'use client'

import { useState, useEffect, useCallback } from 'react'

interface Subscription {
  id: string
  userId: string
  planId: string
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD'
  startDate: string
  endDate: string
  autoRenewal: boolean
  amount: string
  currency: string
  paymentMethod: string | null
  transactionId: string | null
  externalId: string | null
  renewalCount: number
  lastRenewalDate: string | null
  nextBillingDate: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  plan: {
    id: string
    name: string
    type: 'FREE' | 'FAN' | 'MEGA_FAN' | 'MEGA_FAN_ANNUAL'
    price: string
    currency: string
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const fetchSubscriptions = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { plan: planFilter }),
        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter })
      })

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch subscriptions')
      
      const data = await response.json()
      setSubscriptions(data.subscriptions)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, searchTerm, statusFilter, planFilter, paymentMethodFilter])

  const handleCancelSubscription = async (id: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja cancelar a assinatura do usuário "${userEmail}"?`)) return

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/cancel`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cancellationReason: 'Cancelled by admin' 
        })
      })
      
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription')
      }

      fetchSubscriptions(pagination.currentPage)
      alert('Assinatura cancelada com sucesso!')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    }
  }

  const handleReactivateSubscription = async (id: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja reativar a assinatura do usuário "${userEmail}"?`)) return

    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/reactivate`, { 
        method: 'PATCH'
      })
      
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reactivate subscription')
      }

      fetchSubscriptions(pagination.currentPage)
      alert('Assinatura reativada com sucesso!')
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Erro ao reativar assinatura. Tente novamente.')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      EXPIRED: 'bg-red-500/20 text-red-400 border-red-500/30',
      CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      GRACE_PERIOD: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[status as keyof typeof colors] || colors.PENDING
  }

  const getPlanBadge = (type: string) => {
    const colors = {
      MEGA_FAN_ANNUAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      MEGA_FAN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      FAN: 'bg-green-500/20 text-green-400 border-green-500/30',
      FREE: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[type as keyof typeof colors] || colors.FREE
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: string, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount))
  }

  const getStatusDisplayName = (status: string) => {
    const names = {
      ACTIVE: 'Ativa',
      EXPIRED: 'Expirada',
      CANCELLED: 'Cancelada',
      PENDING: 'Pendente',
      GRACE_PERIOD: 'Período de Graça'
    }
    return names[status as keyof typeof names] || status
  }

  const getPlanDisplayName = (type: string) => {
    const names = {
      MEGA_FAN_ANNUAL: 'Mega Fan Anual',
      MEGA_FAN: 'Mega Fan',
      FAN: 'Fan',
      FREE: 'Gratuito'
    }
    return names[type as keyof typeof names] || type
  }

  const getPaymentMethodDisplayName = (method: string | null) => {
    if (!method) return 'N/A'
    const names = {
      credit_card: 'Cartão de Crédito',
      pix: 'PIX',
      boleto: 'Boleto'
    }
    return names[method as keyof typeof names] || method
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-green-100">
            Assinaturas
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todas as assinaturas da plataforma</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Assinaturas</p>
              <p className="text-xl font-bold text-blue-400">{pagination.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 via-green-700/10 to-green-800/5 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Ativas</p>
              <p className="text-xl font-bold text-green-400">
                {subscriptions.filter(sub => sub.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 via-yellow-700/10 to-yellow-800/5 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pendentes</p>
              <p className="text-xl font-bold text-yellow-400">
                {subscriptions.filter(sub => sub.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 via-red-700/10 to-red-800/5 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Expiradas</p>
              <p className="text-xl font-bold text-red-400">
                {subscriptions.filter(sub => sub.status === 'EXPIRED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Receita Mensal</p>
              <p className="text-xl font-bold text-purple-400">
                {formatCurrency(
                  subscriptions
                    .filter(sub => sub.status === 'ACTIVE')
                    .reduce((total, sub) => total + parseFloat(sub.amount), 0)
                    .toString()
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Email do usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Ativa</option>
              <option value="PENDING">Pendente</option>
              <option value="EXPIRED">Expirada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="GRACE_PERIOD">Período de Graça</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plano</label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="FAN">Fan</option>
              <option value="MEGA_FAN">Mega Fan</option>
              <option value="MEGA_FAN_ANNUAL">Mega Fan Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pagamento</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="createdAt">Data de Criação</option>
              <option value="startDate">Data de Início</option>
              <option value="endDate">Data de Fim</option>
              <option value="amount">Valor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordem</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setPlanFilter('')
                setPaymentMethodFilter('')
                setSortBy('createdAt')
                setSortOrder('desc')
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-gray-400 mt-2">Carregando assinaturas...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Nenhuma assinatura encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Usuário</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Plano</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Valor</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Período</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Renovações</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription, index) => (
                  <tr key={subscription.id} className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="p-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-medium truncate">
                          {subscription.user.name || 'Sem nome'}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{subscription.user.email}</p>
                        <p className="text-xs text-gray-500">
                          {subscription.paymentMethod && `${getPaymentMethodDisplayName(subscription.paymentMethod)}`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPlanBadge(subscription.plan.type)}`}>
                        {subscription.plan.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(subscription.status)}`}>
                        {getStatusDisplayName(subscription.status)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300">
                        <div>Início: {formatDate(subscription.startDate)}</div>
                        <div>Fim: {formatDate(subscription.endDate)}</div>
                        {subscription.nextBillingDate && (
                          <div className="text-yellow-400">Próx: {formatDate(subscription.nextBillingDate)}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300 text-center">
                        <div className="text-lg font-bold">{subscription.renewalCount}</div>
                        <div>renovações</div>
                        <div className={`inline-block px-1.5 py-0.5 rounded text-xs mt-1 ${
                          subscription.autoRenewal 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {subscription.autoRenewal ? 'Auto' : 'Manual'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedSubscription(subscription)
                            setShowViewModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Visualizar assinatura"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {subscription.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleCancelSubscription(subscription.id, subscription.user.email)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancelar assinatura"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : subscription.status === 'CANCELLED' ? (
                          <button 
                            onClick={() => handleReactivateSubscription(subscription.id, subscription.user.email)}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Reativar assinatura"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && subscriptions.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {subscriptions.length} de {pagination.totalItems} assinaturas
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchSubscriptions(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-white text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchSubscriptions(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Detalhes da Assinatura</h2>
                    <p className="text-gray-400 text-sm">{selectedSubscription.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {/* Status Badge */}
              <div className="flex items-center justify-center mb-6">
                <span className={`inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold border shadow-lg ${getStatusBadge(selectedSubscription.status)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    selectedSubscription.status === 'ACTIVE' ? 'bg-green-400' :
                    selectedSubscription.status === 'EXPIRED' ? 'bg-red-400' :
                    selectedSubscription.status === 'CANCELLED' ? 'bg-gray-400' :
                    selectedSubscription.status === 'PENDING' ? 'bg-yellow-400' : 'bg-orange-400'
                  }`}></div>
                  {getStatusDisplayName(selectedSubscription.status)}
                </span>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-700/20 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Informações do Usuário</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nome</label>
                      <p className="text-white font-medium">{selectedSubscription.user.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                      <p className="text-white font-mono text-sm">{selectedSubscription.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Info Card */}
                <div className="bg-gradient-to-br from-purple-800/50 via-purple-800/30 to-purple-700/20 rounded-xl p-6 border border-purple-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Informações do Plano</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Plano</label>
                      <p className="text-white font-semibold text-lg">{selectedSubscription.plan.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPlanBadge(selectedSubscription.plan.type)}`}>
                        {getPlanDisplayName(selectedSubscription.plan.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Preço do Plano</label>
                      <p className="text-white font-bold text-xl">{formatCurrency(selectedSubscription.plan.price, selectedSubscription.plan.currency)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info Card */}
                <div className="bg-gradient-to-br from-green-800/50 via-green-800/30 to-green-700/20 rounded-xl p-6 border border-green-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Pagamento</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Valor</label>
                      <p className="text-white font-bold text-xl">{formatCurrency(selectedSubscription.amount, selectedSubscription.currency)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Método</label>
                      <p className="text-white font-medium">{getPaymentMethodDisplayName(selectedSubscription.paymentMethod)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID da Transação</label>
                      <p className="text-white font-mono text-xs break-all">{selectedSubscription.transactionId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-700/20 rounded-xl p-6 border border-gray-700/50 mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Timeline da Assinatura</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Data de Início</label>
                    <p className="text-white font-medium text-sm">{formatDateTime(selectedSubscription.startDate)}</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Data de Fim</label>
                    <p className="text-white font-medium text-sm">{formatDateTime(selectedSubscription.endDate)}</p>
                  </div>

                  {selectedSubscription.nextBillingDate && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Próximo Faturamento</label>
                      <p className="text-white font-medium text-sm">{formatDateTime(selectedSubscription.nextBillingDate)}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-400 font-bold text-lg">{selectedSubscription.renewalCount}</span>
                    </div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Renovações</label>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedSubscription.autoRenewal ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <p className="text-white font-medium text-sm">{selectedSubscription.autoRenewal ? 'Auto' : 'Manual'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Info - Only show if cancelled */}
              {selectedSubscription.cancelledAt && (
                <div className="bg-gradient-to-br from-red-800/50 via-red-800/30 to-red-700/20 rounded-xl p-6 border border-red-700/50 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Informações do Cancelamento</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Data de Cancelamento</label>
                      <p className="text-white font-medium">{formatDateTime(selectedSubscription.cancelledAt)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Motivo</label>
                      <p className="text-white font-medium">{selectedSubscription.cancellationReason || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-600/10 rounded-xl p-6 border border-gray-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Detalhes Técnicos</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ID Externo</label>
                    <p className="text-gray-300 font-mono text-xs break-all">{selectedSubscription.externalId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Criada em</label>
                    <p className="text-gray-300">{formatDateTime(selectedSubscription.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Atualizada em</label>
                    <p className="text-gray-300">{formatDateTime(selectedSubscription.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}