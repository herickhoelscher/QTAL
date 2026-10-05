# Guia do painel

Este guia é para quem cuida do site no dia a dia. Você não precisa saber programar para usar
nada do que está aqui.

## Entrar

Acesse `seusite.com.br/admin`, informe e-mail e senha. A sessão dura 8 horas; depois disso o
painel pede a senha de novo. Marque **Lembrar de mim** para continuar conectado por 30 dias
(só em computador de uso pessoal).

A barra escura do topo traz a marca da B7, o seu nome e o botão **Sair**. O menu fica à
esquerda, com a sua logo no alto, o link **Ver o site** e, no pé, a chave **Tema escuro**. No
celular, o menu abre pelo botão ☰.

## Listas

Toda seção abre com a lista do que já foi cadastrado:

- **Buscar por nome** encontra pelo título.
- Clique no título de uma coluna com ⇅ (como **Atualizado**) para ordenar por ela; clique de
  novo para inverter.
- Cada linha tem **Ver** (ficha completa, com o botão para abrir no site), **Editar** e
  **Excluir**. Excluir sempre pede confirmação.
- Mais de 20 itens viram páginas numeradas no rodapé da lista.

## O que existe em cada seção

| Seção | Para que serve |
| --- | --- |
| Painel | Totais do site, atalhos para criar conteúdo e quanto cada matéria foi vista |
| Carrossel | Os slides do topo da página inicial, de qualquer seção |
| Matérias | Reportagens e colunas |
| Eventos | Cobertura fotográfica e agenda |
| Imóveis | Vitrine de casas, apartamentos, terrenos e salas comerciais |
| Vídeos | Links de vídeos do YouTube e do Instagram |
| Edições | A revista folheável e o Modo Revista |
| Categorias | Os assuntos que organizam e filtram o conteúdo |
| Configurações | Chaves de API, CUB, WhatsApp, redes sociais e Google Tag Manager |
| Usuários | Quem pode entrar no painel |

## Rascunho e publicado

Todo conteúdo tem um campo **Status**:

- **Rascunho** — fica salvo no painel e não aparece no site.
- **Publicado** — aparece no site na hora.

Use rascunho para deixar a matéria pronta e publicar no momento certo.

## Publicar uma matéria

1. **Matérias → Nova matéria**.
2. Escreva o **título**. O endereço da página é gerado sozinho a partir dele — só preencha o
   campo *Endereço da página* se quiser um endereço diferente.
3. Escreva o texto no editor. Selecione o trecho e use os botões acima dele para negrito,
   itálico, títulos de seção, listas, citação e link.
4. Envie a **imagem de capa**. Cada campo de envio mostra, acima do botão, o formato e o
   tamanho ideais — siga essa indicação e a imagem sai nítida em qualquer tela.
5. Preencha a **descrição da capa**: é o texto que descreve a foto para quem usa leitor de
   tela.
