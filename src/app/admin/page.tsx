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
      // Fetch data from all APIs in parallel
      const [animesRes, episodesRes, seasonsRes, heroBannersRes] = await Promise.all([
        fetch('/api/animes?limit=1').catch(() => null),
        fetch('/api/episodes?limit=1').catch(() => null), 
        fetch('/api/seasons?limit=1').catch(() => null),
        fetch('/api/hero-banners?limit=1').catch(() => null)
      ])

      const [animesData, episodesData, seasonsData, heroBannersData] = await Promise.all([
        animesRes?.ok ? animesRes.json() : null,
        episodesRes?.ok ? episodesRes.json() : null,
        seasonsRes?.ok ? seasonsRes.json() : null,
        heroBannersRes?.ok ? heroBannersRes.json() : null
      ])

      setStats(prev => ({
        ...prev,
        animes: animesData?.pagination?.totalItems || 0,
        episodes: episodesData?.pagination?.totalItems || 0,
        seasons: seasonsData?.pagination?.totalItems || 0,
        heroBanners: heroBannersData?.pagination?.totalItems || 0,
        // Keep existing mock data for user/financial data
        users: 24567,
        storage: 2.4,
        totalRevenue: 125420.50,
        activeSubscriptions: 1856,
        pendingPayments: 23,
        monthlyGrowth: 18.5
      }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to mock data
      setStats(prev => ({
        ...prev,
        animes: 1247,
        episodes: 15830,
        seasons: 450,
        heroBanners: 12,
        users: 24567,
        storage: 2.4,
        totalRevenue: 125420.50,
        activeSubscriptions: 1856,
        pendingPayments: 23,
        monthlyGrowth: 18.5
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    
    // Simular carregamento de dados financeiros
    const financialTimer = setTimeout(() => {
      setPayments([
        { id: 1, user: 'João Silva', amount: 29.90, status: 'completed', method: 'credit_card', date: '2024-03-08' },
        
      ])
      
      setSubscriptions([
        { id: 1, user: 'João Silva', plan: 'Mega Fan', status: 'ACTIVE', startDate: '2024-02-01', endDate: '2024-03-01', amount: 29.90 }
      ])
      
      setLoadingFinancials(false)
    }, 1200)

    return () => {
      clearTimeout(financialTimer)
    }
  }, [fetchDashboardData])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Welcome Section - Mínima */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10 border border-blue-500/20 rounded-xl p-3 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></div>
              <span className="text-xs font-medium text-green-400">Online</span>
            </div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100">
              Painel Administrativo
            </h2>
          </div>
          <div className="hidden md:block">
            <div className="text-center bg-gray-900/30 rounded-lg p-2 backdrop-blur-sm border border-white/10">
              <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                99.9%
              </div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Animes Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v12a1 1 0 001 1h16a1 1 0 001-1V8H3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Total Animes</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatNumber(stats.animes)
              )}
            </p>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l3-3 3 3 5-5v4h4V7h-4l5 5-5-5z"/>
              </svg>
              <span>+12.3% este mês</span>
            </div>
          </div>
        </div>

        {/* Episodes Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/15 to-green-600/10">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Episódios</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatNumber(stats.episodes)
              )}
            </p>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l3-3 3 3 5-5v4h4V7h-4l5 5-5-5z"/>
              </svg>
              <span>+8.7% este mês</span>
            </div>
          </div>
        </div>

        {/* Seasons Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-600/10">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Temporadas</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatNumber(stats.seasons)
              )}
            </p>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l3-3 3 3 5-5v4h4V7h-4l5 5-5-5z"/>
              </svg>
              <span>+5.4% este mês</span>
            </div>
          </div>
        </div>

        {/* Hero Banners Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/15 to-orange-600/10">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Banners</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                stats.heroBanners
              )}
            </p>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l3-3 3 3 5-5v4h4V7h-4l5 5-5-5z"/>
              </svg>
              <span>+2.1% este mês</span>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/15 to-pink-600/10">
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Usuários</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatNumber(stats.users)
              )}
            </p>
            <div className="text-xs text-green-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14l3-3 3 3 5-5v4h4V7h-4l5 5-5-5z"/>
              </svg>
              <span>+15.2% este mês</span>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/20 border border-gray-700/40 rounded-xl p-4 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/15 to-yellow-600/10">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">Storage (TB)</h3>
            </div>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500 mb-1">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                `${stats.storage}TB`
              )}
            </p>
            <div className="text-xs text-yellow-400 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span>72% usado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Gestão Financeira</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Dados atualizados</span>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-600/20 via-green-700/10 to-green-800/5 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Receita Total</p>
                <p className="text-xl font-bold text-green-400">
                  {loading ? '---' : `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </p>
                <p className="text-xs text-green-300">+{stats.monthlyGrowth}% este mês</p>
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Assinaturas Ativas</p>
                <p className="text-xl font-bold text-blue-400">
                  {loading ? '---' : formatNumber(stats.activeSubscriptions)}
                </p>
                <p className="text-xs text-blue-300">+8.2% crescimento</p>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-gradient-to-br from-yellow-600/20 via-yellow-700/10 to-yellow-800/5 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Pagamentos Pendentes</p>
                <p className="text-xl font-bold text-yellow-400">
                  {loading ? '---' : stats.pendingPayments}
                </p>
                <p className="text-xs text-yellow-300">Requer atenção</p>
              </div>
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Crescimento Mensal</p>
                <p className="text-xl font-bold text-purple-400">
                  {loading ? '---' : `+${stats.monthlyGrowth}%`}
                </p>
                <p className="text-xs text-purple-300">Acima da meta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Histórico de Pagamentos</span>
              </h4>
              <button className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center space-x-1">
                <span>Ver todos</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {loadingFinancials ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg">
                      <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                payments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{payment.user}</p>
                        <p className="text-xs text-gray-400">{payment.method} • {payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs capitalize ${
                        payment.status === 'completed' ? 'text-green-400' :
                        payment.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {payment.status === 'completed' ? 'Pago' : 
                         payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Assinaturas Ativas</span>
              </h4>
              <button className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center space-x-1">
                <span>Gerenciar</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {loadingFinancials ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg">
                      <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                subscriptions.slice(0, 4).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        subscription.status === 'GRACE_PERIOD' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{subscription.user}</p>
                        <p className="text-xs text-gray-400">{subscription.plan} • {subscription.endDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">R$ {subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className={`text-xs capitalize ${
                        subscription.status === 'ACTIVE' ? 'text-green-400' :
                        subscription.status === 'GRACE_PERIOD' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {subscription.status === 'ACTIVE' ? 'Ativa' : 
                         subscription.status === 'GRACE_PERIOD' ? 'Período de Graça' : 'Expirada'}
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