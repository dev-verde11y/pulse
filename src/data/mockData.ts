export interface Anime {
  id: number
  title: string
  description: string
  thumbnail: string
  banner?: string
  genre: string[]
  rating: string
  year: number
  episodes: number
  duration: number
  status: 'watching' | 'completed' | 'plan-to-watch'
  progress?: number
  currentEpisode?: number
  isSubbed: boolean
  isDubbed: boolean
}

export interface Episode {
  id: number
  animeId: number
  episodeNumber: number
  title: string
  description: string
  thumbnail: string
  duration: number
  watchProgress?: number
}

export const mockAnimes: Anime[] = [
  {
    id: 1,
    title: "Attack on Titan",
    description: "A humanidade luta pela sobrevivência contra gigantes devoradores de humanos em um mundo pós-apocalíptico.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    genre: ["Ação", "Drama", "Fantasia"],
    rating: "16+",
    year: 2023,
    episodes: 87,
    duration: 24,
    status: 'watching',
    progress: 75,
    currentEpisode: 12,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 2,
    title: "Demon Slayer",
    description: "Tanjiro se torna um caçador de demônios para salvar sua irmã transformada em demônio.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    genre: ["Ação", "Supernatural", "Drama"],
    rating: "14+",
    year: 2023,
    episodes: 44,
    duration: 24,
    status: 'watching',
    progress: 45,
    currentEpisode: 8,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 3,
    title: "Jujutsu Kaisen",
    description: "Estudantes de uma escola especial lutam contra maldições sobrenaturais usando técnicas místicas.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    genre: ["Ação", "Supernatural", "Escolar"],
    rating: "16+",
    year: 2023,
    episodes: 24,
    duration: 24,
    status: 'watching',
    progress: 80,
    currentEpisode: 19,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 4,
    title: "One Piece",
    description: "Monkey D. Luffy e sua tripulação piratas buscam pelo tesouro supremo conhecido como One Piece.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    genre: ["Aventura", "Comédia", "Ação"],
    rating: "12+",
    year: 2023,
    episodes: 1000,
    duration: 24,
    status: 'watching',
    progress: 35,
    currentEpisode: 350,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 5,
    title: "My Hero Academia",
    description: "Em um mundo onde quase todos têm superpoderes, um garoto sem poderes sonha em ser um herói.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
    genre: ["Ação", "Aventura", "Escolar"],
    rating: "12+",
    year: 2023,
    episodes: 158,
    duration: 24,
    status: 'watching',
    progress: 65,
    currentEpisode: 45,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 6,
    title: "Spy x Family",
    description: "Um espião deve formar uma família falsa para uma missão, sem saber que sua esposa é assassina e sua filha telepata.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    genre: ["Comédia", "Ação", "Família"],
    rating: "12+",
    year: 2022,
    episodes: 25,
    duration: 24,
    status: 'completed',
    progress: 100,
    currentEpisode: 25,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 7,
    title: "Chainsaw Man",
    description: "Denji vive em pobreza até fazer um contrato com Pochita, um demônio-motosserra, mudando sua vida para sempre.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    genre: ["Ação", "Supernatural", "Gore"],
    rating: "18+",
    year: 2022,
    episodes: 12,
    duration: 24,
    status: 'completed',
    progress: 100,
    currentEpisode: 12,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 8,
    title: "Mob Psycho 100",
    description: "Um garoto com poderes psíquicos tenta viver uma vida normal enquanto trabalha para um exorcista falso.",
    thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/aaa253b7a9f9fb95264c68c31cd04b9030a5d7b0212e1b01d437dc5631c62799._SX1080_FMjpg_.jpg",
    banner: "https://m.media-amazon.com/images/S/pv-target-images/aaa253b7a9f9fb95264c68c31cd04b9030a5d7b0212e1b01d437dc5631c62799._SX1080_FMjpg_.jpg",
    genre: ["Supernatural", "Comédia", "Ação"],
    rating: "12+",
    year: 2022,
    episodes: 37,
    duration: 24,
    status: 'completed',
    progress: 100,
    currentEpisode: 37,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 9,
    title: "Tokyo Ghoul",
    description: "Kaneki se torna meio-ghoul após um encontro fatal e deve aprender a viver em ambos os mundos.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/64449l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/5/64449l.jpg",
    genre: ["Ação", "Horror", "Supernatural"],
    rating: "16+",
    year: 2021,
    episodes: 48,
    duration: 24,
    status: 'plan-to-watch',
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 10,
    title: "Death Note",
    description: "Light Yagami encontra um caderno que pode matar qualquer pessoa cujo nome seja escrito nele.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    genre: ["Thriller", "Supernatural", "Psychological"],
    rating: "16+",
    year: 2021,
    episodes: 37,
    duration: 23,
    status: 'completed',
    progress: 100,
    currentEpisode: 37,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 11,
    title: "Naruto",
    description: "Um jovem ninja busca reconhecimento e sonha em se tornar o Hokage de sua vila.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    genre: ["Ação", "Aventura", "Artes Marciais"],
    rating: "12+",
    year: 2022,
    episodes: 720,
    duration: 23,
    status: 'completed',
    progress: 100,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 12,
    title: "One Punch Man",
    description: "Saitama é um herói que pode derrotar qualquer inimigo com apenas um soco, mas está entediado com sua força.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg",
    genre: ["Ação", "Comédia", "Supernatural"],
    rating: "14+",
    year: 2023,
    episodes: 24,
    duration: 24,
    status: 'watching',
    progress: 50,
    currentEpisode: 12,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 13,
    title: "Hunter x Hunter",
    description: "Gon parte em uma jornada para se tornar um Hunter e encontrar seu pai.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/11/33657l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/11/33657l.jpg",
    genre: ["Ação", "Aventura", "Fantasia"],
    rating: "12+",
    year: 2022,
    episodes: 148,
    duration: 23,
    status: 'plan-to-watch',
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 14,
    title: "Fullmetal Alchemist",
    description: "Dois irmãos alquimistas buscam a Pedra Filosofal para restaurar seus corpos após uma alquimia fracassada.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    genre: ["Ação", "Drama", "Fantasia"],
    rating: "14+",
    year: 2021,
    episodes: 64,
    duration: 24,
    status: 'completed',
    progress: 100,
    currentEpisode: 64,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 15,
    title: "Dragon Ball Z",
    description: "Goku e seus amigos defendem a Terra de ameaças cada vez mais poderosas.",
    thumbnail: "https://ogimg.infoglobo.com.br/in/23339253-be7-5b1/FT1086A/gogeta.jpg",
    banner: "https://ogimg.infoglobo.com.br/in/23339253-be7-5b1/FT1086A/gogeta.jpg",
    genre: ["Ação", "Aventura", "Artes Marciais"],
    rating: "12+",
    year: 2022,
    episodes: 291,
    duration: 24,
    status: 'watching',
    progress: 25,
    currentEpisode: 73,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 16,
    title: "Your Name",
    description: "Dois adolescentes compartilham uma conexão misteriosa através de sonhos que mudam suas vidas.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
    genre: ["Romance", "Drama", "Sobrenatural"],
    rating: "10+",
    year: 2022,
    episodes: 1,
    duration: 106,
    status: 'completed',
    progress: 100,
    currentEpisode: 1,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 17,
    title: "Spirited Away",
    description: "Uma menina deve trabalhar em uma casa de banhos para espíritos para salvar seus pais.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/6/79597l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/6/79597l.jpg",
    genre: ["Aventura", "Família", "Fantasia"],
    rating: "Livre",
    year: 2021,
    episodes: 1,
    duration: 125,
    status: 'watching',
    progress: 20,
    currentEpisode: 1,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 18,
    title: "Princess Mononoke",
    description: "Um jovem príncipe se envolve na luta entre deuses da floresta e humanos que consomem seus recursos.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/7/75919l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/7/75919l.jpg",
    genre: ["Aventura", "Drama", "Fantasia"],
    rating: "12+",
    year: 2021,
    episodes: 1,
    duration: 134,
    status: 'plan-to-watch',
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 19,
    title: "KonoSuba",
    description: "Kazuma é transportado para um mundo de fantasia com uma deusa inútil, uma maga explosiva e uma cavaleira masoquista.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/8/77831l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/8/77831l.jpg",
    genre: ["Comédia", "Aventura", "Fantasia"],
    rating: "14+",
    year: 2022,
    episodes: 28,
    duration: 23,
    status: 'completed',
    progress: 100,
    isSubbed: true,
    isDubbed: true
  },
  {
    id: 20,
    title: "Gintama",
    description: "Em um Japão alternativo invadido por alienígenas, Gintoki trabalha como freelancer fazendo trabalhos diversos.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/10/73274l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/10/73274l.jpg",
    genre: ["Comédia", "Ação", "Samurai"],
    rating: "14+",
    year: 2023,
    episodes: 367,
    duration: 24,
    status: 'watching',
    progress: 30,
    currentEpisode: 110,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 21,
    title: "Grand Blue",
    description: "Iori entra na universidade esperando uma vida tranquila, mas acaba se envolvendo com um clube de mergulho alcoólico.",
    thumbnail: "https://i.ebayimg.com/images/g/e6AAAOSwPx1hvC0s/s-l1600.jpg",
    banner: "https://i.ebayimg.com/images/g/e6AAAOSwPx1hvC0s/s-l1600.jpg",
    genre: ["Comédia", "Slice of Life", "Escolar"],
    rating: "16+",
    year: 2022,
    episodes: 12,
    duration: 24,
    status: 'completed',
    progress: 100,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 22,
    title: "Nichijou",
    description: "O dia a dia absurdamente engraçado de estudantes colegiais e suas aventuras cotidianas surreais.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/3/75617l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/3/75617l.jpg",
    genre: ["Comédia", "Slice of Life", "Escolar"],
    rating: "Livre",
    year: 2021,
    episodes: 26,
    duration: 24,
    status: 'completed',
    progress: 100,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 23,
    title: "The Disastrous Life of Saiki K.",
    description: "Saiki, um estudante com poderes psíquicos, só quer ter uma vida normal, mas seus poderes sempre causam confusão.",
    thumbnail: "https://www.animenewsnetwork.com/hotlink/images/encyc/A18401-787409815.1467334615.jpg",
    banner: "https://www.animenewsnetwork.com/hotlink/images/encyc/A18401-787409815.1467334615.jpg",
    genre: ["Comédia", "Supernatural", "Escolar"],
    rating: "12+",
    year: 2023,
    episodes: 120,
    duration: 4,
    status: 'watching',
    progress: 60,
    currentEpisode: 72,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 24,
    title: "Prison School",
    description: "Cinco garotos são presos na escola por espiar o banheiro feminino e devem sobreviver à prisão escolar.",
    thumbnail: "https://m.media-amazon.com/images/I/81LBhh7co4L._UF1000,1000_QL80_.jpg",
    banner: "https://m.media-amazon.com/images/I/81LBhh7co4L._UF1000,1000_QL80_.jpg",
    genre: ["Comédia", "Ecchi", "Romance"],
    rating: "18+",
    year: 2022,
    episodes: 12,
    duration: 24,
    status: 'plan-to-watch',
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 25,
    title: "Hinamatsuri",
    description: "Um yakuza se torna pai de uma garota com poderes telecinéticos que aparece em sua casa.",
    thumbnail: "https://m.media-amazon.com/images/I/71Fk95ioCkL._UF1000,1000_QL80_.jpg",
    banner: "https://m.media-amazon.com/images/I/71Fk95ioCkL._UF1000,1000_QL80_.jpg",
    genre: ["Comédia", "Slice of Life", "Supernatural"],
    rating: "14+",
    year: 2023,
    episodes: 12,
    duration: 23,
    status: 'completed',
    progress: 100,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 26,
    title: "Kaguya-sama: Love is War",
    description: "Dois gênios do conselho estudantil tentam fazer o outro confessar seus sentimentos primeiro.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/1295/106551l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/1295/106551l.jpg",
    genre: ["Comédia", "Romance", "Escolar"],
    rating: "12+",
    year: 2023,
    episodes: 37,
    duration: 24,
    status: 'watching',
    progress: 80,
    currentEpisode: 30,
    isSubbed: true,
    isDubbed: false
  },
  {
    id: 27,
    title: "Overlord",
    description: "Um jogador fica preso em um MMORPG como seu avatar esqueleto e decide conquistar o novo mundo.",
    thumbnail: "https://cdn.myanimelist.net/images/anime/7/88019l.jpg",
    banner: "https://cdn.myanimelist.net/images/anime/7/88019l.jpg",
    genre: ["Ação", "Aventura", "Fantasia"],
    rating: "16+",
    year: 2023,
    episodes: 52,
    duration: 23,
    status: 'watching',
    progress: 70,
    currentEpisode: 36,
    isSubbed: true,
    isDubbed: false
  }
]

