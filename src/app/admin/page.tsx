'use client'

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  animes: number
  episodes: number
  seasons: number
  heroBanners: number
  users: number
  storage: number
  totalRevenue: number
  activeSubscriptions: number
  pendingPayments: number
  monthlyGrowth: number
}

interface RecentSubscription {
  planName: string
  status: string
  startDate: string
  endDate: string
  amount: number
}

interface RecentPayment {
  userName: string
  amount: number
  status: string
  paymentMethod: string
  date: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    animes: 0,
    episodes: 0,
    seasons: 0,
    heroBanners: 0,
    users: 0,
    storage: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    monthlyGrowth: 0
  })

  const [payments, setPayments] = useState<Array<{
    id: number;
    user: string;
    amount: number;
    status: string;
    method: string;
    date: string;
  }>>([])
  const [subscriptions, setSubscriptions] = useState<Array<{
    id: number;
    user: string;
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    amount: number;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [loadingFinancials, setLoadingFinancials] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [animesRes, episodesRes, seasonsRes, heroBannersRes, usersRes, financialRes] = await Promise.all([
        fetch('/api/animes?limit=1').catch(() => null),
        fetch('/api/episodes?limit=1').catch(() => null),
        fetch('/api/seasons?limit=1').catch(() => null),
        fetch('/api/hero-banners?limit=1').catch(() => null),
        fetch('/api/admin/users?limit=1').catch(() => null),
        fetch('/api/admin/dashboard/financial').catch(() => null)
      ])

      const [animesData, episodesData, seasonsData, heroBannersData, usersData, financialData] = await Promise.all([
        animesRes?.ok ? animesRes.json() : null,
        episodesRes?.ok ? episodesRes.json() : null,
        seasonsRes?.ok ? seasonsRes.json() : null,
        heroBannersRes?.ok ? heroBannersRes.json() : null,
        usersRes?.ok ? usersRes.json() : null,
        financialRes?.ok ? financialRes.json() : null
      ])

      setStats(prev => ({
        ...prev,
        animes: animesData?.pagination?.totalItems || 0,
        episodes: episodesData?.pagination?.totalItems || 0,
        seasons: seasonsData?.pagination?.totalItems || 0,
        heroBanners: heroBannersData?.pagination?.total || 0,
        users: usersData?.pagination?.totalItems || 0,
        storage: 0,
        totalRevenue: financialData?.totalRevenue || 0,
        activeSubscriptions: financialData?.activeSubscriptions || 0,
        pendingPayments: financialData?.pendingPayments || 0,
        monthlyGrowth: financialData?.monthlyGrowth || 0
      }))

      if (financialData?.recentSubscriptions) {
        setSubscriptions(financialData.recentSubscriptions.slice(0, 4).map((sub: RecentSubscription, index: number) => ({
          id: index + 1,
          user: sub.planName,
          plan: sub.planName,
          status: sub.status,
          startDate: new Date(sub.startDate).toISOString().split('T')[0],
          endDate: new Date(sub.endDate).toISOString().split('T')[0],
          amount: sub.amount
        })))
      }

      if (financialData?.recentPayments) {
        setPayments(financialData.recentPayments.slice(0, 4).map((payment: RecentPayment, index: number) => ({
          id: index + 1,
          user: payment.userName,
          amount: payment.amount,
          status: payment.status,
          method: payment.paymentMethod,
          date: new Date(payment.date).toISOString().split('T')[0]
        })))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    if (!loading) {
      setLoadingFinancials(false)
    }
  }, [loading])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-400 tracking-widest uppercase">Sistema Online</span>
            </div>
            <h2 className="text-3xl font-black text-white">
              SALA DO TRONO
            </h2>
            <p className="text-gray-400 max-w-lg">
              Bem-vindo, Mestre. O destino do universo Pulse está em suas mãos. Monitore os sinais vitais do sistema abaixo.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="text-center bg-black/40 rounded-xl p-4 backdrop-blur-lg border border-white/5 shadow-inner">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                100%
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sincronia Mágica</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Crystal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Animes Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-blue-500/20 p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-blue-200/60 uppercase tracking-wider">Sagas (Animes)</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-blue-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(stats.animes)}
            </p>
          </div>
        </div>

        {/* Episodes Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-green-500/20 p-5 rounded-2xl hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg text-green-400 group-hover:text-green-300 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-green-200/60 uppercase tracking-wider">Capítulos</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-green-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(stats.episodes)}
            </p>
          </div>
        </div>

        {/* Seasons Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-purple-500/20 p-5 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-purple-200/60 uppercase tracking-wider">Eras (Seasons)</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-purple-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(stats.seasons)}
            </p>
          </div>
        </div>

        {/* Banners Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-orange-500/20 p-5 rounded-2xl hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400 group-hover:text-orange-300 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-orange-200/60 uppercase tracking-wider">Estandartes</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-orange-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : stats.heroBanners}
            </p>
          </div>
        </div>

        {/* Users (Adventurers) Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-pink-500/20 p-5 rounded-2xl hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-pink-500/10 rounded-lg text-pink-400 group-hover:text-pink-300 group-hover:bg-pink-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-pink-200/60 uppercase tracking-wider">Aventureiros</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-pink-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(stats.users)}
            </p>
          </div>
        </div>

        {/* Storage Crystal */}
        <div className="group relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#0f172a]/80 border border-yellow-500/20 p-5 rounded-2xl hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden">

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-yellow-500/10 rounded-lg text-yellow-400 group-hover:text-yellow-300 group-hover:bg-yellow-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-yellow-200/60 uppercase tracking-wider">Armazém R2 (TB)</h3>
            </div>
            <p className="text-3xl font-black text-white group-hover:text-yellow-200 transition-colors">
              {loading ? <span className="animate-pulse">...</span> : `${stats.storage}`}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Overview - Royal Treasury */}
      <div className="relative max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <span className="text-yellow-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </span>
            Tesouro Real
          </h3>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sincronizado com Stripe</span>
          </div>
        </div>

        {/* Treasury Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Loot */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-yellow-500/20 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-xs text-yellow-500/60 uppercase tracking-widest font-bold mb-1">Cofres Totais</p>
              <p className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">
                {loading ? '...' : `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center mt-2 text-xs text-green-400">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+{stats.monthlyGrowth}% neste ciclo</span>
              </div>
            </div>
          </div>

          {/* Guild Pacts */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-xs text-blue-500/60 uppercase tracking-widest font-bold mb-1">Pactos Ativos</p>
              <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                {loading ? '...' : formatNumber(stats.activeSubscriptions)}
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-400">
                <span>Aventureiros Leais</span>
              </div>
            </div>
          </div>

          {/* Pending Tributes */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 border border-orange-500/20 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <p className="text-xs text-orange-500/60 uppercase tracking-widest font-bold mb-1">Tributos Pendentes</p>
              <p className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors">
                {loading ? '...' : stats.pendingPayments}
              </p>
              <div className="flex items-center mt-2 text-xs text-orange-400">
                <span>Requer Cobrança</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Payments Log */}
          <div className="bg-[#0f172a]/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Livro de Entradas
              </h4>
              <a href="/admin/payments" className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest border border-purple-500/20 px-2 py-1 rounded-md hover:bg-purple-500/10 transition-all duration-300">Ver Tudo</a>
            </div>

            <div className="space-y-3">
              {loadingFinancials ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-800/50 rounded-xl animate-pulse"></div>
                ))
              ) : (
                payments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="group flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 rounded-xl border border-transparent hover:border-gray-700 transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${payment.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {payment.status === 'completed' ? 'P' : '!'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 group-hover:text-white">{payment.user}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{payment.method} • {payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${payment.status === 'completed' ? 'text-green-500' :
                        payment.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {payment.status === 'completed' ? 'Confirmado' :
                          payment.status === 'pending' ? 'Aguardando' : 'Falha'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Pacts Log */}
          <div className="bg-[#0f172a]/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                Pactos Recentes
              </h4>
            </div>

            <div className="space-y-3">
              {loadingFinancials ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-800/50 rounded-xl animate-pulse"></div>
                ))
              ) : (
                subscriptions.slice(0, 4).map((subscription) => (
                  <div key={subscription.id} className="group flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 rounded-xl border border-transparent hover:border-gray-700 transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${subscription.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-gray-700/30 text-gray-400'
                        }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 group-hover:text-white">{subscription.user}</p>
                        <p className="text-[10px] text-gray-500 font-mono">Plano {subscription.plan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${subscription.status === 'ACTIVE' ? 'text-blue-500' : 'text-gray-500'
                        }`}>
                        {subscription.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}