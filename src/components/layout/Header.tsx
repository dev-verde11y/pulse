'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import Image from "next/image"
import Link from "next/link"

interface Notification {
  id: number
  type: 'new_episode' | 'new_season' | 'recommendation' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

// Helper function to format plan names for display
const formatPlanName = (planType: string | undefined): string => {
  switch (planType) {
    case 'FREE':
      return 'Grátis'
    case 'FAN':
      return 'Fan'
    case 'MEGA_FAN':
      return 'Mega Fan'
    case 'MEGA_FAN_ANNUAL':
      return 'Super Premium'
    default:
      return 'Grátis'
  }
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { user, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Mock notifications data
  const [mockNotifications, setMockNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'new_episode',
      title: 'Novo episódio disponível!',
      message: 'Dr. Stone - Episódio 24 "Science Future" já está disponível.',
      time: '2 min atrás',
      read: false
    },
    {
      id: 2,
      type: 'new_season',
      title: 'Nova temporada lançada!',
      message: 'One Piece - Temporada 21 "Wano Arc" acaba de ser lançada.',
      time: '1 hora atrás',
      read: false
    },
    {
      id: 3,
      type: 'recommendation',
      title: 'Recomendação para você',
      message: 'Com base no que você assistiu, recomendamos "Attack on Titan".',
      time: '3 horas atrás',
      read: false
    },
    {
      id: 4,
      type: 'system',
      title: 'Conta Premium ativada',
      message: 'Sua conta Premium foi ativada com sucesso. Aproveite!',
      time: '1 dia atrás',
      read: true
    },
    {
      id: 5,
      type: 'new_episode',
      title: 'Episódio adicionado à sua lista',
      message: 'Chainsaw Man - Episódio 12 foi adicionado à sua lista.',
      time: '2 dias atrás',
      read: true
    }
  ])