export const featuredAnime: Anime = {
  id: 1,
  title: "Attack on Titan",
  description: "A temporada final chegou! Acompanhe os momentos finais da épica batalha pela liberdade da humanidade. Eren e seus amigos enfrentam o destino final em uma guerra que decidirá o futuro do mundo.",
  thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
  banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=800&fit=crop",
  genre: ["Ação", "Drama", "Fantasia"],
  rating: "16+",
  year: 2023,
  episodes: 87,
  duration: 24,
  status: 'watching',
  progress: 75,
  currentEpisode: 12,
  isSubbed: true,
  isDubbed: true
}

export const continueWatching = mockAnimes.filter(anime => anime.status === 'watching').slice(0, 12)

export const myList = mockAnimes.slice(0, 12)

export const recommendations = mockAnimes.slice(2, 14)

export const trending = mockAnimes.slice(0, 12)

export const newReleases = mockAnimes.slice(6, 18)

export const topRated = mockAnimes.filter(anime => ['16+', '18+'].includes(anime.rating)).slice(0, 12)

export const action = mockAnimes.filter(anime => anime.genre.includes('Ação')).slice(0, 12)

export const comedy = mockAnimes.filter(anime => anime.genre.includes('Comédia')).slice(0, 12)

export const categories = [
  { name: "Ação", count: 45 },
  { name: "Romance", count: 32 },
  { name: "Comédia", count: 28 },
  { name: "Drama", count: 38 },
  { name: "Fantasia", count: 41 },
  { name: "Slice of Life", count: 24 },
  { name: "Thriller", count: 19 },
  { name: "Supernatural", count: 33 }
]