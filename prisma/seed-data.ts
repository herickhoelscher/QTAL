/**
 * Conteudo de demonstracao do portal.
 *
 * Separado do seed.ts de proposito: aqui fica so o material editorial, que e o
 * que muda quando a redacao do cliente entra no lugar da demo; a mecanica de
 * gravacao no banco fica no seed. Fotos em public/exemplos (acervo Unsplash via
 * Lorem Picsum, uso livre) e videos abertos da Blender Foundation (CC-BY).
 */

export const photo = (name: string) => "/exemplos/" + name + ".jpg";

export const categories = [
  { name: "Arquitetura", slug: "arquitetura", type: "ARTICLE" as const },
  { name: "Mercado imobiliário", slug: "mercado-imobiliario", type: "ARTICLE" as const },
  { name: "Lifestyle", slug: "lifestyle", type: "ARTICLE" as const },
  { name: "Colunistas", slug: "colunistas", type: "ARTICLE" as const },
  { name: "Gastronomia", slug: "gastronomia", type: "ARTICLE" as const },
  { name: "Cultura", slug: "cultura", type: "ARTICLE" as const },
  { name: "Inspiração", slug: "inspiracao", type: "ARTICLE" as const },
  { name: "Social", slug: "social", type: "EVENT" as const },
  { name: "Corporativo", slug: "corporativo", type: "EVENT" as const },
  { name: "Gastronomia", slug: "gastronomia", type: "EVENT" as const },
  { name: "Cultura", slug: "cultura", type: "EVENT" as const },
  { name: "Entrevistas", slug: "entrevistas", type: "VIDEO" as const },
  { name: "Bastidores", slug: "bastidores", type: "VIDEO" as const },
  { name: "Coberturas", slug: "coberturas", type: "VIDEO" as const },
];

export type SeedArticle = {
  title: string;
  slug: string;
  subtitle: string;
  cover: string;
  featured: boolean;
  region: string;
  categories: string[];
  body: string;
};

