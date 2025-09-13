'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: string | number
  children?: MenuItem[]
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    {
      id: 'content',
      label: 'Conteúdo',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        {
          id: 'animes',
          label: 'Animes',
          href: '/admin/animes',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v12a1 1 0 001 1h16a1 1 0 001-1V8H3z" />
            </svg>
          )
        },
        {
          id: 'seasons',
          label: 'Temporadas',
          href: '/admin/seasons',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        },
        {
          id: 'episodes',
          label: 'Episódios',
          href: '/admin/episodes',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          id: 'hero-banners',
          label: 'Hero Banners',
          href: '/admin/hero-banners',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'users-system',
      label: 'Sistema de Usuários',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      children: [
        {
          id: 'users',
          label: 'Usuários',
          href: '/admin/users',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          id: 'subscriptions',
          label: 'Assinaturas',
          href: '/admin/subscriptions',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )
        },
        {
          id: 'plans',
          label: 'Planos',
          href: '/admin/plans',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'storage',
      label: 'Cloudflare R2',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      children: [
        {
          id: 'simple-upload',
          label: 'Upload Simples',
          href: '/admin/storage',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )
        },
        {
          id: 'bulk-upload',
          label: 'Upload em Lote',
          href: '/admin/storage/bulk',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10M17 11v6a2 2 0 01-2 2h-2m-4-6l2-2m0 0l2 2m-2-2v12" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Relatórios',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      children: [
        {
          id: 'dashboard-analytics',
          label: 'Dashboard',
          href: '/admin/analytics',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          id: 'watch-history',
          label: 'Histórico de Visualização',
          href: '/admin/watch-history',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'favorites-analytics',
          label: 'Favoritos',
          href: '/admin/favorites',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )
        },
        {
          id: 'payments',
          label: 'Pagamentos',
          href: '/admin/payments',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const active = isActive(item.href)

    if (hasChildren) {
      return (
        <div key={item.id} className={collapsed ? 'w-full' : ''}>
          <button
            onClick={() => !collapsed && toggleExpanded(item.id)}
            className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-4 py-3'} text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
              active || item.children?.some(child => isActive(child.href))
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 shadow-lg shadow-blue-500/10 border border-blue-500/30'
                : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:shadow-gray-900/20'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <div className={`transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : 'group-hover:scale-110'} ${
              active || item.children?.some(child => isActive(child.href))
                ? 'text-blue-400' 
                : 'text-gray-400 group-hover:text-white'
            }`}>
              {item.icon}
            </div>
            {!collapsed && (
              <>
                <span className="ml-4 flex-1 text-left font-medium group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
          
          {!collapsed && isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-4 py-3'} text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
          level > 0 && !collapsed ? 'ml-3' : ''
        } ${
          active
            ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 shadow-lg shadow-blue-500/10 border border-blue-500/30'
            : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 hover:shadow-lg hover:shadow-gray-900/20'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <div className={`transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : 'group-hover:scale-110'} ${
          active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
        }`}>
          {item.icon}
        </div>
        {!collapsed && (
          <>
            <span className="ml-4 flex-1 font-medium group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
            {item.badge && (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300 hover:scale-110 ${
                active 
                  ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-200 shadow-lg'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 group-hover:from-gray-600 group-hover:to-gray-500'
              }`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <div className={`bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/50 flex flex-col transition-all duration-300 shadow-2xl ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="flex items-center justify-end">
          <button
            onClick={onToggle}
            className="group p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20"
          >
            <svg className={`w-4 h-4 transition-all duration-300 ${collapsed ? 'rotate-180' : ''} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/30 to-gray-800/30 animate-fade-in">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-indigo-600/40 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl ring-2 ring-white/10 group-hover:ring-white/20 group-hover:scale-105 transition-all duration-300">
                <span className="text-sm font-black text-white drop-shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate group-hover:text-blue-200 transition-colors">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">{user?.email}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center shadow-lg">
                  <svg className="w-3 h-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z"/>
                  </svg>
                  ADMIN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className={`space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-gray-800/50 ${collapsed ? 'space-y-3' : 'space-y-2'}`}>
        <Link
          href="/dashboard"
          className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-3 py-2'} text-sm font-medium text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40 rounded-xl transition-all duration-300 group hover:shadow-lg`}
          title={collapsed ? 'Voltar ao Site' : undefined}
        >
          <svg className={`w-4 h-4 group-hover:text-white transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {!collapsed && <span className="ml-3 group-hover:translate-x-1 transition-transform duration-300">Voltar ao Site</span>}
        </Link>
        
        <button 
          className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-3 py-2'} text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/10 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/10`}
          title={collapsed ? 'Sair' : undefined}
        >
          <svg className={`w-4 h-4 group-hover:text-red-300 transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="ml-3 group-hover:translate-x-1 transition-transform duration-300">Sair</span>}
        </button>
      </div>
    </div>
  )
}