6. Marque as **categorias** e escolha **estado, cidade e bairro** (veja
   [Estado, cidade e bairro](#estado-cidade-e-bairro)).
7. Em **SEO**, você pode escrever um título e uma descrição próprios para o Google. Deixando
   em branco, o site usa o título e a linha de apoio da matéria.
8. Mude o status para **Publicado** e clique em **Salvar matéria**.

Marcar **Destacar no carrossel da home** coloca a matéria no topo da página inicial.

## Cadastrar um evento

Em **Eventos → Novo evento**, preencha título, data, local, estado, cidade e bairro, e envie
as fotos na **galeria**. Você pode selecionar várias fotos de uma vez.

O campo **Bloco / álbum** de cada foto separa a galeria por momento — por exemplo, *Chegada*,
*Show*, *Encerramento*. Fotos sem bloco aparecem juntas no começo.

## Vídeos (e o vídeo do evento)

Vídeo nunca é enviado para o site: ele fica no YouTube ou no Instagram e o site só aponta
para lá. Isso mantém o carregamento rápido.

Em **Vídeos → Novo vídeo**, cole o endereço completo do vídeo. O site reconhece os formatos
`youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…` e `instagram.com/reel/…`.

Se o vídeo é de um evento, escolha o evento em **Evento relacionado**. Ele passa a aparecer
nos dois lugares — na página do evento e na listagem geral de Vídeos — **sem precisar
cadastrar duas vezes**.

## Imóveis

Em **Imóveis → Novo imóvel**, preencha a ficha (tipo, estado, cidade, bairro, metragem,
quartos, banheiros, vagas) e o valor. A cidade é obrigatória no imóvel. Marcando **Valor sob consulta**, o site mostra "Sob consulta" no lugar do
preço.

O botão de contato do imóvel abre o WhatsApp já com o nome do imóvel na mensagem.

## Estado, cidade e bairro

Matérias, eventos e imóveis têm três listas, uma depois da outra:

1. **Estado:** os 27 estados. Conteúdo novo já abre em Paraná.
2. **Cidade:** ao escolher o estado, aparecem todas as cidades dele, com o nome oficial do
   IBGE. Se a lista não carregar, o campo vira texto para você digitar a cidade.
3. **Bairro:** ao escolher a cidade, aparecem os bairros já usados nela (em matérias, eventos
   e imóveis). Se o bairro não estiver na lista, escolha **Outro bairro…** e digite. Na
   próxima vez, ele já aparece na lista.

Não precisa se preocupar com maiúsculas: digitar "centro" numa cidade que já tem "Centro"
grava "Centro", sem criar um bairro repetido.

No site, a página de **Eventos** filtra por cidade, e a de **Imóveis** filtra por cidade e
bairro. No painel inicial, o filtro das matérias é por cidade.

## Destaques

Matérias, eventos, imóveis, vídeos e edições têm até **6 destaques** cada. Eles abrem o bloco
da seção na página inicial e aparecem primeiro na página da seção no site, na ordem que você
escolher.

- Na lista da seção, aba **Todos**, clique na ☆ da linha para destacar. A estrela fica
  amarela com o número da posição. Clique de novo para tirar.
- A aba **Destaques** mostra a fila em ordem: use ↑ e ↓ para reordenar e **Remover** para
  abrir lugar.
- No formulário, a caixa **Destaque** faz o mesmo e coloca o item no fim da fila.
- Com os 6 lugares ocupados, o painel avisa: tire um antes de marcar outro.

## Carrossel da página inicial

Em **Carrossel**, a lista mostra os slides do topo da página inicial, na ordem em que passam
(até 8). Busque pelo título em **Adicionar ao carrossel** para incluir matéria, evento, imóvel,
vídeo ou edição. Use ↑ e ↓ para reordenar. Conteúdo em rascunho fica na lista com o aviso
"não aparece no site". Com o carrossel vazio, a página inicial mostra as 3 matérias mais
recentes.

No site, o visitante troca de slide pelas setas ‹ › ou pelo teclado. A troca automática
espera enquanto o mouse está em cima.

## Edições: revista folheável e Modo Revista

Uma **edição** pode ter as duas coisas:

- **Páginas da revista** — as imagens de cada página, em ordem (JPG ou WEBP, 1200×1600px).
  No site, clicar na capa abre a revista para folhear: duas páginas no computador, uma no
  celular, com miniaturas, zoom, tela cheia e compartilhar.
- **Sequência de leitura** — matérias do site lidas em tela cheia (Modo Revista).

Sem páginas, a capa leva direto ao Modo Revista. As edições publicadas aparecem na faixa
vermelha **Edições anteriores** da página inicial e na página **Edições** do menu.

### Capa

Na seção **Capa** do formulário, envie a **foto sem textos** e digite o **título** e o
**subtítulo**. O site escreve por cima, como numa capa de revista:

- no topo, o nome do site (em **Configurações**) ou o logo, se houver;
- embaixo, o título em letras grandes e o subtítulo.

A prévia ao lado mostra a capa enquanto você digita. Com título preenchido, a capa entra como
**primeira página** da revista; envie em **Páginas da revista** só o miolo. Como o texto é
escrito pelo site, ele fica nítido no zoom e sai traduzido em inglês e espanhol.

Se a capa já vem pronta do designer, com os textos na imagem, deixe o título em branco: a foto
aparece exatamente como foi enviada.

Em **Edições → Nova Edição**, dê um nome à edição e escolha as matérias na
coluna da esquerda. A ordem da coluna da direita é a ordem em que as pessoas vão ler — use as
setas ↑ e ↓ para reorganizar.

Publicando a edição, a chamada aparece na página inicial.

## Idiomas (português, inglês e espanhol)

As três bandeiras no topo do site trocam o idioma da página que a pessoa está lendo. No
celular, elas ficam dentro do menu.

- **Menus, botões e títulos das seções** já saem traduzidos, sem precisar fazer nada.
- **Matérias, eventos, imóveis, vídeos, edições e categorias** são traduzidos
  automaticamente no momento em que você publica — não é preciso fazer nada. Ao editar algo
  já publicado, só o trecho que mudou é traduzido de novo.

A tradução automática funciona de dois jeitos:

- **Sem configurar nada**, o site usa um serviço gratuito que dá conta de cerca de 10
  matérias por dia. A qualidade é boa para leitura, mas às vezes traduz ao pé da letra.
- **Com a chave do DeepL**, a tradução fica mais natural e a cota sobe para 500 mil caracteres
  por mês. Crie uma conta gratuita em **deepl.com/pro-api** e cole a chave em
  **Configurações → Idiomas → Chave da API do DeepL**.

Se a cota do dia acabar, o conteúdo novo aparece em português até a próxima tradução. Nesse
caso, clique em **Traduzir acervo** (em Configurações) no dia seguinte para completar. O site
nunca sai do ar por causa da tradução.

## Barra de clima, dólar e CUB

A faixa no topo do site é automática:

- **Clima e dólar** se atualizam sozinhos. Não há chave nem senha para renovar: as duas
  fontes são abertas. Se a cidade mudar, troque o campo **Cidade do clima** em
  **Configurações**.
- **CUB** é o único valor manual. O índice é publicado uma vez por mês pelo Sinduscon e não
  existe uma fonte automática confiável para ele. Quando sair o número novo, vá em
  **Configurações**, atualize o **Valor do CUB** e o **Mês de referência**.
- Se o campo do CUB ficar vazio, a faixa não fica em branco: ela passa a mostrar o **custo
  médio do m² do IBGE (SINAPI)**, que se atualiza sozinho, identificado como
  *Custo m² · SINAPI/IBGE*. É outro cálculo, não é o CUB — por isso aparece com outro nome.
  Assim que você preencher o CUB, ele volta a ter prioridade.

Se alguma fonte automática ficar fora do ar, o site continua mostrando o último valor que
recebeu. A faixa nunca quebra e nunca exibe mensagem de erro para o leitor.

## Botão "Anuncie" (Entre em contato)

O botão **Anuncie** do topo, o bloco "Tem vontade de aparecer no nosso site?" da página
inicial e a página **Anuncie** levam ao WhatsApp da equipe, para quem quer aparecer no portal.

Em **Configurações**, o campo **WhatsApp comercial** define para qual número o botão leva, e
a **mensagem pré-preenchida** define o texto que já vem escrito para a pessoa enviar.

O número vai com código do país e DDD, só números: `5545999998888`.

## Usuários

Há dois papéis:

- **Editor** — publica matérias, eventos, imóveis, vídeos e edições.
- **Administrador** — faz tudo isso e também altera configurações e usuários.

Para cadastrar, use **+ Novo Usuário**. A senha precisa ser digitada duas vezes (o olho ao
lado do campo mostra o que foi digitado). Ao editar, deixe a senha em branco para mantê-la.

Quando alguém sai da equipe, desmarque **Acesso liberado** em vez de excluir: o conteúdo
publicado por essa pessoa continua com a autoria correta.

## Dúvidas frequentes

**Enviei a foto e ela ficou cortada.** Use a proporção indicada no campo. As capas são
cortadas no centro para caber em 16:9.

**Publiquei e não apareceu no site.** Confira se o status está em *Publicado* e recarregue a
página. As listagens se atualizam em até cinco minutos.

**Posso apagar uma categoria em uso?** Pode. Os conteúdos continuam publicados, apenas sem
aquela categoria.

**Esqueci a senha.** Um administrador cadastra uma nova em **Usuários → Editar**.
