# Spec A — Site em três idiomas (português, inglês, espanhol)

Data: 2026-09-28
Estado: aprovado, aguardando plano de implementação

## Problema

O portal é publicado só em português. A direção quer atender leitores dos
Estados Unidos e da Argentina: três bandeiras no topo, e clicar numa delas
passa o site inteiro para aquele idioma — incluindo as matérias, não só os
menus.

## Decisões tomadas

| Pergunta | Resposta |
|---|---|
| O que é traduzido | Interface à mão + conteúdo do banco via API |
| Provedor | DeepL, faixa grátis (500 mil caracteres/mês) |
| Endereço | Prefixo na URL: `/materias`, `/en/materias`, `/es/materias` |
| Momento da tradução | Ao publicar, dentro da server action do painel |
| Testes | Vitest nas funções puras (o projeto não tinha nenhum teste) |
| Mover páginas para `[lang]` | Aprovado |

## Arquitetura

### 1. Roteamento

As páginas públicas saem de `src/app/(site)/` e passam a viver em
`src/app/[lang]/(site)/`. O mesmo vale para `src/app/modo-revista/` e
`src/app/videos/feed/`. O painel (`src/app/admin/`) **não** entra no `[lang]`:
o administrativo continua só em português.

O português não tem prefixo visível. Quem faz isso é `src/proxy.ts`, que hoje
só protege `/admin` e ganha uma segunda responsabilidade: quando o caminho não
começa com `/en` nem `/es`, e não é `/admin`, `/api` nem arquivo estático, ele
reescreve internamente para `/pt<caminho>`.

```
/materias        → (rewrite) → /pt/materias      → src/app/[lang]/(site)/materias
/en/materias     →  direto   → /en/materias      → src/app/[lang]/(site)/materias
/es/materias     →  direto   → /es/materias      → src/app/[lang]/(site)/materias
```

O `matcher` do proxy precisa abrir para todas as rotas, com exclusão explícita
de `_next`, `api`, `favicon` e arquivos com extensão. A lógica de sessão do
admin continua exatamente como está, só passa a conviver com a regra nova no
mesmo arquivo.

### 2. Links internos

Mover as páginas para dentro de `[lang]` cria um problema silencioso: um
`<Link href="/materias">` numa página em inglês devolve o leitor ao português.

Solução: `src/components/LocalizedLink.tsx`, um wrapper de `next/link` que lê o
idioma de um contexto React criado pelo layout `src/app/[lang]/layout.tsx` e
prefixa o `href` sozinho (`/materias` vira `/en/materias` quando o idioma é
inglês, e continua `/materias` em português). Nos arquivos sob `(site)`, trocar
o import `from "next/link"` por `from "@/components/LocalizedLink"`.

Regra: hrefs externos (`http…`, `mailto:`, `tel:`) e âncoras passam sem
prefixo.

### 3. Dicionário da interface

```
src/lib/i18n/
  locales.ts          LOCALES, DEFAULT_LOCALE, type Locale, isLocale(), localePath()
  dictionaries/pt.ts  fonte da verdade
  dictionaries/en.ts
  dictionaries/es.ts
  get-dictionary.ts   getDictionary(locale): Dictionary
```

O português é a fonte da verdade e o inglês e o espanhol são tipados contra
ele:

```ts
export type Dictionary = typeof pt;
export const en: Dictionary = { … };
```

Se `en.ts` esquecer uma chave, **o build quebra**. É essa checagem que impede o
site de ir ao ar metade traduzido.

Entram no dicionário todos os textos fixos: navegação, rótulos da barra de
dados (Clima, Dólar, CUB), títulos e descrições das seções da home, "Ver mais",
"Compartilhe em", "Assine", rodapé, estados vazios e mensagens de erro.

### 4. Tradução do conteúdo

#### Modelo novo

```prisma
model Translation {
  id         String   @id @default(cuid())
  locale     String   // "en" | "es"
  model      String   // "article" | "event" | "property" | "video" | "issue"
  recordId   String
  field      String   // "title" | "subtitle" | "body" | "description" | …
  value      String
  /// SHA-256 do texto original no momento da tradução.
  sourceHash String
  updatedAt  DateTime @updatedAt

  @@unique([locale, model, recordId, field])
  @@index([model, recordId])
}
```

O `sourceHash` é o que permite corrigir uma matéria já publicada: se o texto de
origem mudou, o hash muda e aquele campo é retraduzido; se não mudou, não gasta
cota. Sem ele, ou a redação editaria e a tradução ficaria velha para sempre, ou
todo salvamento retraduziria o acervo.

#### Campo da chave

