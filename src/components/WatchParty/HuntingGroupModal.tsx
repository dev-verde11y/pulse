'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface HuntingGroup {
    id: string
    name: string
    animeId: string
    status: 'OPEN' | 'HUNTING' | 'CLOSED'
    leader: {
        name: string
        avatar: string | null
    }
    members: {
        user: {
            avatar: string | null
        }
    }[]
    _count?: {
        members: number
    }
}

interface HuntingGroupModalProps {
    isOpen: boolean
    onClose: () => void
    animeId?: string // Optional: if provided, auto-selects this anime for creation
    episodeId?: string // Optional
}

export default function HuntingGroupModal({ isOpen, onClose, animeId, episodeId }: HuntingGroupModalProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
    const [groups, setGroups] = useState<HuntingGroup[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    // Fetch active groups
    useEffect(() => {
        if (isOpen && activeTab === 'list') {
            fetchGroups()
        }
    }, [isOpen, activeTab])

    const fetchGroups = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/hunting-groups')
            if (res.ok) {
                const data = await res.json()
                setGroups(data)
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!animeId) {
            alert('Selecione um anime para começar a caçada (por enquanto, inicie da página do anime)')
            return
        }

        setIsCreating(true)
        try {
            const res = await fetch('/api/hunting-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    animeId,
                    episodeId
                })
            })

            if (res.ok) {
                const group = await res.json()
                router.push(`/watch-party/${group.id}`)
                onClose()
            }
        } catch (error) {
            console.error('Error creating group:', error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleJoinGroup = async (groupId: string) => {
        try {
            const res = await fetch(`/api/hunting-groups/${groupId}/join`, {
                method: 'POST'
            })

            if (res.ok) {
                router.push(`/watch-party/${groupId}`)
                onClose()
            }
        } catch (error) {
            console.error('Error joining group:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🛡️</span> Guilda de Caçadores
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'list'
                            ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-800/30'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                            }`}
                    >
                        Grupos Ativos
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'create'
                            ? 'text-green-500 border-b-2 border-green-500 bg-gray-800/30'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                            }`}
                    >
                        Criar Grupo
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {activeTab === 'list' ? (
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-10 text-gray-500">Buscando grupos...</div>
                            ) : groups.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 mb-4">Nenhum grupo de caça ativo no momento.</p>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="text-orange-500 hover:text-orange-400 font-bold"
                                    >
                                        Seja o primeiro a criar!
                                    </button>
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 relative overflow-hidden">
                                                {group.leader.avatar ? (
                                                    <Image src={group.leader.avatar} alt={group.leader.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg group-hover:text-orange-500 transition-colors">
                                                    {group.name || `Grupo de ${group.leader.name}`}
                                                </h3>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    <span className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300">
                                                        Líder: {group.leader.name}
                                                    </span>
                                                    <span className="text-xs">•</span>
                                                    <span className="text-gray-500">{group.members.length} caçadores</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleJoinGroup(group.id)}
                                            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold transition-transform hover:scale-105"
                                        >
                                            JUNTAR-SE
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center">
                            {!animeId ? (
                                <div className="text-center text-yellow-500 p-4 border border-yellow-900/50 bg-yellow-900/10 rounded-xl">
                                    ⚠️ Para criar um grupo, primeiro entre na página de um anime ou episódio.
                                </div>
                            ) : (
                                <form onSubmit={handleCreateGroup} className="space-y-6 max-w-md mx-auto w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Nome da Grupo (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            placeholder="Ex: Caçada Noturna de Fullmetal"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>

                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                        <h4 className="font-bold text-gray-300 mb-2">Configurações da Sessão</h4>
                                        <ul className="text-sm text-gray-400 space-y-2">
                                            <li className="flex items-center gap-2">✅ Chat em tempo real (Taberna)</li>
                                            <li className="flex items-center gap-2">✅ Sincronização automática</li>
                                            <li className="flex items-center gap-2">ℹ️ Se já tiver um grupo, ele será atualizado para este episódio.</li>
                                        </ul>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreating ? 'Processando...' : '⚔️ INICIAR CAÇADA (CRIAR/ATUALIZAR)'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
