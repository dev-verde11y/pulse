'use client'

import { useState, useEffect, useCallback } from 'react'

interface PaymentRecord {
    id: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    externalId: string | null
    paidAt: string | null
    createdAt: string
    user: {
        name: string
        email: string
        avatar: string | null
    }
    plan: {
        name: string
        type: string
    }
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pages: 1,
        total: 0
    })

    const fetchPayments = useCallback(async (page = 1) => {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                status: status,
                search: search
            })
            const response = await fetch(`/api/admin/payments?${query}`)
            const data = await response.json()
            if (data.payments) {
                setPayments(data.payments)
                setPagination({
                    currentPage: data.pagination.currentPage,
                    pages: data.pagination.pages,
                    total: data.pagination.total
                })
            }
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }, [status, search])

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchPayments(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [fetchPayments])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20'
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'CONCLUÍDO'
            case 'pending': return 'PENDENTE'
            case 'failed': return 'FALHOU'
            default: return status.toUpperCase()
        }
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">COFRE DO REINO</h2>
                            <p className="text-gray-500 font-mono text-xs tracking-widest text-yellow-500/70">MANIFESTO DE TRIBUTOS E LOOT</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar Aventureiro ou ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900/40 border border-white/5 focus:border-purple-500/50 rounded-xl px-4 py-2.5 pl-10 text-sm text-gray-200 outline-none w-full md:w-64 transition-all backdrop-blur-md"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-gray-900/40 border border-white/5 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-gray-200 outline-none transition-all backdrop-blur-md cursor-pointer"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="completed">Concluídos</option>
                        <option value="pending">Pendentes</option>
                        <option value="failed">Falhas</option>
                    </select>
                </div>
            </div>

            {/* Main Registry (Table) */}
            <div className="relative group overflow-hidden bg-gray-950/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>

                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-gray-900/20">
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest">Aventureiro</th>
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest">Plano / Pacto</th>
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest text-right">Montante</th>
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest">Data / Selo</th>
                                <th className="px-6 py-5 text-xs font-bold text-purple-400/70 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 relative z-10">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-10 bg-gray-800 rounded-xl w-40"></div></td>
                                        <td className="px-6 py-6"><div className="h-5 bg-gray-800 rounded-lg w-32"></div></td>
                                        <td className="px-6 py-6 text-right"><div className="h-5 bg-gray-800 rounded-lg w-20 ml-auto"></div></td>
                                        <td className="px-6 py-6 text-center"><div className="h-6 bg-gray-800 rounded-full w-24 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-5 bg-gray-800 rounded-lg w-32"></div></td>
                                        <td className="px-6 py-6 text-right"><div className="h-8 bg-gray-800 rounded-lg w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700 animate-bounce">📜</div>
                                        </div>
                                        <p className="text-gray-500 font-mono tracking-wider">Nenhum tributo encontrado nas crônicas.</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="group/row hover:bg-white/[0.02] transition-colors relative">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center p-0.5 border border-white/10 overflow-hidden group-hover/row:scale-110 transition-transform">
                                                    {payment.user.avatar ? (
                                                        <img src={payment.user.avatar} alt="" className="w-full h-full rounded-[9px] object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-purple-300">{payment.user.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-200 group-hover/row:text-white transition-colors">{payment.user.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono">{payment.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-xs">
                                            <span className="px-2 py-1 bg-gray-800/40 rounded border border-white/5 text-gray-400 group-hover/row:border-purple-500/30 group-hover/row:text-purple-300">
                                                {payment.plan.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white">R$ {payment.amount.toFixed(2)}</span>
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">{payment.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(payment.status)} transition-all group-hover/row:shadow-[0_0_10px_rgba(0,0,0,0.3)]`}>
                                                {getStatusLabel(payment.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-300">{new Date(payment.paidAt || payment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]" title={payment.externalId || 'N/A'}>
                                                    #{payment.externalId || 'S/ ID'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="p-2 bg-gray-800/40 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/30 transition-all border border-transparent hover:border-purple-500/50">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-5 border-t border-white/5 bg-gray-900/10 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-mono">
                        TOTAL: <span className="text-purple-400 font-bold">{pagination.total}</span> REGISTROS
                    </p>

                    <div className="flex gap-2">
                        <button
                            disabled={pagination.currentPage === 1 || loading}
                            onClick={() => fetchPayments(pagination.currentPage - 1)}
                            className="px-4 py-2 bg-gray-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 text-xs font-bold text-gray-300 rounded-lg border border-white/5 transition-all outline-none"
                        >
                            ANTERIOR
                        </button>
                        <div className="flex items-center px-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <span className="text-xs font-bold text-purple-400">{pagination.currentPage} / {pagination.pages}</span>
                        </div>
                        <button
                            disabled={pagination.currentPage === pagination.pages || loading}
                            onClick={() => fetchPayments(pagination.currentPage + 1)}
                            className="px-4 py-2 bg-gray-800/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 text-xs font-bold text-gray-300 rounded-lg border border-white/5 transition-all outline-none"
                        >
                            PRÓXIMO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
