'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { api } from '@/lib/api'
import { 
  UserIcon,
  KeyIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'

interface ProfileData {
  name: string
  currentPlan: string
  subscriptionStatus: string
  createdAt: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    currentPlan: '',
    subscriptionStatus: '',
    createdAt: ''
  })
  
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({})
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({})
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        currentPlan: user.currentPlan || 'FREE',
        subscriptionStatus: user.subscriptionStatus || '',
        createdAt: user.createdAt || ''
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrors({})
    setSaving(true)

    try {
      if (!profileData.name.trim()) {
        setProfileErrors({ name: 'Nome e obrigatorio' })
        return
      }

      const updatedUser = await api.updateProfile(profileData.name)
      updateUser(updatedUser)
      setIsEditingProfile(false)
      setSuccessMessage('Perfil atualizado com sucesso!')
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      setProfileErrors({ 
        general: error.message || 'Erro ao atualizar perfil' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    setSaving(true)

    try {
      if (!passwordData.currentPassword) {
        setPasswordErrors({ currentPassword: 'Senha atual e obrigatoria' })
        return
      }

      if (!passwordData.newPassword) {
        setPasswordErrors({ newPassword: 'Nova senha e obrigatoria' })
        return
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordErrors({ newPassword: 'Nova senha deve ter pelo menos 6 caracteres' })
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors({ confirmPassword: 'Senhas nao conferem' })
        return
      }

      await api.changePassword(passwordData.currentPassword, passwordData.newPassword)

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      setSuccessMessage('Senha alterada com sucesso!')
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      setPasswordErrors({ 
        general: error.message || 'Erro ao alterar senha' 
      })
    } finally {
      setSaving(false)
    }
  }

  const formatPlanName = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'Gratis'
      case 'FAN': return 'Fan'
      case 'MEGA_FAN': return 'Mega Fan'
      case 'MEGA_FAN_ANNUAL': return 'Super Premium'
      default: return 'Gratis'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  {profileData.currentPlan !== 'FREE' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {profileData.name || 'Usuario'}
                  </h1>
                  <p className="text-gray-400 mb-3">{user?.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                      {formatPlanName(profileData.currentPlan)}
                    </span>
                    {user?.role === 'ADMIN' && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-400" />
                <span className="text-green-300">{successMessage}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Informacoes Pessoais
                  </h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isEditingProfile ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {profileErrors.general && (
                      <div className="p-3 bg-red-900/50 border border-red-800 rounded text-red-300 text-sm">
                        {profileErrors.general}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nome de exibicao</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Seu nome"
                      />
                      {profileErrors.name && <p className="text-red-400 text-xs mt-1">{profileErrors.name}</p>}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nome</label>
                      <p className="text-white">{profileData.name || 'Nao definido'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <p className="text-white">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email nao pode ser alterado por seguranca</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Seguranca
                  </h2>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isChangingPassword ? 'Cancelar' : 'Alterar Senha'}
                  </button>
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {passwordErrors.general && (
                      <div className="p-3 bg-red-900/50 border border-red-800 rounded text-red-300 text-sm">
                        {passwordErrors.general}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Senha Atual</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.current ? <EyeIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nova Senha</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Nova senha (min 6 caracteres)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.new ? <EyeIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Confirmar Senha</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="Confirme a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.confirm ? <EyeIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                      >
                        {saving ? 'Alterando...' : 'Alterar Senha'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          setPasswordErrors({})
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <KeyIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Sua conta esta protegida</p>
                    <p className="text-gray-500 text-xs mt-1">Senha segura e criptografada</p>
                  </div>
                )}
              </div>

            </div>

            <div className="space-y-6">
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto ${
                  profileData.currentPlan === 'FREE' 
                    ? 'bg-gray-700' 
                    : 'bg-blue-600'
                }`}>
                  <span className="text-xl">
                    {profileData.currentPlan === 'FREE' ? '🆓' : '⭐'}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-1">{formatPlanName(profileData.currentPlan)}</h4>
                <p className="text-gray-400 text-sm">Status: Ativo</p>
                
                {profileData.currentPlan === 'FREE' && (
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                    Fazer Upgrade
                  </button>
                )}
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">Detalhes da Conta</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Membro desde</p>
                    <p className="text-white text-sm">{formatDate(profileData.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID da Conta</p>
                    <p className="text-white text-sm font-mono">{user.id.slice(-8)}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div>
                      <p className="text-sm text-gray-400">Privilegios</p>
                      <p className="text-blue-400 text-sm">Administrator</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}