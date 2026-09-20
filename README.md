# Portal Institucional Multiconteúdo — BSEC

Portal com identidade de revista digital e quatro frentes de conteúdo (Matérias, Eventos,
Imóveis e Vídeos), painel administrativo próprio e barra de dados automáticos (clima, dólar
e CUB). Construído a partir da especificação `Prompt-Projeto-Portal-Institucional.pdf`.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 com tokens de design em `src/app/globals.css` |
| Animação | Framer Motion (Modo Revista, herói, menu overlay) |
| Banco | PostgreSQL + Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Autenticação | JWT próprio (`jose`) em cookie httpOnly |
| Mídia | Cloudflare Images quando configurado; `public/uploads` como fallback |

## Como rodar

```bash
npm install
cp .env.example .env          # ajuste DATABASE_URL e AUTH_SECRET
npx prisma migrate dev        # cria o schema
npx prisma db seed            # conteúdo de demonstração
npm run dev
```

O site sobe em `http://localhost:3000` e o painel em `http://localhost:3000/admin`.

O seed cria dois acessos de desenvolvimento:

| E-mail | Papel |
| --- | --- |
| admin@portal.local | Administrador geral |
| redacao@portal.local | Editor de conteúdo |

A senha dos dois está em `prisma/seed.ts` e vale **apenas para o banco local**.

> Em qualquer ambiente publicado, troque as duas em `/admin/usuarios` logo após
> o primeiro acesso. Senha de seed em repositório público é senha conhecida:
> quem lê o código entra no painel.

## Estrutura

```
prisma/schema.prisma          Modelo de dados (seção 07 da especificação)
prisma.config.ts              Configuração do Prisma 7 (datasource + seed)
src/app/(site)/               Site público: home, matérias, eventos, imóveis, vídeos
src/app/modo-revista/         Leitura sequencial em tela cheia
src/app/admin/                Login + painel (grupo de rotas `(painel)`)
src/app/admin/actions/        Server actions: auth, conteúdo, configurações
src/app/api/                  Upload autenticado e contador de visualizações
src/components/               Componentes do site público
src/components/admin/         Formulários e controles do painel
src/lib/                      Prisma, sessão, formatação, fontes de dados, upload
src/proxy.ts                  Guarda de rota das páginas /admin/*
```

## Integrações de dados

Nenhuma das três exige chave, cadastro ou cartão — não há nada para o cliente renovar.

- **Clima** — Open-Meteo (`api.open-meteo.com`), gratuita e sem chave, revalidada a cada
  30 minutos. A cidade é configurada em `/admin/configuracoes`; a localização sai da
  geocodificação do próprio Open-Meteo, ou das coordenadas informadas no painel.
- **Dólar** — AwesomeAPI (`economia.awesomeapi.com.br`), gratuita e sem chave, revalidada
  a cada 15 minutos.
- **CUB** — entrada manual assistida, com rede de segurança automática. Não existe API
  pública, gratuita e estável para o Custo Unitário Básico: o índice é apurado mensalmente
  pelos Sinduscons estaduais e publicado em PDF. O valor vem de `ApiSettings.cubValue`,
  editável no painel. **Se esse campo estiver vazio**, a barra passa a exibir o custo médio
  do m² do SINAPI pela API do IBGE (SIDRA, tabela 2296), rotulado como `Custo m² · SINAPI/IBGE`
  — metodologia diferente do CUB, por isso nunca aparece com o nome dele.

Se qualquer fonte falhar, a barra exibe o último valor em cache e, na falta dele, `--`.
Nenhum erro técnico aparece para o leitor.

## Mídia e upload

O conteúdo de demonstração criado por `npx prisma db seed` usa as fotos versionadas em
`public/exemplos/` (acervo Unsplash via Lorem Picsum, uso livre) e seis filmes abertos da
Blender Foundation no YouTube, licença CC-BY. São material de exemplo: apague a pasta e
troque os vídeos assim que o conteúdo real do cliente entrar.

`src/lib/upload.ts` valida tipo e tamanho no servidor e grava:

- no **Cloudflare Images**, quando `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_IMAGES_TOKEN`
  estiverem definidos;
- em `public/uploads`, caso contrário.

Vídeo nunca é hospedado: o painel cadastra apenas o link do YouTube ou do Instagram, e o
player entra em um iframe carregado só no clique.

## Autenticação

Sessão em JWT assinado com `AUTH_SECRET`, guardada em cookie httpOnly de 8 horas. A
proteção tem duas camadas: `src/proxy.ts` redireciona rotas `/admin/*` sem cookie válido, e
o layout do painel e cada server action revalidam a sessão no servidor antes de qualquer
leitura ou escrita.

## Deploy

1. **Banco** — Neon ou Supabase; aponte `DATABASE_URL` para o Postgres gerenciado e rode
   `npx prisma migrate deploy`.
2. **Vercel** — importe o repositório e configure as variáveis do `.env.example`. Gere o
   `AUTH_SECRET` com `openssl rand -base64 32`.
3. **Cloudflare** — DNS e CDN à frente da Vercel; crie o token do Cloudflare Images e
   preencha `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_IMAGES_TOKEN`. Com isso, os uploads
   deixam de usar o disco local.
4. **Medição** — cadastre o contêiner do Google Tag Manager em `/admin/configuracoes`. Sem
   ID preenchido, nenhuma tag é carregada.

## Scripts

```bash
npm run dev       # desenvolvimento
npm run build     # build de produção
npm run start     # sobe o build
npm run lint      # ESLint
npx tsc --noEmit  # verificação de tipos
```

## O que ficou fora do MVP

Definido assim na própria especificação (seções 6.8 e 13):

- Fluxo de assinatura com planos e pagamento — hoje o CTA abre o WhatsApp comercial. A
  entidade `Subscriber` já existe no schema para essa evolução.
- Automação do CUB por scraping do Sinduscon-PR.
- Identidade visual definitiva: a paleta em `globals.css` é o placeholder da seção 4 da
  especificação. Trocar os seis valores do bloco `@theme` aplica a marca real em todo o site.
- Página de colunistas (`/colunistas`), marcada como opcional/futura no sitemap.

## Guia para o cliente

`docs/GUIA-DO-PAINEL.md` explica o painel para quem vai operar o site no dia a dia.
