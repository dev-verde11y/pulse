'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface WatchRecord {
    id: string
    progress: number
    watchedAt: string
    completed: boolean
    user: {
        name: string
        email: string
        avatar: string | null
    }
    anime: {
        title: string
        thumbnail: string | null
        slug: string
    }
}

export default function AdminWatchHistoryPage() {
    const [history, setHistory] = useState<WatchRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0
    })

    const fetchHistory = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                search: search
            })
            const response = await fetch(`/api/admin/analytics/watch-history?${query}`)
            const data = await response.json()
            if (data.history) {
                setHistory(data.history)
                setPagination({
                    currentPage: data.pagination.currentPage,
                    pages: data.pagination.pages,
                    total: data.pagination.total
                })
            }
        } catch (error) {
            console.error('Error fetching watch history:', error)
        } finally {
            setLoading(false)
        }
    }, [search])

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchHistory(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [fetchHistory])

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">CRÔNICAS DE VISITA</h2>
                            <p className="text-gray-500 font-mono text-xs tracking-widest text-purple-400/60">REGISTRO DE JORNADAS NO MUNDO DE PULSE</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar Aventureiro ou Saga..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900/40 border border-white/5 focus:border-purple-500/50 rounded-xl px-4 py-2.5 pl-10 text-sm text-gray-200 outline-none w-full md:w-80 transition-all backdrop-blur-md"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* History Grid */}
            <div className="relative overflow-hidden bg-gray-950/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-gray-900/20">
                                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Aventureiro</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Saga d&apos;Escrito</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Progresso</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">Selo Temporal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-10 bg-gray-800 rounded-xl w-40"></div></td>
                                        <td className="px-6 py-6"><div className="h-10 bg-gray-800 rounded-xl w-48"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded-lg w-32"></div></td>
                                        <td className="px-6 py-6 text-center"><div className="h-6 bg-gray-800 rounded-full w-20 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded-lg w-24"></div></td>
                                    </tr>
                                ))
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center space-y-4">
                                        <p className="text-gray-500 font-mono tracking-wider italic">O pergaminho está em branco...</p>
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr key={record.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex items-center justify-center overflow-hidden">
                                                    {record.user.avatar ? (
                                                        <img src={record.user.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-purple-400">{record.user.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{record.user.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono">{record.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 rounded-lg bg-gray-800 border border-white/5 overflow-hidden flex-shrink-0">
                                                    {record.anime.thumbnail && <img src={record.anime.thumbnail} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-300 group-hover:text-purple-300 transition-colors">{record.anime.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1.5 min-w-[120px]">
                                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-500">
                                                    <span>Progresso</span>
                                                    <span className="text-purple-400">{Math.round(record.progress)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                                        style={{ width: `${record.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {record.completed ? (
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20">CONCLUÍDO</span>
                                            ) : (
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">ASSISTINDO</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs text-gray-400 font-mono">
                                                {new Date(record.watchedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 border-t border-white/5 bg-gray-900/10 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        Crônicas encontradas: <span className="text-purple-400 font-bold">{pagination.total}</span>
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={pagination.currentPage === 1 || loading}
                            onClick={() => fetchHistory(pagination.currentPage - 1)}
                            className="px-4 py-2 bg-gray-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 text-xs font-bold text-gray-300 rounded-lg border border-white/5 transition-all outline-none"
                        >
                            VOLTAR
                        </button>
                        <div className="flex items-center px-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <span className="text-xs font-bold text-purple-400">{pagination.currentPage} / {pagination.pages}</span>
                        </div>
                        <button
                            disabled={pagination.currentPage === pagination.pages || loading}
                            onClick={() => fetchHistory(pagination.currentPage + 1)}
                            className="px-4 py-2 bg-gray-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 text-xs font-bold text-gray-300 rounded-lg border border-white/5 transition-all outline-none"
                        >
                            AVANÇAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
