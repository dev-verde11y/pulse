export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}