import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string; 'language.vtt': string }> }
) {
  const resolvedParams = await params
  const episodeId = resolvedParams.episodeId
  const languageFile = resolvedParams['language.vtt'] // "pt-br.vtt" ou "en.vtt"
  const language = languageFile?.replace('.vtt', '') || 'unknown' // "pt-br" ou "en"

  console.log(`🔍 Solicitação de legenda: episodeId=${episodeId}, language=${language}`)

  // Por enquanto, retornar uma legenda vazia válida em formato VTT
  const emptySubtitle = `WEBVTT

NOTE
Legendas não disponíveis para este episódio.

00:00:01.000 --> 00:00:05.000
[Legendas não disponíveis]

00:00:05.000 --> 00:00:10.000
[Este é um player de teste V2]`

  return new Response(emptySubtitle, {
    status: 200,
    headers: {
      'Content-Type': 'text/vtt',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
    }
  })
}