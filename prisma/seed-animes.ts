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
    thumbnail: "https://m.media-amazon.com/images/I/81+z4YcclGL._UF1000,1000_QL80_.jpg",
    banner: "https://m.media-amazon.com/images/I/81+z4YcclGL._UF1000,1000_QL80_.jpg",
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
    thumbnail: "https://i.bj-share.info/dbfbcbce6216528b5d1613942310f627.jpg",
    banner: "https://i.bj-share.info/dbfbcbce6216528b5d1613942310f627.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    banner: "https://images6.alphacoders.com/133/1336875.png",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    banner: "https://images4.alphacoders.com/100/1002405.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    banner: "https://images2.alphacoders.com/906/906379.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    banner: "https://images3.alphacoders.com/117/1174829.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    banner: "https://images6.alphacoders.com/309/309122.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    banner: "https://images8.alphacoders.com/413/413175.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    banner: "https://images5.alphacoders.com/264/264550.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1277/142402.jpg",
    banner: "https://images2.alphacoders.com/100/1003663.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
    banner: "https://images6.alphacoders.com/679/679408.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
    banner: "https://images4.alphacoders.com/544/544448.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
    banner: "https://images2.alphacoders.com/507/507842.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/8/80356.jpg",
    banner: "https://images4.alphacoders.com/909/909618.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/3/88097.jpg",
    banner: "https://images6.alphacoders.com/897/897695.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
    banner: "https://images3.alphacoders.com/775/775397.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/6/179.jpg",
    banner: "https://images5.alphacoders.com/358/358362.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/7/75919.jpg",
    banner: "https://images4.alphacoders.com/889/88974.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1310/92651.jpg",
    banner: "https://images7.alphacoders.com/889/88950.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/4/75923.jpg",
    banner: "https://images2.alphacoders.com/889/88973.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    banner: "https://images6.alphacoders.com/889/88977.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1314/108941.jpg",
    banner: "https://images4.alphacoders.com/889/88958.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/50331.jpg",
    banner: "https://images8.alphacoders.com/889/88981.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1070/124366.jpg",
    banner: "https://images3.alphacoders.com/889/88959.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1769/126216.jpg",
    banner: "https://images2.alphacoders.com/129/1291469.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    banner: "https://images6.alphacoders.com/130/1303856.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    banner: "https://images8.alphacoders.com/125/1259421.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1160/95099.jpg",
    banner: "https://images4.alphacoders.com/103/1032281.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1000/110531.jpg",
    banner: "https://images5.alphacoders.com/114/1142077.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/1596/101313.jpg",
    banner: "https://images3.alphacoders.com/103/1039280.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/7/76014.jpg",
    banner: "https://images6.alphacoders.com/889/88968.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/3/67177.jpg",
    banner: "https://images6.alphacoders.com/889/88966.jpg",
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
    thumbnail: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
    banner: "https://images4.alphacoders.com/889/88964.jpg",
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