`ApiSettings` ganha `deeplApiKey String?`, ao lado do `weatherApiKey` que já
existe. Fica no painel, em Configurações, para o cliente colar sozinho sem
mexer em variável de ambiente.

#### Tradutor

```
src/lib/i18n/translator/
  index.ts     interface Translator + seleção do provedor
  deepl.ts     implementação DeepL (api-free.deepl.com/v2/translate)
  null.ts      devolve o texto de entrada; usado quando não há chave
```

```ts
export interface Translator {
  translate(texts: string[], target: Exclude<Locale, "pt">): Promise<string[]>;
}
```

Detalhes que importam na implementação do DeepL:

- O corpo das matérias é HTML vindo do `RichTextEditor`. A chamada precisa de
  `tag_handling: "html"`, senão o DeepL devolve o texto com as tags destruídas.
- `source_lang: "PT"`, `target_lang: "EN-US"` e `"ES"`.
- Os textos vão em lote (a API aceita várias entradas por requisição), não um
  por vez.
- Trocar de provedor depois é escrever um arquivo irmão de `deepl.ts`.

#### Gravação

`src/lib/i18n/content.ts`:

- `translateRecord(model, id, fields)` — chamada nas server actions de
  `src/app/admin/actions/content.ts` depois de salvar com status `PUBLISHED`.
  Compara hash, traduz só o que mudou, grava em `Translation`.
- `withTranslations(locale, model, records, fields)` — usada na leitura das
  páginas públicas. Busca as traduções em uma consulta e sobrepõe os campos.

#### Leitura e fallback

Quando falta tradução para um campo, a página mostra o **português**. Isso vale
para: chave não configurada, cota estourada, DeepL fora do ar, conteúdo
publicado antes de a tradução existir e campo novo ainda não traduzido.

**Nenhuma falha de tradução pode derrubar uma página.** Erro do DeepL é
capturado, registrado no log do servidor e descartado; o salvamento no painel
conclui normalmente e o leitor vê o texto original.

#### Backfill

Botão "Traduzir acervo" em Configurações. Uma server action percorre o conteúdo
publicado sem tradução e preenche. Processa em lotes com um teto por execução,
para não estourar a cota nem o tempo da requisição, e informa quanto falta.

### 5. Seletor de idioma

`src/components/LocaleSwitcher.tsx`, com as três bandeiras como SVG inline —
bandeira como imagem externa numa barra fixa custa requisição à toa e pisca no
carregamento.

- Desktop: dentro da `UtilityBar`, à direita, junto de telefone e Assine.
- Celular: dentro do menu aberto, onde a `UtilityBar` fica escondida.

Clicar troca o prefixo da rota atual mantendo o resto do caminho: quem está em
`/materias/reforma-do-centro` vai para `/en/materias/reforma-do-centro`.

### 6. SEO

- `<html lang>` passa a refletir o idioma (`pt-BR`, `en-US`, `es-AR`).
- `generateMetadata` de cada página ganha `alternates.languages` com as três
  versões (hreflang).
- `openGraph.locale` por idioma.
- `src/app/sitemap.ts` lista as três versões de cada URL.

## Testes

O projeto não tinha nenhum teste. Entra **Vitest** como dependência de
desenvolvimento, cobrindo só funções puras — sem componente, sem banco, sem
rede:

1. `isLocale()` aceita pt/en/es e recusa o resto.
2. `localePath()` não prefixa português e prefixa en/es.
3. `localePath()` deixa passar href externo, `mailto:`, `tel:` e âncora.
4. Paridade dos dicionários: as chaves de `en` e `es` são exatamente as de `pt`.
5. O hash muda quando o texto de origem muda e não muda quando não muda.
6. `withTranslations()` cai no português quando falta a tradução do campo.

Script novo: `"test": "vitest run"`.

O que não dá para cobrir em teste puro (rewrite do proxy, chamada real ao
DeepL, troca de bandeira) fica no roteiro de verificação manual do plano de
implementação.

## Riscos

| Risco | Mitigação |
|---|---|
| Mover tudo para `[lang]` toca ~15 arquivos de uma vez | Mover primeiro, sem mudar comportamento, e conferir que o site em português continua idêntico antes de acrescentar idioma |
| Um `Link` esquecido joga o leitor de volta ao português | Regra de lint ou varredura por `from "next/link"` dentro de `(site)` ao final |
| Cota do DeepL estoura em um backfill grande | Teto por execução e fallback para português |
| `tag_handling` errado corrompe o HTML das matérias | Verificar numa matéria com lista, negrito e link antes de liberar o backfill |

## Fora de escopo

- Tradução do painel administrativo (segue em português).
- Revisão humana das traduções.
- Tradução dos nomes de categorias cadastrados pela redação (ficam em
  português nas três versões nesta etapa).
