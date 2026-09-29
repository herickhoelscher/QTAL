# Spec B — Sete ajustes no portal

Data: 2026-09-28
Estado: aprovado, aguardando plano de implementação

Sete mudanças pedidas juntas, independentes entre si. Podem ser implementadas
em qualquer ordem e cada uma pode ir para produção sozinha. O item de idioma,
que veio no mesmo pedido, está em `2026-09-28-multi-idioma-design.md`.

Ordem sugerida: do mais isolado para o mais invasivo — 2, 5, 4, 6, 8, 3, 7.

---

## Item 2 — Crédito passa a ser só B7

**Hoje:** o rodapé e a página Sobre creditam "Herick Neumann para a agência
BSEC", e a marca BSEC ainda aparece no painel, no login e na documentação.

**Fica:** "Desenvolvido por B7". O nome pessoal sai e BSEC vira B7 em todos os
lugares.

| Arquivo | Linha | Hoje |
|---|---|---|
| `src/components/SiteFooter.tsx` | 100 | Desenvolvido por Herick Neumann para a agência BSEC. |
| `src/app/(site)/sobre/page.tsx` | 41 | Projeto desenvolvido por Herick Neumann para a agência BSEC. |
| `src/app/admin/(painel)/layout.tsx` | 32 | BSEC |
| `src/app/admin/page.tsx` | 23 | BSEC |
| `README.md` | 1 | Portal Institucional Multiconteúdo — BSEC |
| `docs/GUIA-DO-PAINEL.md` | 11 | …a marca da BSEC… |

**Suposição a confirmar:** o pedido falava da "parte sobre desenvolvido", mas
dizia "deixa apenas a B7 e não BSEC". Este spec troca as seis ocorrências. Se a
intenção era mexer só nas duas linhas de crédito, as quatro últimas saem.

---

## Item 5 — Ano na data do topo

`src/components/LiveClock.tsx` formata hoje `seg., 28/09 22:38`. Acrescentar
`year: "numeric"` ao `Intl.DateTimeFormat` para sair `seg., 28/09/2026 22:38`.

Uma linha. O `tabular-nums` que já está no span mantém a largura estável quando
os dígitos mudam.

---

## Item 4 — Redes sociais no header e no rodapé

**Hoje:** os ícones de Instagram, Facebook e YouTube existem na `UtilityBar`,
que é `hidden md:block` — some no celular. No rodapé, as redes aparecem como
pílulas de texto, sem título de seção.

**Fica:**

- **Header:** os ícones passam a aparecer também no celular. Como a
  `UtilityBar` inteira é escondida nessa largura, os ícones entram no menu
  aberto, junto do seletor de idioma do Spec A.
- **Rodapé:** a lista de pílulas de texto vira uma fileira de ícones sob o
  título **"Mídias sociais"**, acompanhando o padrão das outras duas colunas
  ("Navegação" e "Contato"), que já usam a classe `eyebrow` como cabeçalho.

Os caminhos SVG das três redes já existem em `src/components/UtilityBar.tsx`
(linhas 18–20). Extrair para `src/components/social-icons.tsx` e usar nos dois
lugares, em vez de duplicar.

As URLs continuam vindo de `ApiSettings` (`instagramUrl`, `facebookUrl`,
`youtubeUrl`); rede sem URL cadastrada continua não aparecendo.

---

## Item 6 — Botões de compartilhar como ícones

**Referência:** fileira de quadrados vazados em vermelho, com o título
"Compartilhe em".

**Hoje:** `src/components/ShareButtons.tsx` renderiza pílulas com texto
("Compartilhar", "WhatsApp", "Facebook", "LinkedIn").

**Fica:** o título "Compartilhe em" e seis quadrados vazados na cor da marca,
com ícone e sem texto:

1. Compartilhar (menu nativo do aparelho)
2. WhatsApp
3. Facebook
4. X / Twitter
5. LinkedIn
6. Copiar link

Cada botão tem `aria-label` — ícone sem texto precisa de nome acessível. O
estado "Link copiado" vira um aviso curto ao lado da fileira, não um texto
dentro do quadrado (o quadrado tem largura fixa).

A variante `tone="light"` continua existindo: a página de vídeo
(`src/app/(site)/videos/[slug]/page.tsx:107`) usa o componente sobre fundo
escuro.

Os quatro usos atuais não mudam de assinatura: matérias, eventos, imóveis e
vídeos continuam chamando `<ShareButtons title path />`.

---

## Item 8 — Categorias saem do menu e viram abas em Matérias

**Hoje:** as categorias aparecem como sub-itens de "Matérias" no menu
(`src/app/(site)/layout.tsx:18`) e também como uma fileira de links em
`/materias`, que levam para `/materias/categoria/<slug>`.

**Fica:**

