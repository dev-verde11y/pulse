'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
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
  const [genres, setGenres] = useState<{name: string, displayName: string, count: number}[]>([])
  const [loadingGenres, setLoadingGenres] = useState(false)
  
  const { user, logout } = useAuth()
  const { favoritesCount, loading: favoritesLoading } = useFavorites()
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

  // Carregar gêneros quando abrir dropdown de categorias
  const loadGenres = async () => {
    if (genres.length === 0 && !loadingGenres) {
      setLoadingGenres(true)
      try {
        const response = await fetch('/api/genres')
        if (response.ok) {
          const data = await response.json()
          setGenres(data.genres || [])
        }
      } catch (error) {
        console.error('Erro ao carregar gêneros:', error)
      } finally {
        setLoadingGenres(false)
      }
    }
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl blur-sm"></div>
                <Image
                  src="/images/logo.png"
                  alt="Logo Pulse"
                  width={44}
                  height={44}
                  className="relative rounded-xl shadow-lg border border-gray-700/50"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-white">
                  Stream.
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <SearchBar variant="header" className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link href="/news" className="relative group text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 hover:backdrop-blur-sm">
              Novidades
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
            </Link>
            <Link href="/popular" className="relative group text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-600/20 hover:backdrop-blur-sm">
              Populares
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"></div>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => {
                  setIsCategoriesOpen(!isCategoriesOpen)
                  if (!isCategoriesOpen) loadGenres()
                }}
                className={`relative group text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-300 flex items-center ${
                  isCategoriesOpen 
                    ? 'bg-gray-800/50 backdrop-blur-sm' 
                    : 'hover:bg-gray-800/30 hover:backdrop-blur-sm'
                }`}
              >
                Categorias
                <svg className={`ml-2 h-4 w-4 transform transition-all duration-300 ${isCategoriesOpen ? 'rotate-180 text-gray-300' : 'group-hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-950/98 backdrop-blur-lg border border-gray-800/50 rounded-xl shadow-2xl z-50">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-800/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Categorias</h3>
                      {loadingGenres && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Gêneros Populares */}
                    <div>
                      <h4 className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                        Gêneros Populares
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {genres.slice(0, 8).map((genre) => (
                          <Link
                            key={genre.name}
                            href={`/categoria/${encodeURIComponent(genre.name)}`}
                            className="group flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/40 hover:bg-blue-600/20 border border-gray-800/40 hover:border-blue-600/30 transition-all duration-200"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <span className="text-sm text-gray-300 group-hover:text-white truncate">
                              {genre.displayName}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-blue-400 ml-1 flex-shrink-0">
                              {genre.count}
                            </span>
                          </Link>
                        ))}
                      </div>
                      {genres.length > 8 && (
                        <Link
                          href="/search?q=*"
                          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-3 font-medium group"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          Ver todos os gêneros
                          <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>

                    {/* Tipos e Seções */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Por Tipo */}
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                          Por Tipo
                        </h4>
                        <div className="space-y-1">
                          {[
                            { name: 'Animes', href: '/categoria/tipo/anime' },
                            { name: 'Filmes', href: '/categoria/tipo/filme' },
                            { name: 'Séries', href: '/categoria/tipo/serie' }
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block px-2 py-1.5 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800/50 transition-colors"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Seções */}
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                          Seções
                        </h4>
                        <div className="space-y-1">
                          {[
                            { name: 'Lançamentos', href: '/news' },
                            { name: 'Populares', href: '/popular' }
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block px-2 py-1.5 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800/50 transition-colors"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Menu and Mobile Button */}
          <div className="flex items-center space-x-1">
            {/* Search Button for Mobile/Tablet */}
            <Link 
              href="/search" 
              className="md:hidden p-1.5 sm:p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-800/50 group"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

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
                      className="flex items-center p-2 rounded-xl hover:bg-gray-800/30 transition-all duration-300 group border border-transparent hover:border-gray-700/50 backdrop-blur-sm"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                        <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-gray-700/50 group-hover:ring-blue-500/50 group-hover:scale-105 transition-all duration-300">
                          <span className="text-sm font-black text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 hidden lg:block">
                        <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{user?.name || 'Admin'}</div>
                        <div className="text-xs font-medium text-blue-400 group-hover:text-cyan-400 transition-colors">{formatPlanName(user?.currentPlan)}</div>
                      </div>
                      <svg className="ml-2 h-4 w-4 text-gray-400 group-hover:text-white transition-all duration-300 hidden lg:block group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 bg-gray-950/98 backdrop-blur-lg border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden">
                        {/* Header do Menu */}
                        <div className="px-4 py-3 border-b border-gray-800/30">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-sm"></div>
                              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-gray-700/50">
                                <span className="text-sm font-black text-white">
                                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white text-sm truncate">{user?.name || 'Administrador'}</div>
                              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {user?.role === 'ADMIN' && (
                                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center">
                                    Admin
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
                        
                        {/* Menu Items */}
                        <div className="p-3 space-y-1">
                          <Link href="/profile" className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group">
                            <div className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span>Perfil</span>
                          </Link>
                          
                          <Link href="/favorites" className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group">
                            <div className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                            <span>Lista</span>
                            {favoritesCount > 0 && (
                              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {favoritesCount}
                              </span>
                            )}
                          </Link>

                          {user?.role === 'ADMIN' && (
                            <div className="pt-2 border-t border-gray-800/30">
                              <a href="#" className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-red-600/10 rounded-lg transition-all duration-200 group">
                                <div className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors">
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <span>Painel Admin</span>
                              </a>
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-gray-800/30">
                            <button 
                              onClick={handleLogout}
                              className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-all duration-200 group"
                            >
                              <div className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              </div>
                              <span>Sair</span>
                            </button>
                          </div>
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
                className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-300 group ${
                  isMobileMenuOpen 
                    ? 'text-white bg-gray-800/50' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="sr-only">Abrir menu principal</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-5 w-5 rotate-90 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-950/98 backdrop-blur-lg border-t border-gray-800/50 animate-slide-down">
          {/* Mobile Quick Search */}
          <div className="px-4 py-3 border-b border-gray-800/30">
            <Link 
              href="/search" 
              className="flex items-center w-full px-4 py-3 text-gray-400 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="h-5 w-5 mr-3 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="group-hover:text-white transition-colors">Pesquisar animes, filmes, séries...</span>
            </Link>
          </div>
          
          <div className="p-4 space-y-2">
            {/* Navigation Links */}
            <div className="space-y-1">
              <Link 
                href="/news" 
                className="text-white font-semibold hover:text-blue-400 hover:bg-gray-800/30 block px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Novidades
              </Link>
              
              <Link 
                href="/popular" 
                className="text-white font-semibold hover:text-blue-400 hover:bg-gray-800/30 block px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Populares
              </Link>

              {/* Popular Categories */}
              <div className="pt-2 border-t border-gray-800/30">
                <div className="px-4 py-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Categorias Populares</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {genres.slice(0, 6).map((genre) => (
                    <Link
                      key={genre.name}
                      href={`/categoria/${encodeURIComponent(genre.name)}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/40 hover:bg-gray-800/50 border border-gray-800/40 hover:border-gray-700/50 transition-all duration-200 group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm text-gray-300 group-hover:text-white truncate">
                        {genre.displayName}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-blue-400 ml-1 flex-shrink-0">
                        {genre.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 pb-2 border-t border-gray-700">
            {user && (
              <>
                <div className="flex items-center px-3 py-2.5 mb-2 bg-gray-800/30 mx-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-semibold text-white">{user?.name || 'Admin'}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xs text-gray-300 truncate">{user?.email}</div>
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
                  <Link href="/profile" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                    <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Meu Perfil
                  </Link>
                  <Link href="/favorites" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all">
                    <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Minha Lista
                    {favoritesCount > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600/20 transition-all"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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