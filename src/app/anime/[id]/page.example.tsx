// Exemplo de como implementar metadata dinâmica e structured data
// Este arquivo demonstra o padrão para refatorar páginas client-side

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
// import AnimeDetailClient from '/AnimeDetailClient'
import AnimeDetailClient from '@/components/anime/AnimeDetailClient'

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const anime = await prisma.anime.findUnique({
        where: { id: params.id },
        select: {
            title: true,
            description: true,
            posterUrl: true,
            thumbnail: true,
            year: true,
            genres: true,
            rating: true,
        }
    })

    if (!anime) {
        return {
            title: 'Anime não encontrado - Pulse',
        }
    }

    const imageUrl = anime.posterUrl || anime.thumbnail || '/images/anime-placeholder.svg'

    return {
        title: `${anime.title} - Assistir Online | Pulse Anime`,
        description: anime.description || `Assista ${anime.title} online em HD. ${anime.genres.join(', ')}. Ano: ${anime.year}. Classificação: ${anime.rating}.`,
        keywords: [anime.title, ...anime.genres, 'anime', 'streaming', 'assistir online', `${anime.year}`],

        openGraph: {
            title: anime.title,
            description: anime.description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: anime.title,
                }
            ],
            type: 'video.tv_show',
            siteName: 'Pulse Anime',
        },

        twitter: {
            card: 'summary_large_image',
            title: anime.title,
            description: anime.description,
            images: [imageUrl],
        },

        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/anime/${params.id}`,
        },
    }
}

// Server Component - busca dados no servidor
export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
    const anime = await prisma.anime.findUnique({
        where: { id: params.id },
        include: {
            seasons: {
                include: {
                    episodes: {
                        orderBy: { episodeNumber: 'asc' }
                    }
                },
                orderBy: { seasonNumber: 'asc' }
            }
        }
    })

    if (!anime) {
        notFound()
    }

    // Structured Data (JSON-LD) para SEO
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        name: anime.title,
        description: anime.description,
        image: anime.posterUrl || anime.thumbnail,
        genre: anime.genres,
        datePublished: anime.year.toString(),
        numberOfSeasons: anime.seasons.length,
        numberOfEpisodes: anime.seasons.reduce((total, season) => total + season.episodes.length, 0),
        contentRating: anime.rating,
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            ratingCount: '1000',
            bestRating: '5',
            worstRating: '1'
        }
    }

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Client Component com dados pré-carregados */}
            <AnimeDetailClient anime={anime} />
        </>
    )
}

// Gerar rotas estáticas em build time (opcional, para melhor performance)
export async function generateStaticParams() {
    const animes = await prisma.anime.findMany({
        select: { id: true },
        take: 100, // Limitar para não gerar muitas páginas estáticas
    })

    return animes.map((anime) => ({
        id: anime.id,
    }))
}
