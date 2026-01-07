'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthContextType, User, AuthResponse, SubscriptionInfo } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)

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
      } catch {
        logout()
      }
    }

    // Verifica a cada minuto
    const interval = setInterval(checkTokenExpiration, 60000)

    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    // Carrega token do localStorage na inicialização
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          // Verifica se o token expirou antes de usar
          const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]))
          const isExpired = tokenPayload.exp * 1000 < Date.now()

          if (isExpired) {
            // Token expirado, remove dados
            logout()
          } else {
            // Atualiza estado de forma batch para evitar re-renders
            const userData = JSON.parse(storedUser)
            setToken(storedToken)
            setUser(userData)
            // Verifica se o token ainda é válido no servidor (em background)
            validateToken(storedToken)
          }
        }
      } catch {
        // Token inválido, remove dados
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadStoredAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Só atualiza se o usuário mudou
      setUser(prevUser => {
        if (JSON.stringify(prevUser) !== JSON.stringify(data.user)) {
          return data.user
        }
        return prevUser
      })
    } catch {
      // Token inválido, remove do localStorage silenciosamente
      logout()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)

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

      // Salva no localStorage e cookie de forma síncrona
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.subscriptionInfo) {
        localStorage.setItem('subscriptionInfo', JSON.stringify(data.subscriptionInfo))
      }
      // Salva no cookie para o middleware (7 dias)
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`

      // Atualiza estado de forma batch
      setToken(data.token)
      setUser(data.user)
      setSubscriptionInfo(data.subscriptionInfo || null)
      setLoading(false)

      // Retorna os dados para que o componente possa lidar com modal de renovação
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
      throw err
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

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null

      const updatedUser = { ...prevUser, ...userData }

      // Atualiza no localStorage
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } catch {
        // Ignore localStorage errors on server
      }

      return updatedUser
    })
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('subscriptionInfo')
      // Remove cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch {
      // Ignore localStorage errors on server
    }
    setToken(null)
    setUser(null)
    setSubscriptionInfo(null)
    setError(null)
  }

  // Função para atualizar dados do usuário
  const refreshUser = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    updateUser,
    logout,
    refreshUser,
    loading,
    error,
    subscriptionInfo,
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