export const articles: SeedArticle[] = [
  {
    title: "A casa que aprendeu a respirar",
    slug: "a-casa-que-aprendeu-a-respirar",
    subtitle:
      "Um projeto de 210 m² em que ventilação cruzada e sombreamento substituíram o ar-condicionado.",
    cover: photo("materia-01"),
    featured: true,
    region: "Oeste do Paraná",
    categories: ["arquitetura"],
    body: "<p>O terreno tinha a pior orientação possível: fachada principal voltada para o poente, sem barreira de vegetação e com um vizinho de dois pavimentos bloqueando o vento dominante. A solução do escritório foi inverter a lógica do programa e empurrar os ambientes de permanência para o miolo do lote.</p><h2>Ventilação como partido</h2><p>As aberturas foram dimensionadas em pares opostos, criando corredores de ar que atravessam a casa inteira. Em dias de 34 graus, a temperatura interna fica quatro graus abaixo da externa sem nenhum equipamento ligado. O truque não está em uma peça só: é a soma de pé-direito alto na sala, esquadria baixa no corredor e uma abertura zenital que funciona como chaminé térmica.</p><blockquote>Projetar para o clima é mais barato que corrigir o clima depois.</blockquote><p>O brise de madeira, executado por marcenaria local, filtra o sol da tarde e transforma a sala em um relógio de sombras ao longo do dia. Custou 12% do orçamento de fachada e, segundo a conta do próprio morador, se pagou no segundo verão.</p><h2>O que ficou de aprendizado</h2><p>Nem tudo funcionou de primeira. A cobertura verde prevista no projeto original saiu do escopo por causa da estrutura, e a área de serviço — encostada na face norte — ainda esquenta demais entre dezembro e fevereiro. O escritório já ensaia uma pérgola para o próximo verão.</p>",
  },
  {
    title: "O metro quadrado mudou de bairro",
    slug: "o-metro-quadrado-mudou-de-bairro",
    subtitle: "Levantamento aponta deslocamento da valorização para a região norte da cidade.",
    cover: photo("materia-02"),
    featured: true,
    region: "Toledo",
    categories: ["mercado-imobiliario"],
    body: "<p>Nos últimos dezoito meses, o eixo de valorização imobiliária da cidade se deslocou. Bairros que eram periferia consolidada passaram a registrar as maiores altas por metro quadrado, enquanto o centro histórico ficou estável.</p><h2>O que puxou a curva</h2><p>Três fatores aparecem em todas as análises: a chegada de uma âncora comercial, o recapeamento das vias de acesso e a abertura de duas escolas particulares em um raio de dois quilômetros. Onde os três coincidem, a alta passou de 20% no período.</p><p>Para quem compra, a janela ainda existe — mas ela está fechando mais rápido do que o mercado imaginava no início do ano. Corretores relatam imóveis que saem do anúncio em menos de trinta dias, algo que não acontecia desde 2021.</p><h2>E quem já mora ali</h2><p>A valorização tem o outro lado. O IPTU subiu junto, e comerciantes antigos da região relatam aumentos de aluguel que não cabem no faturamento. A prefeitura estuda uma faixa de transição para o próximo exercício.</p>",
  },
  {
    title: "Uma mesa para vinte e quatro pessoas",
    slug: "uma-mesa-para-vinte-e-quatro-pessoas",
    subtitle: "A cozinha voltou a ser o centro da casa, e a marcenaria acompanhou.",
    cover: photo("materia-03"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["lifestyle", "gastronomia"],
    body: "<p>A ilha de nove metros não é exagero: é programa. Quando a família recebe, ninguém fica na sala — e o projeto assumiu isso em vez de brigar contra.</p><h2>Madeira que envelhece bem</h2><p>O tampo é de peroba rosa de demolição, tratado com óleo e não com verniz. A escolha assume as marcas do uso em vez de tentar escondê-las: em cinco anos, a mesa terá mais história do que quando saiu da oficina.</p><p>Em volta, bancos corridos substituem cadeiras individuais. Cabem vinte e quatro pessoas sem que ninguém precise se levantar para deixar outro passar — detalhe que parece pequeno até a primeira ceia de Natal.</p>",
  },
  {
    title: "O bairro que virou destino de fim de semana",
    slug: "o-bairro-que-virou-destino-de-fim-de-semana",
    subtitle: "Cafés, feira de produtor e um calçadão recuperado mudaram a rotina do centro.",
    cover: photo("materia-04"),
    featured: false,
    region: "Toledo",
    categories: ["lifestyle", "mercado-imobiliario"],
    body: "<p>Há três anos, o comércio fechava ao meio-dia de sábado. Hoje, a fila do café da esquina dobra o quarteirão às nove da manhã.</p><h2>A conta do comerciante</h2><p>O movimento de fim de semana já responde por 40% do faturamento de alguns pontos — número que reorganizou escalas, estoques e até o horário das entregas. Dois estabelecimentos passaram a abrir aos domingos pela primeira vez desde que existem.</p><p>A virada não foi espontânea. Começou com a recuperação do calçadão, seguiu com a permissão para mesas na calçada e ganhou tração quando a feira do produtor mudou de endereço.</p>",
  },
  {
    title: "Cimento queimado saiu de moda?",
    slug: "cimento-queimado-saiu-de-moda",
    subtitle: "Três especialistas discordam sobre o acabamento mais usado da última década.",
    cover: photo("materia-05"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["arquitetura"],
    body: "<p>O acabamento que dominou os projetos residenciais entre 2015 e 2023 começa a dividir opiniões — menos por estética e mais por manutenção.</p><h2>O problema não é o cimento</h2><p>É a expectativa. Quem entende que o piso vai trincar convive bem com ele; quem espera uniformidade de porcelanato se frustra no primeiro inverno. A fissura não é defeito de execução: é comportamento do material.</p><blockquote>Material honesto é aquele que não promete o que não pode cumprir.</blockquote><p>Entre os três entrevistados, dois seguem especificando o acabamento em áreas sociais e nenhum o recomenda para áreas molhadas sem tratamento adicional.</p>",
  },
  {
    title: "Quem assina a coluna desta semana",
    slug: "quem-assina-a-coluna-desta-semana",
    subtitle: "Um convite para ler a cidade a partir de quem a projeta todos os dias.",
    cover: photo("materia-06"),
    featured: false,
    region: "Toledo",
    categories: ["colunistas"],
    body: "<p>A cidade que aparece nos projetos nem sempre é a cidade que se vive. Esta coluna nasce dessa distância.</p><p>A cada semana, um profissional de arquitetura, urbanismo ou mercado imobiliário escreve sobre uma decisão de projeto que mudou de ideia no meio do caminho — o que estava no papel, o que o canteiro impôs e o que ficou.</p><h2>Como participar</h2><p>Quem quiser escrever pode mandar uma proposta de duas linhas para a redação. Não há tema fixo: há o compromisso de contar o processo, inclusive a parte que deu errado.</p>",
  },
  {
    title: "A padaria que virou ponto de encontro",
    slug: "a-padaria-que-virou-ponto-de-encontro",
    subtitle: "Fermentação natural, quinze lugares e uma fila que começa antes de abrir.",
    cover: photo("materia-07"),
    featured: false,
    region: "Toledo",
    categories: ["gastronomia", "lifestyle"],
    body: "<p>São quinze lugares, nenhum reservado. Quem chega às sete encontra mesa; quem chega às nove entra na fila e aceita — porque virou parte do programa.</p><h2>Quatro dias de fermento</h2><p>O pão de longa fermentação leva quatro dias entre o levain e a assadeira. O processo define o cardápio: não existe repor no meio da manhã, e quando acaba, acaba.</p><p>A conta fecha porque o desperdício é quase nulo. O que sobra do dia vira farinha de rosca ou desconto para quem chega no fim da tarde — uma prática que os donos aprenderam observando padarias de bairro em Curitiba.</p>",
  },
  {
    title: "Três apartamentos, o mesmo andar, projetos opostos",
    slug: "tres-apartamentos-o-mesmo-andar-projetos-opostos",
    subtitle: "A mesma planta de 96 m² resolvida de três maneiras que não se conversam.",
    cover: photo("materia-08"),
    featured: true,
    region: "Toledo",
    categories: ["arquitetura", "inspiracao"],
    body: "<p>O prédio entregou três unidades idênticas no sexto andar. Dois anos depois, elas não têm quase nada em comum.</p><h2>O que cada um derrubou</h2><p>No primeiro, a parede entre cozinha e sala caiu e o apartamento virou um salão único. No segundo, aconteceu o contrário: ganhou uma porta de correr que isola a cozinha do estar. No terceiro, nada foi derrubado — a intervenção inteira foi de marcenaria e iluminação.</p><p>Os três custaram, proporcionalmente, valores parecidos. A diferença não estava no orçamento, e sim na pergunta que cada família fez antes de começar.</p><blockquote>A planta não decide como se mora. Ela apenas permite.</blockquote><p>O terceiro apartamento, o que menos mexeu na alvenaria, é o que os moradores dizem ter mudado mais.</p>",
  },
  {
    title: "O que muda no financiamento em 2027",
    slug: "o-que-muda-no-financiamento-em-2027",
    subtitle: "Novas faixas, entrada maior e o efeito prático para quem compra o primeiro imóvel.",
    cover: photo("materia-09"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["mercado-imobiliario"],
    body: "<p>As regras anunciadas para o próximo ano mexem em três pontos que afetam diretamente quem financia: percentual de entrada, prazo máximo e a forma de comprovação de renda para autônomos.</p><h2>O efeito no bolso</h2><p>Na simulação de um imóvel de R$ 450 mil, a entrada sai de R$ 90 mil para R$ 112 mil. A parcela cai, mas a barreira de entrada sobe — e é ela que trava a maioria das primeiras compras.</p><p>Para autônomos, a mudança pode ser positiva: extratos de recebimento por PIX passam a ser aceitos como comprovação em parte das instituições, o que reduz a papelada e encurta a análise.</p>",
  },
  {
    title: "A fábrica que virou centro cultural",
    slug: "a-fabrica-que-virou-centro-cultural",
    subtitle: "Quatro mil metros de galpão desativado e uma reforma que optou por não esconder nada.",
    cover: photo("materia-10"),
    featured: true,
    region: "Toledo",
    categories: ["cultura", "arquitetura"],
    body: "<p>O galpão estava fechado havia onze anos. A estrutura metálica resistiu; o telhado, não. A reforma começou justamente por aí — e decidiu que tudo que fosse novo seria visivelmente novo.</p><h2>Duas camadas de tempo</h2><p>O piso original de concreto foi mantido com as marcas das máquinas que ficaram ali por três décadas. As passarelas e a caixa de vidro do auditório, em contraste, chegaram em aço aparente e sem pintura de disfarce.</p><blockquote>Restaurar não é fingir que o tempo não passou.</blockquote><p>O espaço abriu com uma programação de dez dias e recebeu 4,2 mil pessoas. A agenda do semestre já está fechada, com escolas ocupando as manhãs de terça a quinta.</p>",
  },
  {
    title: "Telha, sombra e vento: o vocabulário do calor",
    slug: "telha-sombra-e-vento-o-vocabulario-do-calor",
    subtitle: "O que a arquitetura regional resolveu antes do ar-condicionado existir.",
    cover: photo("materia-11"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["arquitetura", "inspiracao"],
    body: "<p>Antes de o compressor resolver tudo, a casa resolvia sozinha. O beiral largo, o pé-direito alto e a varanda em volta não eram decoração: eram equipamento térmico.</p><h2>O beiral que sumiu</h2><p>A construção contemporânea encurtou o beiral por estética e por custo. O resultado aparece na conta de luz: sem sombreamento na fachada, a parede acumula calor o dia inteiro e devolve à noite.</p><p>Três projetos recentes na região retomaram o recurso — não como citação histórica, mas como cálculo. Em dois deles, a redução de consumo passou de 30% no verão.</p>",
  },
  {
    title: "Feira, feirante e o preço que não sobe",
    slug: "feira-feirante-e-o-preco-que-nao-sobe",
    subtitle: "Como quarenta bancas seguram o valor do hortifrúti em uma cidade que encareceu.",
    cover: photo("materia-12"),
    featured: false,
    region: "Toledo",
    categories: ["gastronomia", "cultura"],
    body: "<p>Enquanto o custo de vida subiu dois dígitos na cidade, o preço médio da cesta de hortifrúti da feira ficou praticamente parado. Não é acaso.</p><h2>Três elos a menos</h2><p>O produtor vende direto. Sem atravessador, sem centro de distribuição e sem logística de terceiro, três camadas de custo simplesmente não existem no preço final.</p><p>O modelo tem limite: depende de quem planta perto e de quem topa acordar às quatro da manhã no sábado. Metade dos feirantes tem mais de 55 anos, e a sucessão é a conversa recorrente entre eles.</p>",
  },
  {
    title: "Moda de rua no oeste: o inverno que não veio",
    slug: "moda-de-rua-no-oeste-o-inverno-que-nao-veio",
    subtitle: "Lojistas recalculam a coleção depois do julho mais quente da série histórica.",
    cover: photo("materia-13"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["lifestyle"],
    body: "<p>A coleção de inverno foi comprada em março, quando ninguém imaginava um julho de 29 graus. O estoque de tricô virou o problema da temporada.</p><h2>A saída foi encurtar</h2><p>Lojistas relatam ter reduzido em até 40% o volume de peças pesadas para o ano que vem, apostando em meia-estação. A mudança mexe com toda a cadeia: a confecção regional trabalha com seis meses de antecedência.</p><p>Quem se saiu melhor foi quem já trabalhava com reposição rápida e lotes pequenos — um modelo que o comércio local vinha resistindo a adotar.</p>",
  },
  {
    title: "Comprar na planta ainda compensa?",
    slug: "comprar-na-planta-ainda-compensa",
    subtitle: "Uma conta que depende menos do desconto e mais do prazo de entrega.",
    cover: photo("materia-14"),
    featured: false,
    region: "Toledo",
    categories: ["mercado-imobiliario", "colunistas"],
    body: "<p>O desconto na planta encolheu. Onde já se viu 30% de diferença para o pronto, hoje a média regional gira entre 12% e 18% — e isso muda a conta.</p><h2>O risco tem preço</h2><p>Entre a assinatura e a chave, são de 24 a 36 meses de correção pelo INCC. Em um ano de índice alto, parte relevante do desconto evapora antes da entrega.</p><blockquote>O desconto da planta é o pagamento pelo risco de esperar.</blockquote><p>Para quem tem prazo e tolerância, segue valendo. Para quem precisa morar em doze meses, a conta raramente fecha.</p>",
  },
  {
    title: "A biblioteca que abriu no antigo cinema",
    slug: "a-biblioteca-que-abriu-no-antigo-cinema",
    subtitle: "A sala de projeção virou acervo, e a plateia inclinada virou espaço de leitura.",
    cover: photo("materia-15"),
    featured: false,
    region: "Toledo",
    categories: ["cultura"],
    body: "<p>O cinema fechou em 2009 e passou uma década como depósito. A reabertura manteve o piso inclinado da plateia — a decisão mais discutida do projeto e, hoje, a mais elogiada.</p><h2>Ler onde se assistia</h2><p>As poltronas deram lugar a degraus largos com almofadas. O público senta onde quer, na altura que quiser, e a inclinação que servia à tela agora serve à conversa.</p><p>O acervo começou com 6 mil títulos, metade vinda de doação. A meta do primeiro ano é dobrar e abrir um núcleo de acervo regional, com jornais e revistas produzidos na cidade desde os anos 1960.</p>",
  },
  {
    title: "Casa de campo a vinte minutos do centro",
    slug: "casa-de-campo-a-vinte-minutos-do-centro",
    subtitle: "O programa de fim de semana que virou endereço fixo depois do home office.",
    cover: photo("materia-16"),
    featured: false,
    region: "Oeste do Paraná",
    categories: ["inspiracao", "arquitetura"],
    body: "<p>A casa foi projetada para sexta a domingo. Três anos depois, a família mora ali de segunda a segunda — e a arquitetura teve que se adaptar ao que não estava previsto.</p><h2>O escritório que não existia</h2><p>A varanda fechada virou sala de trabalho, com uma divisória de vidro que preservou a vista. Foi a única intervenção estrutural: o resto se resolveu com mobiliário e tomadas.</p><p>O deslocamento diário de vinte minutos, que parecia o obstáculo, acabou sendo o detalhe mais fácil. O difícil, segundo os moradores, foi a internet — resolvida com um link dedicado que custa mais que a conta de luz.</p>",
  },
];

export type SeedEvent = {
  title: string;
  slug: string;
  description: string;
  date: string;
  location: string;
  region: string;
  cover: string;
  categories: string[];
  gallery: { photo: string; alt: string; album: string }[];
};

export const events: SeedEvent[] = [
  {
    title: "Prêmio Arquitetura do Oeste 2026",
    slug: "premio-arquitetura-do-oeste-2026",
    description:
      "<p>A noite reuniu 320 convidados para a entrega das 12 categorias do prêmio, com projetos de sete cidades da região. A cerimônia durou duas horas e terminou com a revelação do projeto do ano, escolhido por um júri de cinco profissionais.</p>",
    date: "2026-08-22T20:00:00-03:00",
    location: "Teatro Municipal",
    region: "Toledo",
    cover: photo("evento-01"),
    categories: ["social"],
    gallery: [
      { photo: "evento-02", alt: "Chegada dos convidados", album: "Chegada" },
      { photo: "evento-03", alt: "Coquetel de abertura", album: "Chegada" },
      { photo: "evento-04", alt: "Entrega dos troféus", album: "Premiação" },
      { photo: "evento-05", alt: "Mesa de jurados", album: "Premiação" },
      { photo: "evento-06", alt: "Encerramento", album: "Encerramento" },
    ],
  },
  {
    title: "Feira do Produtor — edição de primavera",
    slug: "feira-do-produtor-edicao-de-primavera",
    description:
      "<p>Quarenta expositores ocuparam o calçadão central durante todo o domingo, com produção de dezoito propriedades rurais do município. A edição teve oficina de conservas pela manhã e show de viola ao entardecer.</p>",
    date: "2026-09-06T08:00:00-03:00",
    location: "Calçadão central",
    region: "Toledo",
    cover: photo("evento-07"),
    categories: ["gastronomia"],
    gallery: [
      { photo: "evento-08", alt: "Bancas na abertura", album: "Manhã" },
      { photo: "evento-09", alt: "Oficina de conservas", album: "Manhã" },
      { photo: "evento-10", alt: "Público no fim da tarde", album: "Tarde" },
      { photo: "evento-11", alt: "Show de encerramento", album: "Tarde" },
    ],
  },
  {
    title: "Jantar dos 30 anos da Associação Comercial",
    slug: "jantar-dos-30-anos-da-associacao-comercial",
    description:
      "<p>Duzentos e quarenta associados celebraram três décadas da entidade em um jantar com homenagem aos sete fundadores ainda em atividade. A noite também apresentou o plano de expansão do centro de convenções.</p>",
    date: "2026-07-18T20:30:00-03:00",
    location: "Centro de Eventos",
    region: "Toledo",
    cover: photo("evento-12"),
    categories: ["corporativo", "social"],
    gallery: [
      { photo: "evento-13", alt: "Recepção dos associados", album: "Recepção" },
      { photo: "evento-14", alt: "Homenagem aos fundadores", album: "Homenagem" },
      { photo: "evento-15", alt: "Jantar", album: "Jantar" },
      { photo: "evento-16", alt: "Brinde final", album: "Jantar" },
    ],
  },
  {
    title: "Festival de Inverno de Toledo",
    slug: "festival-de-inverno-de-toledo",
    description:
      "<p>Três dias de programação gratuita em quatro palcos espalhados pelo centro, com 28 atrações regionais. O festival levou 14 mil pessoas às ruas e fechou com um cortejo que reuniu quatro bandas ao mesmo tempo.</p>",
    date: "2026-06-27T18:00:00-03:00",
    location: "Centro histórico",
    region: "Toledo",
    cover: photo("evento-17"),
    categories: ["cultura"],
    gallery: [
      { photo: "evento-18", alt: "Palco principal", album: "Primeiro dia" },
      { photo: "evento-02", alt: "Público no largo", album: "Primeiro dia" },
      { photo: "evento-09", alt: "Cortejo de encerramento", album: "Encerramento" },
    ],
  },
  {
    title: "Lançamento do Residencial Ipê",
    slug: "lancamento-do-residencial-ipe",
    description:
      "<p>O empreendimento de 72 unidades foi apresentado a corretores e investidores em um coquetel no estande de vendas. Na primeira noite, 31% das unidades saíram — melhor desempenho de lançamento do ano na cidade.</p>",
    date: "2026-05-15T19:00:00-03:00",
    location: "Estande de vendas · Avenida Parigot de Souza",
    region: "Toledo",
    cover: photo("evento-03"),
    categories: ["corporativo"],
    gallery: [
      { photo: "evento-05", alt: "Estande de vendas", album: "Estande" },
      { photo: "evento-11", alt: "Apresentação do projeto", album: "Apresentação" },
      { photo: "evento-14", alt: "Coquetel", album: "Coquetel" },
    ],
  },
  {
    title: "Noite da Gastronomia Regional",
    slug: "noite-da-gastronomia-regional",
    description:
      "<p>Oito chefs da região assinaram um menu de seis tempos construído apenas com ingredientes produzidos em um raio de 80 quilômetros. O jantar esgotou em cinco dias e teve renda revertida ao banco de alimentos.</p>",
    date: "2026-04-11T20:00:00-03:00",
    location: "Casa da Cultura",
    region: "Marechal Cândido Rondon",
    cover: photo("evento-10"),
    categories: ["gastronomia", "social"],
    gallery: [
      { photo: "evento-04", alt: "Cozinha em operação", album: "Bastidores" },
      { photo: "evento-08", alt: "Prato de entrada", album: "Menu" },
      { photo: "evento-16", alt: "Salão durante o jantar", album: "Salão" },
    ],
  },
];

export type SeedVideo = {
  slug: string;
  title: string;
  description: string;
  embedId: string;
  featured: boolean;
  /** Slugs dos conteudos em que este mesmo video tambem aparece. */
  event: string | null;
  article?: string;
  property?: string;
  categories: string[];
  /** 9:16. Os filmes abertos da Blender sao todos 16:9. */
  vertical?: boolean;
};

/** Filmes abertos da Blender Foundation, licenca CC-BY, publicos no YouTube. */
export const videos: SeedVideo[] = [
  {
    slug: "bastidores-do-premio-arquitetura-do-oeste",
    title: "Bastidores do Prêmio Arquitetura do Oeste",
    description: "Como foi a preparação da noite de premiação, dos ensaios à entrega dos troféus.",
    embedId: "aqz-KE-bpKQ",
    featured: true,
    event: "premio-arquitetura-do-oeste-2026",
    categories: ["bastidores"],
  },
  {
    slug: "entrevista-o-futuro-do-centro",
    title: "Entrevista: o futuro do centro",
    description: "Conversa com quem está reocupando os sobrados do calçadão.",
    embedId: "eRsGyueVLvQ",
    featured: true,
    event: null,
    article: "o-bairro-que-virou-destino-de-fim-de-semana",
    categories: ["entrevistas"],
  },
  {
    slug: "a-feira-vista-de-cima",
    title: "A feira vista de cima",
    description: "Um domingo inteiro de feira no calçadão, em dois minutos.",
    embedId: "R6MlUcmOul8",
    featured: true,
    event: "feira-do-produtor-edicao-de-primavera",
    categories: ["coberturas"],
  },
  {
    slug: "visita-casa-com-patio-interno",
    title: "Visita: casa com pátio interno",
    description: "O percurso da entrada ao pátio central, acompanhando a luz da tarde.",
    embedId: "Y-rmzh0PI3c",
    featured: false,
    event: null,
    article: "a-casa-que-aprendeu-a-respirar",
    property: "casa-terrea-com-patio-interno",
    categories: ["coberturas"],
  },
  {
    slug: "coluna-o-que-a-cidade-ensina",
    title: "Coluna: o que a cidade ensina",
    description: "O primeiro vídeo da série com colunistas de arquitetura e urbanismo.",
    embedId: "TLkA0RELQ1g",
    featured: false,
    event: null,
    article: "quem-assina-a-coluna-desta-semana",
    categories: ["entrevistas"],
  },
  {
    slug: "minuto-mercado-o-metro-quadrado-em-setembro",
    title: "Minuto Mercado: o metro quadrado em setembro",
    description: "Os números do mês explicados em um minuto.",
    embedId: "mN0zPOpADL4",
    featured: false,
    event: null,
    article: "o-metro-quadrado-mudou-de-bairro",
    categories: ["entrevistas"],
  },
  {
    slug: "festival-de-inverno-o-melhor-dos-tres-dias",
    title: "Festival de Inverno: o melhor dos três dias",
    description: "Vinte e oito atrações, quatro palcos e 14 mil pessoas nas ruas do centro.",
    embedId: "WhWc3b3KhnY",
    featured: true,
    event: "festival-de-inverno-de-toledo",
    categories: ["coberturas"],
  },
  {
    slug: "dentro-da-fabrica-que-virou-centro-cultural",
    title: "Dentro da fábrica que virou centro cultural",
    description: "Quatro mil metros de galpão percorridos antes da reabertura ao público.",
    embedId: "pKmSdY56VtY",
    featured: false,
    event: null,
    article: "a-fabrica-que-virou-centro-cultural",
    categories: ["bastidores"],
  },
  {
    slug: "os-chefs-antes-do-primeiro-prato",
    title: "Os chefs antes do primeiro prato",
    description: "As quatro horas de cozinha que antecederam a Noite da Gastronomia Regional.",
    embedId: "SkVqJ1SGeL0",
    featured: false,
    event: "noite-da-gastronomia-regional",
    categories: ["bastidores"],
  },
  {
    slug: "residencial-ipe-o-projeto-em-tres-minutos",
    title: "Residencial Ipê: o projeto em três minutos",
    description: "A apresentação do empreendimento que vendeu 31% das unidades na estreia.",
    embedId: "Z4C82eyhwgU",
    featured: false,
    event: "lancamento-do-residencial-ipe",
    property: "cobertura-duplex-com-terraco",
    categories: ["coberturas"],
  },
];

export type SeedProperty = {
  title: string;
  slug: string;
  type: "CASA" | "APARTAMENTO" | "TERRENO" | "COMERCIAL" | "RURAL";
  city: string;
  region: string;
  price?: number;
  priceOnRequest?: boolean;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  garageSpots?: number;
  cover: string;
  gallery: string[];
  featured: boolean;
  description: string;
};

export const properties: SeedProperty[] = [
  {
    title: "Casa térrea com pátio interno",
    slug: "casa-terrea-com-patio-interno",
    type: "CASA",
    city: "Toledo",
    region: "Jardim La Salle",
    price: 1290000,
    area: 210,
    bedrooms: 3,
    bathrooms: 4,
    garageSpots: 2,
    cover: photo("imovel-01"),
    gallery: ["imovel-11", "imovel-12"],
    featured: true,
    description:
      "<p>Projeto com pátio central, ventilação cruzada e marcenaria sob medida. Três suítes, escritório integrado e área gourmet voltada para o jardim.</p>",
  },
  {
    title: "Apartamento de esquina com vista livre",
    slug: "apartamento-de-esquina-com-vista-livre",
    type: "APARTAMENTO",
    city: "Toledo",
    region: "Centro",
    price: 780000,
    area: 118,
    bedrooms: 3,
    bathrooms: 2,
    garageSpots: 2,
    cover: photo("imovel-02"),
    gallery: ["imovel-13"],
    featured: true,
    description:
      "<p>Andar alto, duas faces de ventilação e varanda integrada à sala. Prédio com dois elevadores, salão de festas e portaria 24 horas.</p>",
  },
  {
    title: "Terreno em condomínio fechado",
    slug: "terreno-em-condominio-fechado",
    type: "TERRENO",
    city: "Marechal Cândido Rondon",
    region: "Zona norte",
    priceOnRequest: true,
    area: 480,
    cover: photo("imovel-03"),
    gallery: [],
    featured: false,
    description:
      "<p>Lote plano, pronto para construir, com infraestrutura completa e rede subterrânea. Condomínio com portaria, quadra e trilha.</p>",
  },
  {
    title: "Sobrado com fachada em tijolo aparente",
    slug: "sobrado-com-fachada-em-tijolo-aparente",
    type: "CASA",
    city: "Toledo",
    region: "Vila Industrial",
    price: 960000,
    area: 178,
    bedrooms: 3,
    bathrooms: 3,
    garageSpots: 2,
    cover: photo("imovel-04"),
    gallery: ["imovel-14", "imovel-15"],
    featured: true,
    description:
      "<p>Dois pavimentos com estar pé-direito duplo e escada em concreto aparente. Quintal com churrasqueira e espaço para piscina.</p>",
  },
  {
    title: "Cobertura duplex com terraço",
    slug: "cobertura-duplex-com-terraco",
    type: "APARTAMENTO",
    city: "Toledo",
    region: "Jardim Porto Alegre",
    price: 1650000,
    area: 243,
    bedrooms: 4,
    bathrooms: 4,
    garageSpots: 3,
    cover: photo("imovel-05"),
    gallery: ["imovel-16"],
    featured: false,
    description:
      "<p>Terraço de 60 m² com vista para o parque, cozinha em ilha e lareira no estar superior. Duas vagas cobertas e uma descoberta.</p>",
  },
  {
    title: "Apartamento compacto perto da universidade",
    slug: "apartamento-compacto-perto-da-universidade",
    type: "APARTAMENTO",
    city: "Toledo",
    region: "Vila Becker",
    price: 345000,
    area: 52,
    bedrooms: 2,
    bathrooms: 1,
    garageSpots: 1,
    cover: photo("imovel-06"),
    gallery: [],
    featured: false,
    description:
      "<p>Planta eficiente, mobiliado e a seis minutos a pé do campus. Boa opção de renda para locação estudantil.</p>",
  },
  {
    title: "Sala comercial no eixo da Avenida",
    slug: "sala-comercial-no-eixo-da-avenida",
    type: "COMERCIAL",
    city: "Toledo",
    region: "Centro",
    price: 520000,
    area: 74,
    bathrooms: 2,
    garageSpots: 2,
    cover: photo("imovel-07"),
    gallery: [],
    featured: false,
    description:
      "<p>Sala entregue com divisórias de vidro, copa e ar-condicionado instalado. Prédio com recepção compartilhada e sala de reunião.</p>",
  },
  {
    title: "Chácara com pomar formado",
    slug: "chacara-com-pomar-formado",
    type: "RURAL",
    city: "Ouro Verde do Oeste",
    region: "Linha São Luiz",
    price: 890000,
    area: 20000,
    bedrooms: 3,
    bathrooms: 2,
    garageSpots: 4,
    cover: photo("imovel-08"),
    gallery: ["imovel-11"],
    featured: false,
    description:
      "<p>Dois alqueires com pomar de vinte anos, poço artesiano e casa sede de 180 m². Vinte minutos do centro de Toledo por asfalto.</p>",
  },
  {
    title: "Casa em condomínio com piscina aquecida",
    slug: "casa-em-condominio-com-piscina-aquecida",
    type: "CASA",
    city: "Toledo",
    region: "Jardim Gisele",
    price: 1420000,
    area: 265,
    bedrooms: 4,
    bathrooms: 5,
    garageSpots: 4,
    cover: photo("imovel-09"),
    gallery: ["imovel-12", "imovel-16"],
    featured: false,
    description:
      "<p>Quatro suítes, home theater e piscina aquecida com deck em madeira. Automação de iluminação e climatização em todos os ambientes.</p>",
  },
  {
    title: "Terreno de esquina em área de expansão",
    slug: "terreno-de-esquina-em-area-de-expansao",
    type: "TERRENO",
    city: "Toledo",
    region: "Jardim Panorama",
    price: 410000,
    area: 612,
    cover: photo("imovel-10"),
    gallery: [],
    featured: false,
    description:
      "<p>Esquina com duas frentes, permitindo uso misto pelo zoneamento atual. Rua asfaltada e rede de esgoto já instalada.</p>",
  },
];

export type SeedIssue = {
  title: string;
  slug: string;
  description: string;
  cover: string;
  articles: string[];
};

export const issues: SeedIssue[] = [
  {
    title: "Edição 12 — Habitar o clima",
    slug: "edicao-12",
    description: "Cinco leituras sobre projetar para o calor, o vento e a sombra.",
    cover: photo("capa-01"),
    articles: [
      "a-casa-que-aprendeu-a-respirar",
      "telha-sombra-e-vento-o-vocabulario-do-calor",
      "cimento-queimado-saiu-de-moda",
      "tres-apartamentos-o-mesmo-andar-projetos-opostos",
      "casa-de-campo-a-vinte-minutos-do-centro",
    ],
  },
  {
    title: "Edição 11 — A cidade que se reocupa",
    slug: "edicao-11",
    description: "O centro, o calçadão e os prédios que voltaram a ter gente dentro.",
    cover: photo("capa-02"),
    articles: [
      "o-bairro-que-virou-destino-de-fim-de-semana",
      "a-fabrica-que-virou-centro-cultural",
      "a-biblioteca-que-abriu-no-antigo-cinema",
      "a-padaria-que-virou-ponto-de-encontro",
    ],
  },
  {
    title: "Edição 10 — Onde mora o dinheiro",
    slug: "edicao-10",
    description: "Mercado imobiliário, financiamento e a conta de quem compra agora.",
    cover: photo("capa-03"),
    articles: [
      "o-metro-quadrado-mudou-de-bairro",
      "o-que-muda-no-financiamento-em-2027",
      "comprar-na-planta-ainda-compensa",
    ],
  },
];
