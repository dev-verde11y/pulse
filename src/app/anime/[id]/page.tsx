import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AnimeDetailClient from '@/components/anime/AnimeDetailClient'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const anime = await prisma.anime.findUnique({
    where: { id },
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

  const imageUrl = anime.posterUrl || anime.thumbnail || '/images/logo.png'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.com'

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
      canonical: `${appUrl}/anime/${id}`,
    },
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params

  const anime = await prisma.anime.findUnique({
    where: { id },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AnimeDetailClient anime={anime} />
    </>
  )
}