- O menu perde os sub-itens: "Matérias" vira um item simples. O `NavItem` mantém
  o campo `children` (o tipo não muda), apenas deixa de ser preenchido.
- `/materias` ganha abas — "Todas" mais uma por categoria — com a aba ativa
  destacada.
- Clicar numa aba **filtra na hora, sem recarregar**. A página já carrega o
  acervo inteiro, então o filtro é local.
- A escolha vai para a URL como `?categoria=<slug>`, via
  `router.replace(..., { scroll: false })`. Assim o link é compartilhável e o
  botão Voltar funciona.
- Sem `?categoria`, mostra tudo.

As rotas `/materias/categoria/<slug>` **continuam existindo**, com
`generateStaticParams` e metadata próprios. Elas deixam de ser o caminho normal
de navegação, mas seguem valendo para o Google e para links já publicados.

O componente novo (`CategoryTabs`) é cliente; a página segue servidor e entrega
a lista já carregada.

---

## Item 3 — "Ver mais" nas seções da home

**Problema:** a home é longa demais para rolar.

**Hoje:** Últimas matérias traz 9 itens, Eventos 6, Vídeos 6, Imóveis 6 — todos
visíveis de uma vez.

**Fica:** cada seção mostra **3 itens** e um botão "Ver mais" ao final revela o
restante, que já veio carregado com a página. Sem nova requisição, sem salto de
rolagem. O botão some depois de expandir.

Escopo: **só a home.** As páginas de listagem (`/materias`, `/eventos`,
`/imoveis`, `/videos`) continuam mostrando tudo de uma vez.

Componente novo: `src/components/ExpandableSection.tsx`, cliente, recebendo os
cards já renderizados como `children` e um `visible` inicial. Precisa funcionar
dentro da `masonry-2` (`src/app/globals.css:100`), que é layout por colunas CSS
— o componente controla **quantos filhos renderiza**, não a altura de um
contêiner, senão as colunas quebram.

O `AdCard` da seção de matérias continua no fim da lista, visível depois de
expandir.

Quando a seção tem 3 itens ou menos, o botão não aparece.

O link "Ver todos" que já existe no cabeçalho de cada seção continua — leva à
listagem completa e não se confunde com "Ver mais", que expande ali mesmo.

---

## Item 7 — Galeria com foto de destaque

**Referência:** Revista DIFE — uma foto grande abrindo e as demais em grade de
três colunas.

**Hoje:** as três galerias do site usam a mesma grade uniforme:

| Página | Linha |
|---|---|
| `src/app/(site)/materias/[slug]/page.tsx` | 137 |
| `src/app/(site)/eventos/[slug]/page.tsx` | 130 |
| `src/app/(site)/imoveis/[slug]/page.tsx` | 122 |

**Fica:** a foto marcada como destaque abre em largura total do bloco (proporção
16/10) e as demais seguem em grade de 3 colunas (4/3), preservando a ordem. No
celular tudo vira uma coluna e a foto de destaque continua maior.

**Quem escolhe:** a redação, marcando a foto com ★ no painel. Se ninguém marcar,
a primeira da ordem é usada. Um destaque por álbum — marcar outra desmarca a
anterior.

**Banco:** `MediaAsset` ganha `featured Boolean @default(false)`.

**Painel:** `src/components/admin/GalleryField.tsx` ganha um botão ★ por foto,
ao lado de "mover" e "remover". O campo entra em `GalleryItem` e viaja no mesmo
JSON escondido que já existe.

**Site:** componente novo `src/components/PhotoGallery.tsx`, usado pelas três
páginas, que hoje repetem a mesma grade em três lugares. Nos eventos ele é
aplicado por álbum: cada bloco/álbum tem seu próprio destaque.

---

## Verificação

Sem framework de teste neste spec — são mudanças visuais, e o Vitest que o
Spec A introduz cobre lógica pura, não layout. A verificação é roteiro manual,
detalhado no plano de implementação:

- `npm run lint` e `npm run build` limpos.
- Home: cada seção abre com 3 itens; "Ver mais" revela o resto sem pular a
  rolagem; seção com 3 itens ou menos não mostra o botão.
- Matérias: abas filtram, `?categoria=` aparece na URL, Voltar funciona,
  `/materias/categoria/<slug>` continua abrindo.
- Galeria: foto marcada abre grande nas três páginas; sem marcação, a primeira;
  em evento com dois álbuns, cada um tem o seu destaque.
- Compartilhar: os seis ícones abrem o destino certo, o link copiado avisa, e
  os ícones aparecem corretamente sobre o fundo escuro da página de vídeo.
- Celular: redes sociais acessíveis no menu; nenhuma fileira estourando a
  largura.
- Nenhuma ocorrência de "BSEC" ou "Herick" sobrando no repositório.
