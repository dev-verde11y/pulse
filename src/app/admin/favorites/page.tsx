'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface FavoriteStat {
    id: string
    title: string
    thumbnail: string | null
    banner: string | null
    slug: string
    type: string
    year: number
    count: number
}

export default function AdminFavoritesPage() {
    const [ranking, setRanking] = useState<FavoriteStat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/admin/analytics/favorites')
                const data = await response.json()
                if (data.ranking) {
                    setRanking(data.ranking)
                }
            } catch (error) {
                console.error('Error fetching favorites ranking:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRanking()
    }, [])

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-2xl shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">FAVORITOS DA PLEBE</h2>
                        <p className="text-gray-500 font-mono text-xs tracking-widest text-pink-400/60">AS SAGAS MAIS ADORADAS PELOS AVENTUREIROS</p>
                    </div>
                </div>
            </div>

            {/* Ranking Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[400px] bg-gray-900/50 rounded-3xl animate-pulse animate-delay-[100ms]"></div>
                    ))
                ) : ranking.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 bg-gray-950/40 rounded-3xl border border-white/5 backdrop-blur-md">
                        <p className="text-gray-500 font-mono italic">Nenhuma adoração registrada ainda...</p>
                    </div>
                ) : (
                    ranking.map((anime, index) => (
                        <div
                            key={anime.id}
                            className="group relative h-[400px] rounded-3xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all duration-500 shadow-2xl bg-gray-950"
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl bg-gray-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-pink-500 shadow-lg group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                                #{index + 1}
                            </div>

                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    unoptimized
                                    src={anime.thumbnail || anime.banner || '/placeholder-anime.jpg'}
                                    alt={anime.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-6 space-y-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                                        {anime.type}
                                    </span>
                                    <h3 className="text-xl font-black text-white leading-tight line-clamp-2 min-h-[56px] drop-shadow-lg">
                                        {anime.title}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Adoração</span>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-pink-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                            <span className="text-lg font-black text-white">{anime.count}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lançada em</span>
                                        <p className="text-xs font-bold text-gray-300">{anime.year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <div className="p-6 bg-gray-900/20 border border-white/5 rounded-2xl backdrop-blur-md">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-pink-400/10 rounded-lg text-pink-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-200">Sabedoria do Oráculo</h4>
                        <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                            Este ranking reflete os sentimentos mais puros dos aventureiros. Utilize esses dados para expandir os grimórios mais populares e garantir que o reino continue próspero.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
