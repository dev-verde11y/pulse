import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Busca todos os gêneros únicos dos animes
    const animes = await prisma.anime.findMany({
      select: {
        genres: true
      }
    })

    // Extrai e conta os gêneros únicos
    const genresMap = new Map<string, number>()
    
    animes.forEach(anime => {
      anime.genres.forEach(genre => {
        // Usar o gênero original como chave, mas manter case-insensitive para agrupamento
        const genreKey = genre
        genresMap.set(genreKey, (genresMap.get(genreKey) || 0) + 1)
      })
    })

    // Ordena por quantidade (mais populares primeiro)
    const genres = Array.from(genresMap.entries())
      .map(([genre, count]) => ({
        name: genre, // Nome original com acentos e capitalização
        count,
        displayName: genre // Usar o nome original
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      genres,
      total: genres.length
    })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}