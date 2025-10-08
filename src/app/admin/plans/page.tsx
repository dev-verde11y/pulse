'use client'

import { useState, useEffect, useCallback } from 'react'

interface Plan {
  id: string
  name: string
  type: 'FREE' | 'FAN' | 'MEGA_FAN' | 'MEGA_FAN_ANNUAL'
  billingCycle: 'MONTHLY' | 'ANNUALLY' | 'LIFETIME'
  price: string
  currency: string
  maxScreens: number
  offlineViewing: boolean
  gameVaultAccess: boolean
  adFree: boolean
  description: string
  features: string[]
  active: boolean
  displayOrder: number
  popular: boolean
  createdAt: string
  updatedAt: string
  _count: {
    subscriptions: number
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
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
  const [typeFilter, setTypeFilter] = useState('')
  const [billingCycleFilter, setBillingCycleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('displayOrder')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const fetchPlans = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(billingCycleFilter && { billingCycle: billingCycleFilter }),
        ...(statusFilter && { active: statusFilter })
      })

      const response = await fetch(`/api/admin/plans?${params}`)
      if (!response.ok) throw new Error('Failed to fetch plans')
      
      const data = await response.json()
      setPlans(data.plans)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, searchTerm, typeFilter, billingCycleFilter, statusFilter])

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${name}"?`)) return

    try {
      const response = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409 && result.hasActiveSubscriptions) {
          alert('Não é possível excluir este plano pois ele possui assinaturas ativas.')
          return
        }
        throw new Error(result.error || 'Failed to delete plan')
      }

      fetchPlans(pagination.currentPage)
      alert('Plano excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Erro ao excluir plano. Tente novamente.')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          active: !currentStatus 
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update plan status')
      }

      fetchPlans(pagination.currentPage)
      alert(`Plano ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`)
    } catch (error) {
      console.error('Error updating plan status:', error)
      alert('Erro ao atualizar status do plano. Tente novamente.')
    }
  }

  const handleTogglePopular = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          popular: !currentStatus 
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update plan popularity')
      }

      fetchPlans(pagination.currentPage)
      alert(`Plano ${!currentStatus ? 'marcado como popular' : 'removido dos populares'} com sucesso!`)
    } catch (error) {
      console.error('Error updating plan popularity:', error)
      alert('Erro ao atualizar popularidade do plano. Tente novamente.')
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      FREE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      FAN: 'bg-green-500/20 text-green-400 border-green-500/30',
      MEGA_FAN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      MEGA_FAN_ANNUAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return colors[type as keyof typeof colors] || colors.FREE
  }

  const getBillingCycleBadge = (cycle: string) => {
    const colors = {
      MONTHLY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ANNUALLY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      LIFETIME: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
    return colors[cycle as keyof typeof colors] || colors.MONTHLY
  }

  const formatCurrency = (amount: string, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount))
  }

  const getTypeDisplayName = (type: string) => {
    const names = {
      FREE: 'Gratuito',
      FAN: 'Fan',
      MEGA_FAN: 'Mega Fan',
      MEGA_FAN_ANNUAL: 'Mega Fan Anual'
    }
    return names[type as keyof typeof names] || type
  }

  const getBillingCycleDisplayName = (cycle: string) => {
    const names = {
      MONTHLY: 'Mensal',
      ANNUALLY: 'Anual',
      LIFETIME: 'Vitalício'
    }
    return names[cycle as keyof typeof names] || cycle
  }

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-green-100">
            Planos
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os planos de assinatura</p>
        </div>
        <button
          onClick={() => alert('Funcionalidade de criar plano em desenvolvimento')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Plano</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Planos</p>
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
              <p className="text-sm text-gray-400">Planos Ativos</p>
              <p className="text-xl font-bold text-green-400">
                {plans.filter(plan => plan.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 via-yellow-700/10 to-yellow-800/5 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Populares</p>
              <p className="text-xl font-bold text-yellow-400">
                {plans.filter(plan => plan.popular).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Assinaturas Ativas</p>
              <p className="text-xl font-bold text-purple-400">
                {plans.reduce((total, plan) => total + plan._count.subscriptions, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 via-emerald-700/10 to-emerald-800/5 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Receita Mensal Est.</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(
                  plans
                    .filter(plan => plan.active && plan.billingCycle === 'MONTHLY')
                    .reduce((total, plan) => total + (parseFloat(plan.price) * plan._count.subscriptions), 0)
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
              placeholder="Nome do plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="FREE">Gratuito</option>
              <option value="FAN">Fan</option>
              <option value="MEGA_FAN">Mega Fan</option>
              <option value="MEGA_FAN_ANNUAL">Mega Fan Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ciclo de Cobrança</label>
            <select
              value={billingCycleFilter}
              onChange={(e) => setBillingCycleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="MONTHLY">Mensal</option>
              <option value="ANNUALLY">Anual</option>
              <option value="LIFETIME">Vitalício</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="displayOrder">Ordem de Exibição</option>
              <option value="name">Nome</option>
              <option value="price">Preço</option>
              <option value="createdAt">Data de Criação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordem</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('')
                setBillingCycleFilter('')
                setStatusFilter('')
                setSortBy('displayOrder')
                setSortOrder('asc')
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

      {/* Plans List */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-gray-400 mt-2">Carregando planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Nenhum plano encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Plano</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Tipo</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Preço</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Ciclo</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Recursos</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Assinaturas</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr key={plan.id} className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-medium truncate">{plan.name}</h3>
                            {plan.popular && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">{plan.description}</p>
                          <p className="text-xs text-gray-500">Ordem: {plan.displayOrder}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(plan.type)}`}>
                        {getTypeDisplayName(plan.type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-semibold">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getBillingCycleBadge(plan.billingCycle)}`}>
                        {getBillingCycleDisplayName(plan.billingCycle)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300 space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{plan.maxScreens} tela{plan.maxScreens > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {plan.adFree ? (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>Sem anúncios</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {plan.offlineViewing ? (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>Offline</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {plan.gameVaultAccess ? (
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span>Game Vault</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                          plan.active 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {plan.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-white font-semibold">{plan._count.subscriptions}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedPlan(plan)
                            setShowViewModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Visualizar plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => alert('Funcionalidade de editar plano em desenvolvimento')}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Editar plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleToggleActive(plan.id, plan.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.active
                              ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
                          }`}
                          title={plan.active ? 'Desativar plano' : 'Ativar plano'}
                        >
                          {plan.active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={() => handleTogglePopular(plan.id, plan.popular)}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.popular
                              ? 'text-yellow-400 hover:text-gray-400 hover:bg-gray-500/10'
                              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                          title={plan.popular ? 'Remover dos populares' : 'Marcar como popular'}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir plano"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && plans.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {plans.length} de {pagination.totalItems} planos
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchPlans(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-white text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPlans(pagination.currentPage + 1)}
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
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <span>Detalhes do Plano</span>
                      {selectedPlan.popular && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Popular
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 text-sm">{selectedPlan.name}</p>
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
              {/* Status & Pricing Hero */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getTypeBadge(selectedPlan.type)}`}>
                    {getTypeDisplayName(selectedPlan.type)}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getBillingCycleBadge(selectedPlan.billingCycle)}`}>
                    {getBillingCycleDisplayName(selectedPlan.billingCycle)}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                    selectedPlan.active 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {selectedPlan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-white">
                    {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{getBillingCycleDisplayName(selectedPlan.billingCycle).toLowerCase()}
                  </span>
                </div>
                
                <p className="text-gray-400 text-lg mb-4">{selectedPlan.description}</p>
                
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedPlan._count.subscriptions}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Assinaturas Ativas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">#{selectedPlan.displayOrder}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Ordem de Exibição</div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Screen Limits */}
                <div className="bg-gradient-to-br from-blue-800/50 via-blue-800/30 to-blue-700/20 rounded-xl p-6 border border-blue-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Telas Simultâneas</h3>
                      <p className="text-blue-300 text-sm">Dispositivos ao mesmo tempo</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{selectedPlan.maxScreens}</div>
                    <div className="text-blue-300 text-sm">
                      {selectedPlan.maxScreens === 1 ? 'tela simultânea' : 'telas simultâneas'}
                    </div>
                  </div>
                </div>

                {/* Premium Features */}
                <div className="bg-gradient-to-br from-purple-800/50 via-purple-800/30 to-purple-700/20 rounded-xl p-6 border border-purple-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Recursos Premium</h3>
                      <p className="text-purple-300 text-sm">Funcionalidades incluídas</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {selectedPlan.adFree ? (
                        <div className="w-6 h-6 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white">Sem anúncios</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {selectedPlan.offlineViewing ? (
                        <div className="w-6 h-6 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white">Visualização offline</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {selectedPlan.gameVaultAccess ? (
                        <div className="w-6 h-6 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white">Acesso ao Game Vault</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              {selectedPlan.features && selectedPlan.features.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-700/20 rounded-xl p-6 border border-gray-700/50 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Funcionalidades Adicionais</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-5 h-5 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue & Statistics */}
              <div className="bg-gradient-to-br from-emerald-800/50 via-emerald-800/30 to-emerald-700/20 rounded-xl p-6 border border-emerald-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Estatísticas & Receita</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{selectedPlan._count.subscriptions}</div>
                    <div className="text-emerald-300 text-sm">Assinaturas Ativas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                      {formatCurrency(
                        (parseFloat(selectedPlan.price) * selectedPlan._count.subscriptions).toString(),
                        selectedPlan.currency
                      )}
                    </div>
                    <div className="text-emerald-300 text-sm">Receita Total</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">
                      {selectedPlan._count.subscriptions > 0 
                        ? Math.round((selectedPlan._count.subscriptions / (selectedPlan._count.subscriptions + 10)) * 100) // Mock calculation
                        : 0}%
                    </div>
                    <div className="text-emerald-300 text-sm">Market Share</div>
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