  // Functions for notifications
  const markAsRead = (notificationId: number) => {
    setMockNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setMockNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    function handleScroll() {
      setIsScrolled(window.scrollY > 10)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const categories = [
    { name: 'Filmes', subcategories: ['Ação', 'Drama', 'Comédia', 'Terror', 'Ficção Científica'] },
    { name: 'Séries', subcategories: ['Drama', 'Comédia', 'Reality Show', 'Documentário'] },
    { name: 'Documentários', subcategories: ['Natureza', 'História', 'Tecnologia', 'Biografias'] },
    { name: 'Anime', subcategories: ['Shounen', 'Shoujo', 'Seinen', 'Josei'] }
  ]

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const navLinkClass = "relative group text-sm font-medium transition-colors"
  const navLinkTextClass = "text-gray-300 hover:text-white transition-colors duration-200"
  const navLinkUnderlineClass = "absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 group-hover:w-full transition-all duration-300 ease-in-out"

  return (
    <header className={`text-white sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-2xl' 
        : 'bg-gray-950/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt="Logo Pulse"
                width={32}
                height={32}
                className="rounded-lg shadow-xl"
                priority
              />
              <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 hidden sm:block">
                PULSE
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <SearchBar variant="header" className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800/50">
              Novidades
            </a>
            <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800/50">
              Populares
            </a>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center hover:bg-gray-800/50"
              >
                Categorias
                <svg className={`ml-1 h-3 w-3 transform transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <div key={category.name} className="flex flex-col">
                          <h3 className="text-sm font-bold text-blue-400 mb-2">{category.name}</h3>
                          <ul className="space-y-1">
                            {category.subcategories.map((sub) => (
                              <li key={sub}>
                                <a
                                  href="#"
                                  className="text-sm text-gray-300 hover:text-white block px-2 py-1 rounded hover:bg-gray-800/50 transition-colors duration-150"
                                >
                                  {sub}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Menu and Mobile Button */}
          <div className="flex items-center space-x-1">
            {/* Search Button for Mobile/Tablet */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2 rounded-lg text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-800/50"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
                      </svg>
                      {mockNotifications.filter(n => !n.read).length > 0 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <span className="text-xs font-bold text-white">{mockNotifications.filter(n => !n.read).length}</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Notificações</h3>
                            <button 
                              onClick={markAllAsRead}
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Marcar todas como lidas
                            </button>
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {mockNotifications.length > 0 ? (
                            mockNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-blue-600/10' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                                    !notification.read ? 'bg-blue-500' : 'bg-gray-600'
                                  }`} />
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-white mb-1">{notification.title}</h4>
                                    <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">{notification.time}</span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        notification.type === 'new_episode' ? 'bg-green-600/20 text-green-400' :
                                        notification.type === 'new_season' ? 'bg-blue-600/20 text-blue-400' :
                                        notification.type === 'recommendation' ? 'bg-purple-600/20 text-purple-400' :
                                        'bg-gray-600/20 text-gray-400'
                                      }`}>
                                        {notification.type === 'new_episode' ? 'Novo Episódio' :
                                         notification.type === 'new_season' ? 'Nova Temporada' :
                                         notification.type === 'recommendation' ? 'Recomendação' :
                                         'Sistema'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <svg className="h-12 w-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 5l-8.5 8.5a2.121 2.121 0 003 3L14 8l-3-3zM9 11l4 4" />
                              </svg>
                              <p className="text-gray-400">Nenhuma notificação</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center p-1 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
                        <span className="text-xs font-bold text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="ml-2 hidden lg:block">
                        <div className="text-sm font-medium text-white">{user?.name || 'Admin'}</div>
                        <div className="text-xs text-blue-400">{formatPlanName(user?.currentPlan)}</div>
                      </div>
                      <svg className="ml-1 h-3 w-3 text-gray-400 group-hover:text-white transition-colors hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-2xl bg-gray-800/95 backdrop-blur-md border border-gray-700 animate-scale-in-up">
                        <div className="px-3 py-3 border-b border-gray-700/50">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <span className="text-sm font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="font-semibold text-white text-sm">{user?.name || 'Admin'}</div>
                              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {user?.role === 'ADMIN' && (
                                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z"/>
                                    </svg>
                                    ADMIN
                                  </span>
                                )}
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  user?.currentPlan === 'FREE' 
                                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                    : user?.currentPlan === 'FAN'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                    : user?.currentPlan === 'MEGA_FAN' || user?.currentPlan === 'MEGA_FAN_ANNUAL'
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                                }`}>
                                  {formatPlanName(user?.currentPlan)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <a href="#" className="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded mx-2">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span>Perfil</span>
                          </a>
                          <a href="#" className="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded mx-2">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            <span>Lista</span>
                            <span className="ml-auto bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full">12</span>
                          </a>
                          <a href="#" className="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded mx-2">
                            <svg className={`w-4 h-4 mr-2 ${
                              user?.currentPlan === 'FREE' ? 'text-gray-400' :
                              user?.currentPlan === 'FAN' ? 'text-blue-400' :
                              'text-yellow-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <span>{formatPlanName(user?.currentPlan)}</span>
                          </a>
                          {user?.role === 'ADMIN' && (
                            <>
                              <div className="border-t border-gray-700/50 my-1 mx-2"></div>
                              <a href="#" className="flex items-center px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded mx-2">
                                <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Painel Admin</span>
                              </a>
                            </>
                          )}
                          <div className="border-t border-gray-700/50 my-1 mx-2"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-600/10 transition-colors duration-150 rounded mx-2"
                          >
                            <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button variant="primary" className="text-sm py-1.5 px-3">Entrar</Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Abrir menu principal</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                ) : (
                  <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700 animate-slide-down">
          {/* Mobile Search Bar */}
          <div className="px-4 py-3 border-b border-gray-700">
            <SearchBar className="w-full" />
          </div>
          
          <div className="px-2 py-3 space-y-1">
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-3 py-3 rounded-lg text-base font-medium flex items-center">
              <svg className="h-5 w-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Novidades
            </a>
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-3 py-3 rounded-lg text-base font-medium flex items-center">
              <svg className="h-5 w-5 mr-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Populares
            </a>
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-3 py-3 rounded-lg text-base font-medium flex items-center">
              <svg className="h-5 w-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Categorias
            </a>
          </div>
          <div className="pt-3 pb-3 border-t border-gray-700">
            {user && (
              <>
                <div className="flex items-center px-4 py-3 mb-2 bg-gray-800/30 mx-2 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-semibold text-white">{user?.name || 'Admin'}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm text-gray-300 truncate">{user?.email}</div>
                      <div className="flex items-center gap-1">
                        {user?.role === 'ADMIN' && (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z"/>
                            </svg>
                            ADMIN
                          </span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          user?.currentPlan === 'FREE' 
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            : user?.currentPlan === 'FAN'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : user?.currentPlan === 'MEGA_FAN' || user?.currentPlan === 'MEGA_FAN_ANNUAL'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                        }`}>
                          {formatPlanName(user?.currentPlan)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <a href="#" className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Meu Perfil
                  </a>
                  <a href="#" className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Minha Lista
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">12</span>
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:text-white hover:bg-red-600/20 transition-all"
                  >
                    <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}