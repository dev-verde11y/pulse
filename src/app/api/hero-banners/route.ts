import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createHeroBannerSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().min(1, 'Subtítulo é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  backgroundImage: z.string().url('URL da imagem de fundo inválida'),
  logo: z.string().transform(val => val === '' ? null : val).pipe(z.string().url().nullable()).nullable(),
  type: z.string().default('anime'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  rating: z.string().default('16+'),
  duration: z.string().default('24 min'),
  episode: z.string().transform(val => val === '' ? null : val).nullable(),
  genres: z.array(z.string()).default([]),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  animeId: z.string().transform(val => val === '' ? null : val).nullable()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        subtitle?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      type?: string;
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [heroBanners, total] = await Promise.all([
      prisma.heroBanner.findMany({
        where,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.heroBanner.count({ where })
    ]);

    return NextResponse.json({
      heroBanners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar hero banners:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = createHeroBannerSchema.parse(body);

    const heroBanner = await prisma.heroBanner.create({
      data: validatedData,
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(heroBanner, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar hero banner:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}