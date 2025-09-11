import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateHeroBannerSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  subtitle: z.string().min(1, 'Subtítulo é obrigatório').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  backgroundImage: z.string().url('URL da imagem de fundo inválida').optional(),
  logo: z.string().url().optional().or(z.literal('').transform(() => null)).optional(),
  type: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 5).optional(),
  rating: z.string().optional(),
  duration: z.string().optional(),
  episode: z.string().optional().or(z.literal('').transform(() => null)).optional(),
  genres: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  animeId: z.string().optional().or(z.literal('').transform(() => null)).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const heroBanner = await prisma.heroBanner.findUnique({
      where: { id: params.id },
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

    if (!heroBanner) {
      return NextResponse.json(
        { error: 'Hero banner não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(heroBanner);

  } catch (error) {
    console.error('Erro ao buscar hero banner:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const validatedData = updateHeroBannerSchema.parse(body);

    const existingBanner = await prisma.heroBanner.findUnique({
      where: { id: params.id }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Hero banner não encontrado' },
        { status: 404 }
      );
    }

    const updateData = validatedData;

    const heroBanner = await prisma.heroBanner.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(heroBanner);

  } catch (error) {
    console.error('Erro ao atualizar hero banner:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingBanner = await prisma.heroBanner.findUnique({
      where: { id: params.id }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Hero banner não encontrado' },
        { status: 404 }
      );
    }

    await prisma.heroBanner.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Hero banner excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir hero banner:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}