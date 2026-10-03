# Spec D — Destaques, carrossel escolhido no painel e edições folheáveis

Data: 2026-10-02
Estado: aprovado

## Decisões

| Pergunta | Resposta |
|---|---|
| Onde os destaques aparecem | Na home (bloco de cada seção) e no topo da listagem de cada seção |
| Ordem dos destaques | O admin escolhe de 1 a 6; o 7º só entra quando sair um |
| O que entra no carrossel | Qualquer conteúdo: matéria, evento, imóvel, vídeo ou edição |
| Formato da edição folheável | Sequência de imagens de página, sem PDF |
| Edições de teste | As 3 que já existem (10, 11 e 12) ganham páginas e viram destaque |
| Migração no banco do site no ar | Autorizada; só acrescenta |

O botão "Assine" fica: está na especificação (seção 6.8) e na reunião de 03/09.

## 1. Destaques

`Article`, `Event`, `Property`, `Video` e `Issue` ganham `featuredRank Int?`:
`null` fora dos destaques, 1 a 6 dentro. A lógica da fila (entrar no fim,
sair e compactar, subir/descer, limite de 6) fica em `src/lib/featured.ts`,
pura e testada; as server actions só gravam o resultado.

Painel: cada lista ganha as abas **Todos** e **Destaques**. Em Todos, uma ★
por linha marca/desmarca. Em Destaques, os marcados em ordem, com ↑↓ e
Remover. Lista cheia: aviso para tirar um antes.

Site: ordenação `featuredRank asc nulls last` e depois a data, na home e nas
listagens (com ou sem filtro). Na home, o bloco de cada seção abre com os
destaques e completa com os mais recentes.

Os campos `featured` antigos de imóvel e vídeo são copiados para
`featuredRank` e deixam de ser lidos; saem numa migração futura, depois do
deploy (o site no ar ainda os lê).

## 2. Carrossel

Tabela nova `HeroSlide` (`position`, e uma chave para cada tipo:
`articleId`, `eventId`, `propertyId`, `videoId`, `issueId`, com exclusão em
cascata). Até 8 slides. A migração copia as matérias com `featured = true`
(o "Destacar no carrossel" de hoje), da mais recente para a mais antiga.

Painel: item **Carrossel** no menu. Lista os slides com miniatura, tipo, aviso
quando o conteúdo está em rascunho, ↑↓ e Remover. "Adicionar" busca por título
em todos os tipos.

Site: o `HeroCarousel` ganha setas ‹ › nas laterais e teclado; a troca
automática pausa com o mouse em cima ou com foco dentro. Cada tipo vira slide
com título, linha de apoio, imagem de capa, rótulo do tipo e link.

## 3. Edições

`MediaAsset` ganha `issueId` (as páginas da edição, em ordem). No painel, a
edição ganha o campo **Páginas da revista**, o mesmo componente da galeria.

- **Home:** faixa vermelha "Edições anteriores" (padrão DIFE) com carrossel de
  capas, setas redondas e botão vazado **VER TODAS AS EDIÇÕES**. Mostra todas
  as publicadas, destaques primeiro (com poucas edições, tirar a atual deixava
  a faixa quase vazia).
- **`/edicoes`:** grade de todas as capas. Entra no menu.
- **`/edicoes/[slug]`:** leitor folheável em fundo vermelho, com o título.
  Duas páginas no computador, uma no celular (biblioteca `page-flip`, MIT).
  Setas ‹ ›, clique na página, teclado e arrasto. Barra: contador `11/100`,
  miniaturas, zoom +/−, tela cheia, compartilhar e "…" (primeira página,
  última página, Modo Revista quando a edição tem matérias). Abaixo,
  "Compartilhe em". Edição sem páginas leva direto ao Modo Revista.

## Fora de escopo

PDF, armazenamento de arquivos grandes (vem com o Cloudflare da B7) e a
remoção das colunas `featured` antigas.

## Verificação

`npm test` (fila de destaques), lint, tipos e
build. No navegador: home (carrossel com setas, blocos, faixa de edições),
`/edicoes`, o leitor (todas as funções da barra, celular e computador) e as
listas do painel (★, aba Destaques, ↑↓, limite de 6).
