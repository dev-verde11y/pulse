import { PrismaClient, AnimeStatus, AnimeType } from '@prisma/client'

const prisma = new PrismaClient()

// Função para gerar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .trim()
}

// Dados de animes reais com informações completas
const realAnimes = [
   // Kaiju No. 8
  {
    title: "kaiju no. 8",
    description: "Em um mundo ameaçado por criaturas chamadas Kaiju, Kafka Hibino sonha em se juntar às Forças de Defesa para lutar contra eles. No entanto, ele acaba trabalhando na limpeza dos restos dos Kaiju mortos. Sua vida muda drasticamente quando ele ganha a habilidade de se transformar em um Kaiju e é forçado a lutar contra os monstros que ele sempre quis derrotar.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kaiju-no-8/images/01901b10-8c79-42f2-951b-e7d86a9a3c2b.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kaiju-no-8/images/fd1154c7-173c-48ed-b3b3-bea30f63f4e0.jpg",
    year: 2024,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 12,
    genres: ["Ação", "Sci-Fi", "Shounen"],
  },
  // Attack on Titan
  {
    title: "Shingeki no Kyojin",
    description: "A humanidade vive dentro de cidades cercadas por enormes muralhas devido aos Titãs, gigantes humanoides que devoram seres humanos aparentemente sem razão. Eren Yeager, sua irmã adotiva Mikasa Ackerman e seu melhor amigo Armin Arlert testemunham o horror quando um Titã Colossal destrói sua cidade natal.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shingeki-no-kyojin/images/4f760fbc-3819-48e4-bce9-2d4d2990d954.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shingeki-no-kyojin/images/4f760fbc-3819-48e4-bce9-2d4d2990d954.jpg",
    year: 2013,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "16+",
    totalEpisodes: 87,
    genres: ["Ação", "Drama", "Fantasia", "Horror", "Sobrenatural"],
  },

  // One Piece
  {
    title: "One Piece",
    description: "Monkey D. Luffy é um jovem pirata que sonha em encontrar o lendário tesouro conhecido como 'One Piece' e se tornar o próximo Rei dos Piratas. Luffy ganha poderes de borracha após comer acidentalmente uma Fruta do Diabo, mas perde a capacidade de nadar.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-piece/images/dd6bd40c-c5c4-43a0-bedc-022aee9642f8.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-piece/images/dd6bd40c-c5c4-43a0-bedc-022aee9642f8.jpg",
    year: 1999,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 1000,
    genres: ["Ação", "Aventura", "Comédia", "Drama", "Fantasia"],
  },

  // Demon Slayer
  {
    title: "Kimetsu no Yaiba",
    description: "Tanjiro Kamado é um garoto gentil que vive com sua família numa montanha. Após sua família ser massacrada por demônios, exceto sua irmã Nezuko que se transformou num demônio, Tanjiro se torna um caçador de demônios para encontrar uma cura para sua irmã e vingar sua família.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/demon-slayer/images/0ec411c6-3d5e-4173-9505-77d7036b8833.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/demon-slayer/images/2368565d-0268-4077-999a-bbb221c34d72.jpg",
    year: 2019,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 44,
    genres: ["Ação", "Sobrenatural", "Histórico", "Drama"],
  },

  // My Hero Academia
  {
    title: "Boku no Hero Academia",
    description: "Em um mundo onde 80% da população possui superpoderes chamados 'Quirks', Izuku Midoriya sonha em se tornar um herói profissional, apesar de ser um dos 20% que nasceram sem poderes. Sua vida muda quando conhece All Might, o maior herói de todos os tempos.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/boku-no-hero-academia/images/1051b417-9599-4dbd-b1a7-a38f390d9a8e.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/boku-no-hero-academia/images/95da90d1-af77-445c-8933-5f2c4364444d.jpg",
    year: 2016,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 138,
    genres: ["Ação", "Escola", "Super Poder", "Drama"],
  },

  // Jujutsu Kaisen
  {
    title: "Jujutsu Kaisen",
    description: "Yuji Itadori é um estudante do ensino médio com habilidades físicas excepcionais. Toda noite, ele visita seu avô no hospital. Quando criaturas demoníacas conhecidas como 'Maldições' atacam sua escola, Yuji engole um dedo amaldiçoado para proteger seus amigos, se tornando hospedeiro de Sukuna, o Rei das Maldições.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/jujutsu-kaisen/images/0cbe832e-0410-4cce-9c97-ed75c152720f.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/jujutsu-kaisen/images/4b5bcdd7-5199-445b-afd8-f12dbe0a6c7b.jpg",
    year: 2020,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "16+",
    totalEpisodes: 24,
    genres: ["Ação", "Escola", "Sobrenatural", "Drama"],
  },

  // Death Note
  {
    title: "Death Note",
    description: "Light Yagami é um estudante brilhante que está descontente com o crime e a corrupção no mundo. Quando encontra o Death Note, um caderno sobrenatural usado por Shinigami (deuses da morte) para matar humanos, ele decide criar um novo mundo livre do mal eliminando criminosos.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/death-note/images/aaa90a27-82d1-4db6-a9a2-931929942ef4.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/death-note/images/e4f59022-d388-44a1-9820-bc7b64c1a819.jpg",
    year: 2006,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "16+",
    totalEpisodes: 37,
    genres: ["Policial", "Drama", "Fantasia", "Sobrenatural", "Suspense", "Psicológico"],
  },

  // Naruto
  {
    title: "Naruto",
    description: "Naruto Uzumaki é um jovem ninja da Vila da Folha que sonha em se tornar Hokage, o líder da vila. Rejeitado pelos moradores por ser o hospedeiro da raposa de nove caudas que atacou a vila anos atrás, Naruto luta para ser reconhecido e realizar seu sonho.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/naruto/images/26f820ce-4fd8-41f0-9c8d-1c67f8494242.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/naruto/images/07e54f0c-6b65-45ae-88a7-1fc4ab1ea455.jpg",
    year: 2002,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 720,
    genres: ["Ação", "Artes Marciais", "Comédia", "Drama", "Ninja"],
  },

  // Fullmetal Alchemist: Brotherhood
  {
    title: "Fullmetal Alchemist: Brotherhood",
    description: "Após uma tentativa falhada de ressuscitar sua mãe usando alquimia, os irmãos Edward e Alphonse Elric pagaram um preço terrível. Edward perdeu uma perna e Alphonse perdeu todo o seu corpo, tendo sua alma presa numa armadura. Agora eles buscam a Pedra Filosofal para recuperar o que perderam.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/fullmetal-alchemist/images/791d9b3e-41d6-4710-a2d6-4eae46bae179.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/fullmetal-alchemist/images/f8c7d0ca-8195-4dc2-8007-70d74005299f.jpg",
    year: 2009,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 64,
    genres: ["Ação", "Aventura", "Drama", "Fantasia", "Militar"],
  },

  // Dragon Ball Z
  {
    title: "Dragon Ball Z",
    description: "Cinco anos se passaram desde que Goku derrotou Piccolo no Torneio Mundial de Artes Marciais. Ele se casou com Chi-Chi e tem um filho chamado Gohan. Raditz, um guerreiro Saiyan, chega à Terra em busca de Goku, revelando que Goku é um Saiyan chamado Kakarot.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/dragon-ball-z/images/b7d2ecb5-03d5-4f6f-ad4f-3bf16a818c4e.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/dragon-ball-z/images/b7d2ecb5-03d5-4f6f-ad4f-3bf16a818c4e.jpg",
    year: 1989,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 291,
    genres: ["Ação", "Aventura", "Artes Marciais", "Super Poder", "Fantasia"],
  },

  // One Punch Man
  {
    title: "One Punch Man",
    description: "Saitama é um super-herói que pode derrotar qualquer inimigo com apenas um soco, mas luta contra a depressão e falta de reconhecimento. Ele se junta à Associação de Heróis e conhece Genos, um cyborg que se torna seu discípulo.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-punch-man/images/f8b95990-2779-4a4f-a4f6-b58db8e761fa.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-punch-man/images/f8b95990-2779-4a4f-a4f6-b58db8e761fa.jpg",
    year: 2015,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 24,
    genres: ["Ação", "Comédia", "Super Poder", "Sobrenatural"],
  },

  // Hunter x Hunter
  {
    title: "Hunter x Hunter",
    description: "Gon Freecss descobre que seu pai, que ele pensava estar morto, é na verdade um Hunter lendário. Para seguir os passos do pai, Gon decide fazer o Exame Hunter para se tornar um Hunter licenciado e encontrar seu pai.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/hunter-x-hunter/images/5766c2e9-be4b-4f5d-a274-3c07bd020b87.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/hunter-x-hunter/images/5766c2e9-be4b-4f5d-a274-3c07bd020b87.jpg",
    year: 2011,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 148,
    genres: ["Ação", "Aventura", "Fantasia", "Super Poder"],
  },

  // Tokyo Ghoul
  {
    title: "Tokyo Ghoul",
    description: "Ken Kaneki é um estudante universitário tímido até que um encontro com Rize, uma garota que revela ser um ghoul carnívoro, muda sua vida para sempre. Após um acidente, Kaneki passa por uma cirurgia que o transforma num meio-ghoul, forçando-o a se adaptar a uma nova vida.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tokyo-ghoul/images/e3bd62e7-0cc3-45e4-8b87-6f1834db4503.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tokyo-ghoul/images/e3bd62e7-0cc3-45e4-8b87-6f1834db4503.jpg",
    year: 2014,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "18+",
    totalEpisodes: 48,
    genres: ["Ação", "Horror", "Sobrenatural", "Drama", "Fantasia"],
  },

  // Mob Psycho 100
  {
    title: "Mob Psycho 100",
    description: "Shigeo 'Mob' Kageyama é um estudante do ensino médio com poderes psíquicos impressionantes. Ele trabalha como assistente do autodenominado psíquico Arataka Reigen. Mob quer viver uma vida normal e controlar seus poderes, mas isso se torna difícil quando espíritos malignos aparecem.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/mob-psycho-100/images/17261809-4d58-4ee5-99b9-31e664a67679.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/mob-psycho-100/images/17261809-4d58-4ee5-99b9-31e664a67679.jpg",
    year: 2016,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 37,
    genres: ["Ação", "Comédia", "Sobrenatural", "Escola", "Super Poder"],
  },

  // Violet Evergarden
  {
    title: "Violet Evergarden",
    description: "Violet Evergarden, uma ex-soldado, agora trabalha numa agência postal escrevendo cartas para pessoas que não conseguem expressar seus sentimentos. Através deste trabalho, ela gradualmente aprende sobre emoções humanas e o significado do amor.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/violet-evergarden/images/a0c8a8fb-2b94-4ebf-a21e-ca0256262124.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/violet-evergarden/images/a0c8a8fb-2b94-4ebf-a21e-ca0256262124.jpg",
    year: 2018,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 13,
    genres: ["Drama", "Fantasia", "Slice of Life"],
  },

  // Your Name
  {
    title: "Kimi no Na wa",
    description: "Mitsuha, uma estudante do ensino médio que vive numa pequena cidade rural, sonha com uma vida na metrópole de Tóquio. Taki, um estudante do ensino médio de Tóquio, trabalha meio período num restaurante italiano. Mysteriosamente, eles começam a trocar de corpo em seus sonhos.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kimi-no-na-wa/images/f2947b20-e5ce-44c0-b71a-855456f590b1.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kimi-no-na-wa/images/f2947b20-e5ce-44c0-b71a-855456f590b1.jpg",
    year: 2016,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "10+",
    totalEpisodes: 1,
    genres: ["Romance", "Drama", "Sobrenatural", "Slice of Life"],
  },

  // Spirited Away
  {
    title: "Sen to Chihiro no Kamikakushi",
    description: "Durante uma mudança para uma nova casa, Chihiro, uma menina de 10 anos, entra num mundo governado por bruxas, espíritos e dragões. Após seus pais serem transformados em porcos por uma bruxa, Chihiro deve superar seus medos e encontrar uma forma de salvar sua família e voltar para casa.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/sen-to-chihiro-no-kamikakushi/images/8be2b7fe-24d9-487e-8f98-b9906861a70c.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/sen-to-chihiro-no-kamikakushi/images/8be2b7fe-24d9-487e-8f98-b9906861a70c.jpg",
    year: 2001,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "Livre",
    totalEpisodes: 1,
    genres: ["Aventura", "Família", "Fantasia", "Sobrenatural"],
  },

  // Princess Mononoke
  {
    title: "Mononoke-hime",
    description: "Ashitaka, um jovem guerreiro, é amaldiçoado durante uma batalha com um demônio javali. Buscando uma cura, ele viaja para o oeste e se envolve numa guerra entre Lady Eboshi de Iron Town e San (Princesa Mononoke), uma garota criada por lobos que protege a floresta.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/mononoke-hime/images/5cdcc15d-6e29-4dab-af0c-1c936cdf1457.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/mononoke-hime/images/5cdcc15d-6e29-4dab-af0c-1c936cdf1457.jpg",
    year: 1997,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "12+",
    totalEpisodes: 1,
    genres: ["Aventura", "Drama", "Fantasia"],
  },

  // Akira
  {
    title: "Akira",
    description: "Em 2019, 31 anos após a destruição de Tóquio por uma explosão psíquica, Neo-Tokyo é uma metrópole sombria. Kaneda lidera uma gangue de motoqueiros e deve parar seu amigo Tetsuo, que desenvolveu poderes psíquicos destrutivos após um acidente.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/akira/images/83e66712-bdc2-4fc2-859a-0b8b5123d453.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/akira/images/83e66712-bdc2-4fc2-859a-0b8b5123d453.jpg",
    year: 1988,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "16+",
    totalEpisodes: 1,
    genres: ["Ação", "Ficção Científica", "Suspense", "Militar"],
  },

  // Studio Ghibli - Totoro
  {
    title: "Tonari no Totoro",
    description: "Duas irmãs se mudam para uma casa no campo para ficarem perto da mãe hospitalizada. Lá elas descobrem criaturas mágicas da floresta, incluindo Totoro, um espírito gigante e gentil que vive numa árvore centenária próxima à casa.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tonari-no-totoro/images/70652ad4-8ed9-4bcc-97a0-633cb3151519.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tonari-no-totoro/images/70652ad4-8ed9-4bcc-97a0-633cb3151519.jpg",
    year: 1988,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "Livre",
    totalEpisodes: 1,
    genres: ["Aventura", "Família", "Fantasia", "Slice of Life"],
  },

  // Cowboy Bebop
  {
    title: "Cowboy Bebop",
    description: "No ano 2071, a humanidade colonizou vários planetas e luas do sistema solar. Spike Spiegel e Jet Black são caçadores de recompensas que viajam pela galáxia numa espaçonave chamada Bebop, capturando criminosos e tentando ganhar a vida.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/cowboy-bebop/images/2a4ddf98-4023-4d91-aa92-08b4d97e5463.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/cowboy-bebop/images/2a4ddf98-4023-4d91-aa92-08b4d97e5463.jpg",
    year: 1998,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "16+",
    totalEpisodes: 26,
    genres: ["Ação", "Aventura", "Comédia", "Drama", "Ficção Científica"],
  },

  // Neon Genesis Evangelion
  {
    title: "Neon Genesis Evangelion",
    description: "Em 2015, Tóquio-3 é atacada por misteriosas criaturas chamadas Anjos. A organização NERV usa biomáquinas gigantes chamadas Evangelions para combatê-los. Shinji Ikari, de 14 anos, é recrutado por seu pai para pilotar o Eva-01.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/neon-genesis-evangelion/images/0895c594-1969-4790-8ac5-36395ba0b66a.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/neon-genesis-evangelion/images/0895c594-1969-4790-8ac5-36395ba0b66a.jpg",
    year: 1995,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 26,
    genres: ["Ação", "Drama", "Mecha", "Psicológico", "Ficção Científica"],
  },

  // Code Geass
  {
    title: "Code Geass: Hangyaku no Lelouch",
    description: "Lelouch vi Britannia, exilado príncipe do Sacro Império da Britannia, obtém um misterioso poder chamado Geass que lhe permite controlar mentes. Ele usa esse poder para liderar uma rebelião contra Britannia sob a identidade mascarada de Zero.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/code-geass-hangyaku-no-lelouch/images/f2f48a59-6387-4e92-be0c-df58ede9a953.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/code-geass-hangyaku-no-lelouch/images/f2f48a59-6387-4e92-be0c-df58ede9a953.jpg",
    year: 2006,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 50,
    genres: ["Drama", "Mecha", "Militar", "Escola", "Super Poder"],
  },

  // Bleach
  {
    title: "Bleach",
    description: "Ichigo Kurosaki é um adolescente que pode ver fantasmas. Sua vida muda drasticamente quando encontra Rukia Kuchiki, uma Soul Reaper ferida em batalha com um Hollow. Para salvar sua família, Ichigo aceita os poderes de Soul Reaper de Rukia.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/bleach/images/21c16166-83aa-45e4-87f6-3cdcd83fe634.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/bleach/images/21c16166-83aa-45e4-87f6-3cdcd83fe634.jpg",
    year: 2004,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 366,
    genres: ["Ação", "Aventura", "Sobrenatural", "Super Poder"],
  },

  // One Piece Film Red
  {
    title: "One Piece Film: Red",
    description: "Uta, a cantora mais amada do mundo, revela-se em público pela primeira vez num concerto ao vivo. Sua voz, descrita como 'sobrenatural', cativa a audiência ao redor do mundo. Luffy e os Chapéus de Palha comparecem ao concerto, onde descobrem que Uta é filha de Shanks.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-piece-film-red/images/d48c9b37-a541-4c61-beb3-9315b1c5fced.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/one-piece-film-red/images/d48c9b37-a541-4c61-beb3-9315b1c5fced.jpg",
    year: 2022,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "12+",
    totalEpisodes: 1,
    genres: ["Ação", "Aventura", "Fantasia", "Música"],
  },

  // Chainsaw Man
  {
    title: "Chainsaw Man",
    description: "Denji é um jovem pobre que trabalha como Devil Hunter com seu companheiro demônio Pochita para pagar as dívidas de seu pai falecido com a yakuza. Após ser morto pela yakuza, Pochita se funde com Denji, transformando-o no Chainsaw Man.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/chainsaw-man/images/e370854c-a29f-4f63-8fcb-32b83dfbff38.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/chainsaw-man/images/e370854c-a29f-4f63-8fcb-32b83dfbff38.jpg",
    year: 2022,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "18+",
    totalEpisodes: 12,
    genres: ["Ação", "Horror", "Sobrenatural", "Gore"],
  },

  // Spy x Family
  {
    title: "Spy x Family",
    description: "Loid Forger, um espião de elite, deve se infiltrar numa escola de prestígio. Para isso, ele cria uma família falsa: casa-se com Yor, uma assassina, e adota Anya, uma garota com poderes telepáticos. Nenhum deles conhece o segredo dos outros.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/spy-x-family/images/9465cc0c-b392-40c0-b9ce-c72fb958e405.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/spy-x-family/images/9465cc0c-b392-40c0-b9ce-c72fb958e405.jpg",
    year: 2022,
    status: "ONGOING" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "10+",
    totalEpisodes: 25,
    genres: ["Ação", "Comédia", "Família", "Escola"],
  },

  // Kaguya-sama
  {
    title: "Kaguya-sama wa Kokurasetai",
    description: "Kaguya Shinomiya e Miyuki Shirogane são os dois melhores estudantes da Academia Shuchi'in e membros do conselho estudantil. Ambos se apaixonaram, mas são orgulhosos demais para confessar, então travam uma guerra psicológica para fazer o outro confessar primeiro.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kaguya-sama-wa-kokurasetai/images/1e10d47c-c244-4e52-b81b-ffc7c38a5261.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/kaguya-sama-wa-kokurasetai/images/1e10d47c-c244-4e52-b81b-ffc7c38a5261.jpg",
    year: 2019,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 37,
    genres: ["Comédia", "Romance", "Escola", "Seinen"],
  },

  // Attack on Titan Final Season
  {
    title: "Shingeki no Kyojin: The Final Season",
    description: "Quatro anos após a Batalha de Shiganshina, um mundo em guerra aguarda. Marley planeja um ataque a Paradis para recuperar o Titã Fundador. Enquanto isso, Eren Yeager e os Scouts descobrem a verdade sobre o mundo além das muralhas.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shingeki-no-kyojin-the-final-season/images/3b5d8892-936b-4bce-a2f5-26852c127d68.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shingeki-no-kyojin-the-final-season/images/3b5d8892-936b-4bce-a2f5-26852c127d68.jpg",
    year: 2020,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "18+",
    totalEpisodes: 28,
    genres: ["Ação", "Drama", "Fantasia", "Horror", "Militar"],
  },

  // Weathering With You
  {
    title: "Tenki no Ko",
    description: "Hodaka, um estudante do ensino médio, foge para Tóquio onde conhece Hina, uma garota órfã que possui a habilidade sobrenatural de controlar o tempo. Juntos, eles descobrem que o dom dela tem um preço terrível.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tenki-no-ko/images/bef3b4be-eed1-42f0-9aac-09d5404aa8d5.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/tenki-no-ko/images/bef3b4be-eed1-42f0-9aac-09d5404aa8d5.jpg",
    year: 2019,
    status: "FINISHED" as AnimeStatus,
    type: "FILME" as AnimeType,
    rating: "10+",
    totalEpisodes: 1,
    genres: ["Romance", "Drama", "Sobrenatural", "Slice of Life"],
  },

  // Haikyuu
  {
    title: "Haikyuu!!",
    description: "Hinata Shouyou, inspirado por um jogador de vôlei conhecido como 'Pequeno Gigante', ingressa no clube de vôlei de sua escola. Lá ele encontra Tobio Kageyama, um setter talentoso mas autoritário apelidado de 'Rei da Quadra'.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/haikyuu/images/a99cbe63-ff1e-4c6b-9332-b2946f3d391d.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/haikyuu/images/a99cbe63-ff1e-4c6b-9332-b2946f3d391d.jpg",
    year: 2014,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "10+",
    totalEpisodes: 85,
    genres: ["Comédia", "Drama", "Escola", "Esporte", "Shounen"],
  },

  // Your Lie in April
  {
    title: "Shigatsu wa Kimi no Uso",
    description: "Kousei Arima era um prodígio do piano, mas após a morte de sua mãe, perdeu a capacidade de ouvir o som de seu próprio piano. Sua vida muda quando conhece Kaori Miyazono, uma violinista vibrante e de espírito livre que o ajuda a redescobrir sua paixão pela música.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shigatsu-wa-kimi-no-uso/images/1edd8fb3-0273-4d8e-89a5-cb2ad828cc84.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/shigatsu-wa-kimi-no-uso/images/1edd8fb3-0273-4d8e-89a5-cb2ad828cc84.jpg",
    year: 2014,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "12+",
    totalEpisodes: 22,
    genres: ["Drama", "Música", "Romance", "Escola", "Slice of Life"],
  },

  // Steins;Gate
  {
    title: "Steins;Gate",
    description: "Rintarou Okabe é um estudante universitário que se considera um cientista maluco. Com seus amigos, ele acidentalmente descobre uma maneira de enviar mensagens de texto para o passado. Isso atrai a atenção de SERN, uma organização misteriosa.",
    thumbnail: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/steinsgate/images/ab23cc3f-d00c-479d-8ef5-5df95eff1612.jpg",
    banner: "https://pub-b182118fc2564afd8753d31e5fbe050c.r2.dev/animes/steinsgate/images/ab23cc3f-d00c-479d-8ef5-5df95eff1612.jpg",
    year: 2011,
    status: "FINISHED" as AnimeStatus,
    type: "ANIME" as AnimeType,
    rating: "14+",
    totalEpisodes: 24,
    genres: ["Drama", "Ficção Científica", "Suspense", "Thriller"],
  },
]

