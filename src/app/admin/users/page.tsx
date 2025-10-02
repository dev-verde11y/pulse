'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: 'USER' | 'PREMIUM' | 'SUPER_PREMIUM' | 'ADMIN'
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'GRACE_PERIOD'
  currentPlan: 'FREE' | 'FAN' | 'MEGA_FAN' | 'MEGA_FAN_ANNUAL'
  subscriptionExpiry: string | null
  maxScreens: number
  offlineViewing: boolean
  gameVaultAccess: boolean
  adFree: boolean
  language: string
  emailNotifications: boolean
  createdAt: string
  updatedAt: string
  _count: {
    subscriptions: number
    watchHistory: number
    favorites: number
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
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
  const [roleFilter, setRoleFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('email')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(planFilter && { plan: planFilter }),
        ...(statusFilter && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, searchTerm, roleFilter, planFilter, statusFilter])

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${email}"?`)) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      // Refresh the list
      fetchUsers(pagination.currentPage)
      alert('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário. Tente novamente.')
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Tem certeza que deseja alterar o papel do usuário para "${newRole}"?`)) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update user role')
      }

      // Refresh the list
      fetchUsers(pagination.currentPage)
      alert('Papel do usuário atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Erro ao atualizar papel do usuário. Tente novamente.')
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
      SUPER_PREMIUM: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      PREMIUM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      USER: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[role as keyof typeof colors] || colors.USER
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      MEGA_FAN_ANNUAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      MEGA_FAN: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      FAN: 'bg-green-500/20 text-green-400 border-green-500/30',
      FREE: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[plan as keyof typeof colors] || colors.FREE
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      EXPIRED: 'bg-red-500/20 text-red-400 border-red-500/30',
      CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      GRACE_PERIOD: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[status as keyof typeof colors] || colors.ACTIVE
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getRoleDisplayName = (role: string) => {
    const names = {
      ADMIN: 'Administrador',
      SUPER_PREMIUM: 'Super Premium',
      PREMIUM: 'Premium',
      USER: 'Usuário'
    }
    return names[role as keyof typeof names] || role
  }

  const getPlanDisplayName = (plan: string) => {
    const names = {
      MEGA_FAN_ANNUAL: 'Mega Fan Anual',
      MEGA_FAN: 'Mega Fan',
      FAN: 'Fan',
      FREE: 'Gratuito'
    }
    return names[plan as keyof typeof names] || plan
  }

  const getStatusDisplayName = (status: string) => {
    const names = {
      ACTIVE: 'Ativo',
      EXPIRED: 'Expirado',
      CANCELLED: 'Cancelado',
      PENDING: 'Pendente',
      GRACE_PERIOD: 'Período de Graça'
    }
    return names[status as keyof typeof names] || status
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-green-100">
            Usuários
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os usuários da plataforma</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Usuários</p>
              <p className="text-xl font-bold text-blue-400">{pagination.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 via-red-700/10 to-red-800/5 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Administradores</p>
              <p className="text-xl font-bold text-red-400">
                {users.filter(user => user.role === 'ADMIN').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Premium</p>
              <p className="text-xl font-bold text-purple-400">
                {users.filter(user => user.role === 'PREMIUM' || user.role === 'SUPER_PREMIUM').length}
              </p>
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
              <p className="text-sm text-gray-400">Ativos</p>
              <p className="text-xl font-bold text-green-400">
                {users.filter(user => user.subscriptionStatus === 'ACTIVE').length}
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
              placeholder="Email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Papel</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="SUPER_PREMIUM">Super Premium</option>
              <option value="PREMIUM">Premium</option>
              <option value="USER">Usuário</option>
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
              <option value="MEGA_FAN_ANNUAL">Mega Fan Anual</option>
              <option value="MEGA_FAN">Mega Fan</option>
              <option value="FAN">Fan</option>
              <option value="FREE">Gratuito</option>
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
              <option value="ACTIVE">Ativo</option>
              <option value="EXPIRED">Expirado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="PENDING">Pendente</option>
              <option value="GRACE_PERIOD">Período de Graça</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="email">Email</option>
              <option value="name">Nome</option>
              <option value="role">Papel</option>
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
                setRoleFilter('')
                setPlanFilter('')
                setStatusFilter('')
                setSortBy('email')
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

      {/* Users List */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-gray-400 mt-2">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Usuário</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Papel</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Plano</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Cadastro</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Atividade</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden relative">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || user.email}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-medium truncate">{user.name || 'Sem nome'}</h3>
                          <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPlanBadge(user.currentPlan)}`}>
                        {getPlanDisplayName(user.currentPlan)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(user.subscriptionStatus)}`}>
                        {getStatusDisplayName(user.subscriptionStatus)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="p-4">
                      <div className="text-xs text-gray-400">
                        <div>{user._count.watchHistory} assistidos</div>
                        <div>{user._count.favorites} favoritos</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user)
                            setShowViewModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Visualizar usuário"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <div className="relative group">
                          <button className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            {['ADMIN', 'SUPER_PREMIUM', 'PREMIUM', 'USER'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleChangeRole(user.id, role)}
                                disabled={user.role === role}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                  user.role === role ? 'text-gray-500 cursor-not-allowed' : 'text-white'
                                }`}
                              >
                                {getRoleDisplayName(role)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir usuário"
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
        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {users.length} de {pagination.totalItems} usuários
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-white text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal - Simple implementation for now */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Detalhes do Usuário</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome</label>
                  <p className="text-white">{selectedUser.name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Papel</label>
                  <p className="text-white">{getRoleDisplayName(selectedUser.role)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Plano</label>
                  <p className="text-white">{getPlanDisplayName(selectedUser.currentPlan)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status da Assinatura</label>
                  <p className="text-white">{getStatusDisplayName(selectedUser.subscriptionStatus)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Máximo de Telas</label>
                  <p className="text-white">{selectedUser.maxScreens}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Visualização Offline</label>
                  <p className="text-white">{selectedUser.offlineViewing ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Acesso Game Vault</label>
                  <p className="text-white">{selectedUser.gameVaultAccess ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sem Anúncios</label>
                  <p className="text-white">{selectedUser.adFree ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Idioma</label>
                  <p className="text-white">{selectedUser.language}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Data de Cadastro</label>
                  <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Última Atualização</label>
                  <p className="text-white">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{selectedUser._count.subscriptions}</p>
                  <p className="text-sm text-gray-400">Assinaturas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedUser._count.watchHistory}</p>
                  <p className="text-sm text-gray-400">Assistidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{selectedUser._count.favorites}</p>
                  <p className="text-sm text-gray-400">Favoritos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}