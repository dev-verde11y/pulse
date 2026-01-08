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
      label: 'Sala do Trono',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'content',
      label: 'Grimórios & Sagas',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      children: [
        {
          id: 'animes',
          label: 'Sagas (Animes)',
          href: '/admin/animes',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          )
        },
        {
          id: 'seasons',
          label: 'Eras (Temporadas)',
          href: '/admin/seasons',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'episodes',
          label: 'Capítulos (Episódios)',
          href: '/admin/episodes',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'hero-banners',
          label: 'Estandartes (Banners)',
          href: '/admin/hero-banners',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M12 3v10m0 0l-3-3m3 3l3-3" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'users-system',
      label: 'Guilda & Tesouro',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        {
          id: 'users',
          label: 'Aventureiros (Usuários)',
          href: '/admin/users',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          id: 'subscriptions',
          label: 'Pactos (Assinaturas)',
          href: '/admin/subscriptions',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'plans',
          label: 'Hierarquia (Planos)',
          href: '/admin/plans',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )
        },
        {
          id: 'payments',
          label: 'Baú do Tesouro',
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
      id: 'system',
      label: 'Sistema Arcano',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        {
          id: 'storage',
          label: 'Relíquia Única (Simples)',
          href: '/admin/storage',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          )
        },
        {
          id: 'bulk-upload',
          label: 'Arsenais em Massa (Lote)',
          href: '/admin/storage/bulk',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        },
        {
          id: 'notifications',
          label: 'Mensageiro',
          href: '/admin/notifications',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Oráculo de Dados',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      children: [
        {
          id: 'watch-history',
          label: 'Crônicas de Visita',
          href: '/admin/watch-history',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'favorites-analytics',
          label: 'Favoritos da Plebe',
          href: '/admin/favorites',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'settings',
      label: 'Leis do Reino',
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
            className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-4 py-3'} text-sm font-bold rounded-xl transition-all duration-300 group relative overflow-hidden ${active || item.children?.some(child => isActive(child.href))
              ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 text-purple-200 border border-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40'
              }`}
            title={collapsed ? item.label : undefined}
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className={`relative z-10 transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : 'group-hover:scale-110'} ${active || item.children?.some(child => isActive(child.href))
              ? 'text-purple-400'
              : 'text-gray-500 group-hover:text-purple-300'
              }`}>
              {item.icon}
            </div>
            {!collapsed && (
              <>
                <span className="relative z-10 ml-4 flex-1 text-left group-hover:translate-x-1 transition-transform duration-300 tracking-wide">{item.label}</span>
                <svg
                  className={`relative z-10 w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
            <div className="ml-4 mt-1 space-y-1 relative border-l border-purple-500/20 pl-2">
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
        className={`${collapsed ? 'w-12 h-12 mx-auto' : 'w-full'} flex items-center ${collapsed ? 'justify-center' : 'px-4 py-3'} text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${level > 0 && !collapsed ? 'ml-1' : ''
          } ${active
            ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-200 border border-purple-500/30 shadow-lg shadow-purple-500/5'
            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/40'
          }`}
        title={collapsed ? item.label : undefined}
      >
        <div className={`transition-all duration-300 ${collapsed ? 'group-hover:scale-125' : 'group-hover:scale-110'} ${active ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 group-hover:text-purple-300'
          }`}>
          {item.icon}
        </div>
        {!collapsed && (
          <>
            <span className="ml-4 flex-1 group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
            {item.badge && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all duration-300 ${active
                ? 'bg-purple-500/30 text-purple-200 border border-purple-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
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
    <div className={`relative bg-[#020617] border-r border-purple-900/30 flex flex-col transition-all duration-300 shadow-2xl z-50 ${collapsed ? 'w-16' : 'w-72'
      }`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none"></div>

      {/* Header */}
      <div className="relative p-4 border-b border-purple-900/30 bg-gradient-to-r from-gray-900/80 to-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-end">
          <button
            onClick={onToggle}
            className="group p-2 rounded-lg text-gray-500 hover:text-purple-300 transition-all duration-300"
          >
            <svg className={`w-5 h-5 transition-all duration-300 ${collapsed ? 'rotate-180' : ''} group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info - Game Master Profile */}
      {!collapsed && (
        <div className="relative overflow-hidden px-6 py-6 border-b border-purple-900/30 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-200 to-indigo-200">
                    {user?.name?.charAt(0).toUpperCase() || 'GM'}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-950 shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-purple-400 tracking-wider mb-0.5">GAME MASTER</p>
              <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                {user?.name || 'Administrador'}
              </h3>
              <p className="text-[10px] text-gray-500 truncate font-mono mt-0.5">
                Lvl. {user?.role === 'ADMIN' ? '99' : '1'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar ${collapsed ? 'p-2' : 'p-4'} space-y-2`}>
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer Actions */}
      <div className={`relative p-4 border-t border-purple-900/30 bg-gray-950/50 ${collapsed ? 'items-center' : ''} flex flex-col gap-2`}>
        <Link
          href="/dashboard"
          className={`${collapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full px-4 py-2.5'} flex items-center text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-700`}
          title="Teleportar para o Mundo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!collapsed && <span className="ml-3">Mundo Mortal (Site)</span>}
        </Link>
      </div>
    </div>
  )
}