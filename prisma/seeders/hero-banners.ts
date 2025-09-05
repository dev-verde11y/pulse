import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const heroBannersData = [
  {
    title: 'Kaiju Nº8',
    subtitle: 'Kafka wants to clean up kaiju, but not literally! Will a sudden metamorphosis stand in the way of his dream?',
    description: 'Em um mundo onde a humanidade vive dentro de cidades cercadas por enormes muralhas devido ao aparecimento de gigantes humanoides comedores de gente, Eren Jaeger, sua irmã adotiva Mikasa Ackerman e seu amigo de infância Armin Arlert se juntam ao brutal Survey Corps, uma força militar que combate os titãs fora das muralhas.',
    type: 'anime',
    year: 2013,
    rating: '16+',
    duration: '24 min',
    episode: 'T4 E28',
    backgroundImage: 'https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kaiju-no-8/images/fd1154c7-173c-48ed-b3b3-bea30f63f4e0.jpg',
    genres: ['Ação', 'Drama', 'Fantasia', 'Militar'],
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Demon Slayer',
    subtitle: 'Kimetsu no Yaiba',
    description: 'Desde os tempos antigos, rumores de demônios comedores de carne rondam por aí. Tanjiro Kamado vive nas montanhas com sua família. Um dia, quando retorna de vender carvão na cidade, encontra sua família massacrada por um demônio. A única sobrevivente é sua irmã Nezuko, que se transformou em um demônio.',
    type: 'anime',
    year: 2019,
    rating: '14+',
    duration: '23 min',
    episode: 'T3 E11',
    backgroundImage: 'https://cdn.selectgame.net/wp-content/uploads/2025/06/Kimetsu-capa-Akaza-28-06.webp',
    genres: ['Ação', 'Sobrenatural', 'Histórico', 'Shounen'],
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Demon Slayer',
    subtitle: 'Kimetsu no Yaiba',
    description: 'Desde os tempos antigos, rumores de demônios comedores de carne rondam por aí. Tanjiro Kamado vive nas montanhas com sua família. Um dia, quando retorna de vender carvão na cidade, encontra sua família massacrada por um demônio. A única sobrevivente é sua irmã Nezuko, que se transformou em um demônio.',
    type: 'anime',
    year: 2019,
    rating: '14+',
    duration: '23 min',
    episode: 'T3 E11',
    backgroundImage: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1920&h=1080&fit=crop',
    genres: ['Ação', 'Sobrenatural', 'Histórico', 'Shounen'],
    displayOrder: 3,
    isActive: true
  },
  {
    title: 'Tougen Anki',
    subtitle: 'Kimi no Na wa',
    description: 'Mitsuha é uma colegial que vive numa pequena cidade rural no Japão. Entediada com a vida no campo, ela sonha em ser um garoto bonito de Tokyo na próxima vida. Enquanto isso, Taki é um colegial que vive em Tokyo, trabalha meio período num restaurante italiano e aspira ser um arquiteto.',
    type: 'filme',
    year: 2016,
    rating: '10+',
    duration: '1h 46min',
    backgroundImage: 'https://imgsrv.crunchyroll.com/cdn-cgi/image/fit=cover,format=auto,quality=85,width=1920/keyart/GP5HJ84D2-backdrop_wide',
    genres: ['Romance', 'Drama', 'Sobrenatural', 'Slice of Life'],
    displayOrder: 4,
    isActive: true
  }
]

export async function seedHeroBanners() {
  console.log('🌱 Seeding hero banners...')

  try {
    // Deletar banners existentes
    await prisma.heroBanner.deleteMany()

    // Criar novos banners
    for (const bannerData of heroBannersData) {
      await prisma.heroBanner.create({
        data: bannerData
      })
    }

    console.log(`✅ Created ${heroBannersData.length} hero banners`)
  } catch (error) {
    console.error('❌ Error seeding hero banners:', error)
    throw error
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedHeroBanners()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}