async function seedRealAnimes() {
  console.log('🎬 Seeding database with real animes...')

  const animes = []
  
  for (const animeData of realAnimes) {
    console.log(`Creating anime: ${animeData.title}`)
    
    const slug = generateSlug(animeData.title)
    
    const anime = await prisma.anime.upsert({
      where: { slug },
      update: {
        ...animeData,
        slug
      },
      create: {
        ...animeData,
        slug
      }
    })
    
    animes.push(anime)
    
    // Verificar se já tem temporadas
    const existingSeasons = await prisma.season.count({
      where: { animeId: anime.id }
    })
    
    if (existingSeasons === 0) {
      // Criar temporadas e episódios para animes de TV
      if (anime.type === 'ANIME' && anime.totalEpisodes && anime.totalEpisodes > 1) {
        const seasonsCount = Math.ceil(anime.totalEpisodes / 24) // ~24 eps por temporada
        
        for (let seasonNum = 1; seasonNum <= seasonsCount; seasonNum++) {
          const episodesInSeason = seasonNum === seasonsCount 
            ? anime.totalEpisodes - ((seasonNum - 1) * 24)
            : 24
          
          const season = await prisma.season.create({
            data: {
              animeId: anime.id,
              seasonNumber: seasonNum,
              title: `Temporada ${seasonNum}`,
              description: `${seasonNum}ª temporada de ${anime.title}`,
            }
          })
          
          // Criar episódios
          const episodesData = Array.from({ length: episodesInSeason }, (_, i) => ({
            seasonId: season.id,
            episodeNumber: i + 1,
            title: `Episódio ${i + 1}`,
            description: `Episódio ${i + 1} da ${seasonNum}ª temporada de ${anime.title}`,
            duration: 24, // 24 minutos padrão
          }))
          
          await prisma.episode.createMany({
            data: episodesData
          })
        }
      } else if (anime.type === 'FILME') {
        // Para filmes, criar apenas 1 temporada com 1 episódio
        const season = await prisma.season.create({
          data: {
            animeId: anime.id,
            seasonNumber: 1,
            title: "Filme",
            description: `Filme completo de ${anime.title}`,
          }
        })
        
        await prisma.episode.create({
          data: {
            seasonId: season.id,
            episodeNumber: 1,
            title: anime.title,
            description: anime.description,
            duration: 120, // 2 horas padrão para filmes
          }
        })
      }
    }
  }
  
  console.log(`✅ Created ${animes.length} real animes with seasons and episodes`)
  return animes
}

async function main() {
  try {
    await seedRealAnimes()
    console.log('🎉 Real animes seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding real animes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export { seedRealAnimes }