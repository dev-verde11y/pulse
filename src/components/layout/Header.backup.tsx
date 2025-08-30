'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import Image from "next/image"
import Link from "next/link"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { user, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
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
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo-ini.png"
                alt="Logo Pulse"
                width={40}
                height={40}
                className="rounded-lg shadow-xl"
                priority
              />
              <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 hidden sm:block">
                PULSE
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className={navLinkClass}>
              <span className={navLinkTextClass}>Novidades</span>
              <span className={navLinkUnderlineClass}></span>
            </a>
            <a href="#" className={navLinkClass}>
              <span className={navLinkTextClass}>Populares</span>
              <span className={navLinkUnderlineClass}></span>
            </a>

            {/* Categories Dropdown */}
            <div className="relative group" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group-hover:bg-gray-800"
              >
                Categorias
                <svg className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-slide-down">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {categories.map((category) => (
                      <div key={category.name} className="flex flex-col">
                        <h3 className="text-sm font-semibold text-blue-400 mb-2">{category.name}</h3>
                        <ul className="space-y-1">
                          {category.subcategories.map((sub) => (
                            <li key={sub}>
                              <a
                                href="#"
                                className="text-xs text-gray-300 hover:text-blue-400 block px-2 py-1 rounded hover:bg-gray-700 transition-colors duration-150"
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
              )}
            </div>

            <a href="#" className={navLinkClass}>
              <span className={navLinkTextClass}>Notícias</span>
              <span className={navLinkUnderlineClass}></span>
            </a>
          </nav>

          {/* User Menu and Mobile Button */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Search Button for Mobile/Tablet */}
            <button className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  {/* Watchlist Quick Access */}
                  <button className="relative p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-full hover:bg-gray-800 group">
                    <span className="sr-only">Minha Lista</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      12
                    </div>
                  </button>

                  {/* Notifications */}
                  <div className="relative group">
                    <button className="relative p-2 rounded-full text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-800">
                      <span className="sr-only">Ver notificações</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
                      </svg>
                      {/* Notification badge */}
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                        3
                      </div>
                    </button>
                  </div>

                  {/* Profile dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center text-sm transition-all duration-200 group"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-gray-700 group-hover:border-blue-400 group-hover:scale-105 transition-all duration-200">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-2 hidden xl:block">
                        <div className="text-sm font-medium text-white truncate max-w-24">{user?.name || 'Usuário'}</div>
                        <div className="text-xs text-gray-400">Premium</div>
                      </div>
                      <svg className="ml-1 h-4 w-4 text-gray-400 group-hover:text-white transition-colors hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-3 w-64 rounded-xl shadow-2xl bg-gray-800/95 backdrop-blur-md border border-gray-700 animate-scale-in-up">
                        <div className="px-4 py-4 border-b border-gray-700/50">
                          <div className="flex items-center">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <span className="text-lg font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="font-semibold text-white">{user?.name || 'Usuário'}</div>
                              <div className="text-sm text-gray-400">{user?.email}</div>
                              <div className="flex items-center mt-1">
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
                                <span className="ml-2 text-xs text-green-400">• Online</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded-lg mx-2">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span>Perfil</span>
                          </a>
                          <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded-lg mx-2">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            <span>Minha Lista</span>
                            <span className="ml-auto bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">12</span>
                          </a>
                          <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded-lg mx-2">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            <span>Preferências</span>
                          </a>
                          <div className="border-t border-gray-700/50 my-2"></div>
                          <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded-lg mx-2">
                            <svg className="w-4 h-4 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <span>Gerenciar Premium</span>
                            <span className="ml-auto text-yellow-400 text-xs">★</span>
                          </a>
                          <a href="#" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150 rounded-lg mx-2">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>Configurações</span>
                          </a>
                          <div className="border-t border-gray-700/50 my-2"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-600/10 transition-colors duration-150 rounded-lg mx-2"
                          >
                            <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>Sair da conta</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button variant="primary">Entrar</Button>
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
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 py-2 animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Novidades</a>
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Populares</a>
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Categorias</a>
            <a href="#" className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Notícias</a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user && (
              <>
                <div className="flex items-center px-5 mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-base font-semibold text-white">{user?.name || 'Usuário'}</div>
                    <div className="text-sm text-gray-300">{user?.email}</div>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <a href="#" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Editar Perfil
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Favoritos
                  </a>
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-white hover:bg-red-600 transition-all"
                    >
                      <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sair da conta
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}