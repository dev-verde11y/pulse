'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import Image from 'next/image'

interface WatchPartyPageProps {
    params: Promise<{
        id: string
    }>
}

// ... types
import { Episode } from '@/types/anime'

interface GroupState {
    id: string
    name: string
    status: 'OPEN' | 'HUNTING' | 'CLOSED'
    animeId: string
    episodeId: string | null
    episode?: Episode | null // Added episode relation
    currentTime: number
    isPlaying: boolean
    leaderId: string
    leader: {
        id: string
        name: string
        avatar: string | null
    }
    members: {
        role: 'LEADER' | 'MEMBER'
        user: {
            id: string
            name: string
            avatar: string | null
        }
    }[]
}

export default function WatchPartyPage({ params }: WatchPartyPageProps) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuth()

    const [group, setGroup] = useState<GroupState | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showChat, setShowChat] = useState(true)
    const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat')

    // Join group on mount
    useEffect(() => {
        if (!user || isLoading) return // Wait for user and initial load (or at least valid ID)

        const joinGroup = async () => {
            try {
                await fetch(`/api/hunting-groups/${id}/join`, {
                    method: 'POST'
                })
            } catch (error) {
                console.error('Error joining group:', error)
            }
        }
        joinGroup()
    }, [id, user, isLoading])

    // Polling logic for sync
    useEffect(() => {
        const fetchGroupState = async () => {

            try {
                const res = await fetch(`/api/hunting-groups/${id}`, { cache: 'no-store' })
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Grupo não encontrado ou encerrado.')
                        return
                    }
                    throw new Error('Falha ao sincronizar')
                }
                const data = await res.json()
                setGroup(data)
                setIsLoading(false)
            } catch (err) {
                console.error(err)
            }
        }

        fetchGroupState()
        const interval = setInterval(fetchGroupState, 2000) // 2 seconds polling for faster sync

        return () => clearInterval(interval)
    }, [id])

    const isLeader = user?.id === group?.leaderId

    const updateGroupState = async (newState: Partial<GroupState>) => {
        if (!isLeader) return
        try {
            await fetch(`/api/hunting-groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newState)
            })
            // Optimistic update
            setGroup(prev => prev ? { ...prev, ...newState } : null)
        } catch (error) {
            console.error('Failed to update group state:', error)
        }
    }

    const onPlay = () => updateGroupState({ isPlaying: true, status: 'HUNTING' })
    const onPause = () => updateGroupState({ isPlaying: false })
    const onSeek = (time: number) => updateGroupState({ currentTime: time })

    // Chat Logic
    const [messages, setMessages] = useState<{ id: string, content: string, user: { name: string, avatar: string | null } }[]>([])
    const [newMessage, setNewMessage] = useState('')
    const chatEndRef = useRef<import('react').ElementRef<'div'>>(null)

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/hunting-groups/${id}/chat`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }, [id])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        try {
            const res = await fetch(`/api/hunting-groups/${id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            })

            if (res.ok) {
                setNewMessage('')
                fetchMessages() // Refresh immediately
            }
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Poll messages every 3s
    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [fetchMessages])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if (error || !group) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-3xl font-bold mb-4 text-red-500">Erro na Guilda</h1>
                <p className="text-gray-400 mb-8">{error || 'Não foi possível carregar os dados do grupo.'}</p>
                <button
                    onClick={() => router.push('/browse')}
                    className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500"
                >
                    Voltar para Home
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-gray-800 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                        ← Sair
                    </button>
                    <div>
                        <h1 className="font-bold text-lg flex items-center gap-2">
                            <span className="text-orange-500">🛡️</span>
                            {group.name || 'Grupo de Caça'}
                        </h1>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Ao Vivo ({group.members.length} caçadores)
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex gap-2">
                    {/* Member avatars preview */}
                    <div className="flex -space-x-2">
                        {group.members.slice(0, 5).map(member => (
                            <div key={member.user.id} className="w-8 h-8 rounded-full border-2 border-black bg-gray-700 overflow-hidden relative" title={member.user.name}>
                                {member.user.avatar ? (
                                    <Image src={member.user.avatar} alt={member.user.name} fill />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                )}
                            </div>
                        ))}
                        {group.members.length > 5 && (
                            <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs">
                                +{group.members.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </header>


            {/* Main Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Helper to sync video player - Logic to be implemented inside VideoPlayer wrapper or checking state here */}

                {/* Video Area */}
                <section className={`flex-1 flex items-center justify-center p-4 transition-all ${showChat ? 'mr-0 lg:mr-80' : ''}`}>
                    <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                        {group.episode && group.episodeId ? (
                            <VideoPlayer
                                episode={group.episode}
                                animeId={group.animeId}
                                isWatchParty={true}
                                // Sync Props
                                onPlayCallback={onPlay}
                                onPauseCallback={onPause}
                                onSeekCallback={onSeek}
                                externalTime={group.currentTime}
                                externalIsPlaying={group.isPlaying}

                                // Disable navigation within synced player for now or handle appropriately
                                hasNextEpisode={false}
                                hasPreviousEpisode={false}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
                                <span className="text-4xl mb-4">📺</span>
                                <p>O Líder ainda não selecionou um episódio.</p>
                                {isLeader && (
                                    <p className="text-xs text-orange-500 mt-2">Vá para a página do anime e clique em &quot;Criar Grupo de Caça&quot; novamente para selecionar.</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar (Chat/Members) */}
                <aside className={`fixed right-0 top-16 bottom-0 w-80 bg-gray-900/90 backdrop-blur border-l border-gray-800 transform transition-transform duration-300 z-40 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-3 text-sm font-bold border-b-2 ${activeTab === 'chat' ? 'border-orange-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Taberna
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex-1 py-3 text-sm font-bold border-b-2 ${activeTab === 'members' ? 'border-orange-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Membros ({group.members.length})
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeTab === 'chat' ? (
                                <>
                                    {messages.length === 0 && (
                                        <div className="text-center text-gray-500 text-xs py-4">
                                            A Taberna está silenciosa...<br />
                                            Comece a conversa!
                                        </div>
                                    )}

                                    {messages.map(msg => (
                                        <div key={msg.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 relative overflow-hidden">
                                                {msg.user.avatar ? (
                                                    <Image src={msg.user.avatar} alt={msg.user.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400">{msg.user.name}</div>
                                                <div className="text-sm text-gray-200 bg-gray-800 p-2 rounded-r-xl rounded-bl-xl border border-gray-700">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </>
                            ) : (
                                <div className="space-y-3">
                                    {group.members.map(member => (
                                        <div key={member.user.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 relative overflow-hidden flex-shrink-0">
                                                {member.user.avatar ? (
                                                    <Image src={member.user.avatar} alt={member.user.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                                    {member.user.name}
                                                    {member.role === 'LEADER' && <span className="text-[10px] bg-orange-500 text-black px-1 rounded font-black">LÍDER</span>}
                                                </div>
                                                <div className="text-xs text-green-500">Caçando agora</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/20 border-t border-gray-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Mensagem..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg disabled:opacity-50">
                                    ➤
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>

                {/* Chat Toggle Button */}
                {!showChat && (
                    <button
                        onClick={() => setShowChat(true)}
                        className="fixed right-6 bottom-6 bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:bg-orange-500 z-30"
                    >
                        💬
                    </button>
                )}

                {showChat && (
                    <button
                        onClick={() => setShowChat(false)}
                        className="absolute right-[330px] top-4 bg-gray-800 text-white p-2 rounded-lg shadow hover:bg-gray-700 z-30 lg:hidden"
                    >
                        ✕
                    </button>
                )}

            </main>
        </div>
    )
}
