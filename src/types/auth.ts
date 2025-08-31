export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  currentPlan?: 'FREE' | 'FAN' | 'MEGA_FAN' | 'MEGA_FAN_ANNUAL'
  role?: string
  subscriptionStatus?: string
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
  subscriptionInfo: SubscriptionInfo | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string
}

export interface SubscriptionInfo {
  isExpired?: boolean
  isInGracePeriod?: boolean
  daysUntilExpiry?: number | null
  subscriptionStatus?: string
  expiredWarning?: string
  gracePeriodWarning?: string
  graceDaysLeft?: number
  showRenewalModal?: boolean
  availablePlans?: any[]
}

export interface AuthResponse {
  message: string
  user: User
  token: string
  subscriptionInfo?: SubscriptionInfo
}