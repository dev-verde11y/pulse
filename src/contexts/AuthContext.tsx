'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthContextType, User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verifica expiração do token periodicamente
  useEffect(() => {
    if (!token) return

    const checkTokenExpiration = () => {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = tokenPayload.exp * 1000 < Date.now()
        
        if (isExpired) {
          logout()
        }
      } catch (error) {
        logout()
      }
    }

    // Verifica a cada minuto
    const interval = setInterval(checkTokenExpiration, 60000)
    
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    // Carrega token do localStorage na inicialização
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        // Verifica se o token expirou antes de usar
        try {
          const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]))
          const isExpired = tokenPayload.exp * 1000 < Date.now()
          
          if (isExpired) {
            // Token expirado, remove dados
            logout()
          } else {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            // Verifica se o token ainda é válido no servidor
            validateToken(storedToken)
          }
        } catch (error) {
          // Token inválido, remove dados
          logout()
        }
      }
    }
    setLoading(false)
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Token inválido')
      }
      
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      // Token inválido, remove do localStorage
      logout()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no login')
      }

      const data: AuthResponse = await response.json()
      
      // Salva no localStorage e cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Salva no cookie para o middleware (2 horas)
        document.cookie = `token=${data.token}; path=/; max-age=${2 * 60 * 60}` // 2 horas
      }
      
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro no registro')
      }

      const data: AuthResponse = await response.json()
      
      // Salva no localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Remove cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}