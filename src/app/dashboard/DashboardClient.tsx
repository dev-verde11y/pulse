'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/streaming/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { CardCarousel } from '@/components/streaming/CardCarousel'
import { PosterCarousel } from '@/components/streaming/PosterCarousel'
import { SmallCardCarousel } from '@/components/streaming/SmallCardCarousel'
import { BannerCarousel } from '@/components/streaming/BannerCarousel'
import CategoryCard from '@/components/streaming/CategoryCard'
import { RevealSection } from '@/components/ui/RevealSection'
import { api } from '@/lib/api'
import { categories } from '@/data/mockData'
import { Anime, WatchHistoryItem } from '@/types/anime'
import '@/styles/swiper.css'
import { AnimeCardSkeleton, MediumAnimeCardSkeleton } from '@/components/ui/AnimeCardSkeleton'

interface DashboardClientProps {
    trending: Anime[]
    newReleases: Anime[]
    topRated: Anime[]
    action: Anime[]
    comedy: Anime[]
}

export function DashboardClient({
    trending,
    newReleases,
    topRated,
    action,
    comedy
}: DashboardClientProps) {
    const { user, loading, refreshUser } = useAuth()
    const searchParams = useSearchParams()
    const [favorites, setFavorites] = useState<Anime[]>([])
    const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
    const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Anime[]>([])
    const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
    const [userContentLoading, setUserContentLoading] = useState(true)

    // Detecta se veio do checkout - mostra banner e atualiza usuário
    useEffect(() => {
        const checkoutSuccess = searchParams.get('checkout') === 'success' || searchParams.get('renewal') === 'success'
        if (!checkoutSuccess || !refreshUser) return

        setShowCheckoutSuccess(true)

        // Remove query param da URL imediatamente
        window.history.replaceState({}, '', '/dashboard')

        // Atualiza dados do usuário após 2 segundos (tempo para webhook processar)
        const refreshTimer = setTimeout(async () => {
            await refreshUser()
            console.log('✅ User data refreshed')
        }, 2000)

        // Remove banner após 5 segundos
        const bannerTimer = setTimeout(() => {
            setShowCheckoutSuccess(false)
            console.log('✅ Banner dismissed')
        }, 5000)

        return () => {
            clearTimeout(refreshTimer)
            clearTimeout(bannerTimer)
        }
    }, [searchParams, refreshUser])

    useEffect(() => {
        async function loadUserData() {
            if (!user) {
                setUserContentLoading(false)
                return
            }

            try {
                const [favoritesData, historyData] = await Promise.all([
                    api.getFavorites().catch(() => []),
                    api.getWatchHistory(1, 20).then(res => res.history).catch(() => [])
                ])

                const favs = (favoritesData as Anime[]) || []
                setFavorites(favs)
                setWatchHistory(historyData || [])

                // Lógica de Recomendações Personalizadas
                if (favs.length > 0) {
                    // 1. Extrair todos os gêneros dos favoritos
                    const allGenres = favs.flatMap((anime: Anime) => anime.genres || [])
                    // 2. Contar frequência de cada gênero
                    const genreCounts = allGenres.reduce((acc: Record<string, number>, genre: string) => {
                        acc[genre] = (acc[genre] || 0) + 1
                        return acc
                    }, {})
                    // 3. Pegar o gênero mais frequente
                    const topGenre = Object.entries(genreCounts)
                        .sort((a, b) => b[1] - a[1])[0]?.[0]

                    if (topGenre) {
                        const recs = await api.getAnimes({ genre: topGenre, limit: 10 })
                        // Filtrar animes que já estão nos favoritos
                        const filteredRecs = recs.animes.filter((a: Anime) => !favs.some((f: Anime) => f.id === a.id))
                        setPersonalizedRecommendations(filteredRecs.length > 0 ? filteredRecs : (trending.slice(0, 10) as Anime[]))
                    }
                } else {
                    setPersonalizedRecommendations(topRated.slice(0, 10) as Anime[])
                }
            } catch (error) {
                console.error('Error loading user data:', error)
            } finally {
                setUserContentLoading(false)
            }
        }

        if (!loading) {
            loadUserData()
        }
    }, [user, loading, trending, topRated])

    // Continue Watching logic
    const continueWatchingAnimes = watchHistory
        .map(item => item.anime)
        .filter((anime, index, self) =>
            index === self.findIndex(a => a.id === anime.id)
        )
        .slice(0, 10)

    const myList = favorites.slice(0, 10)
    const recommendations = personalizedRecommendations.length > 0 ? personalizedRecommendations : trending.slice(0, 10)

    if (loading) {
        return <LoadingScreen message="Verificando autenticação..." />
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            {/* Checkout Success Banner */}
            {showCheckoutSuccess && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/30">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div>
                                <p className="font-bold">Pagamento confirmado!</p>
                                <p className="text-sm text-green-100">Ativando sua assinatura...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Banner */}
            <HeroBanner />

            {/* Content Sections */}
            <main className="bg-black text-white">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-12 sm:space-y-16">


                    {/* Em Alta */}
                    <RevealSection delay="delay-100">
                        <PosterCarousel
                            title="Em Alta"
                            animes={trending.slice(0, 10)}
                            isTop10
                        />
                    </RevealSection>

                    {/* Continue Assistindo (Only if logged in and has history) */}
                    {userContentLoading && user ? (
                        <RevealSection delay="delay-200">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white px-4 md:px-0">Continue Assistindo</h2>
                                <div className="flex gap-4 overflow-hidden px-4 md:px-0">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-[160px] flex-shrink-0">
                                            <MediumAnimeCardSkeleton />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </RevealSection>
                    ) : (
                        user && continueWatchingAnimes.length > 0 && (
                            <RevealSection delay="delay-200">
                                <SmallCardCarousel
                                    title="Continue Assistindo"
                                    animes={continueWatchingAnimes}
                                />
                            </RevealSection>
                        )
                    )}



                    {/* Minha Lista (Only if logged in and has favorites) */}
                    {userContentLoading && user ? (
                        <RevealSection delay="delay-300">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white px-4 md:px-0">Minha Lista</h2>
                                <div className="flex gap-4 overflow-hidden px-4 md:px-0">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-[160px] flex-shrink-0">
                                            <MediumAnimeCardSkeleton />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </RevealSection>
                    ) : (
                        user && myList.length > 0 && (
                            <RevealSection delay="delay-300">
                                <SmallCardCarousel
                                    title="Minha Lista"
                                    animes={myList}
                                />
                            </RevealSection>
                        )
                    )}

                    {/* Recomendados para Você */}
                    <RevealSection>
                        <PosterCarousel
                            title="Recomendados para Você"
                            animes={recommendations}
                        />
                    </RevealSection>

                    {/* Lançamentos */}
                    <RevealSection>
                        <BannerCarousel
                            title="Novos Lançamentos"
                            animes={newReleases}
                        />
                    </RevealSection>

                    {/* Mais Avaliados */}
                    <RevealSection>
                        <PosterCarousel
                            title="Mais Avaliados"
                            animes={topRated}
                        />
                    </RevealSection>

                    {/* Ação */}
                    <RevealSection>
                        <CardCarousel
                            title="Ação & Aventura"
                            animes={action}
                        />
                    </RevealSection>

                    {/* Comédia */}
                    <RevealSection>
                        <CardCarousel
                            title="Comédia"
                            animes={comedy}
                        />
                    </RevealSection>

                    {/* Categorias Populares */}
                    <RevealSection>
                        <section className="mb-20 py-16 text-center">
                            <div className="mb-12">
                                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                    Explorar por Categoria
                                </h2>
                                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                    Descubra animes organizados por gênero<br />
                                    <span className="text-white font-medium">Encontre exatamente o que você procura</span>
                                </p>
                            </div>
                            <div className="w-full px-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 max-w-[1400px] mx-auto">
                                    {categories.map((category) => (
                                        <CategoryCard
                                            key={category.name}
                                            name={category.name}
                                            count={category.count}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </RevealSection>

                </div>
            </main>

            <Footer />
        </div>
    )
}
