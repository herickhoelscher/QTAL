# Guia do painel

Este guia é para quem cuida do site no dia a dia. Você não precisa saber programar para usar
nada do que está aqui.

## Entrar

Acesse `seusite.com.br/admin`, informe e-mail e senha. A sessão dura 8 horas; depois disso o
painel pede a senha de novo.

No topo de todas as telas ficam a sua logo e a marca da BSEC, o link **Ver o site** e o
botão **Sair**.

## O que existe em cada seção

| Seção | Para que serve |
| --- | --- |
| Dashboard | Quanto cada matéria foi vista, com filtros por status e por região |
| Matérias | Reportagens e colunas |
| Eventos | Cobertura fotográfica e agenda |
| Imóveis | Vitrine de casas, apartamentos, terrenos e salas comerciais |
| Vídeos | Links de vídeos do YouTube e do Instagram |
| Edições (Modo Revista) | Sequências de matérias folheadas em tela cheia |
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
6. Marque as **categorias** e a **região**.
7. Em **SEO**, você pode escrever um título e uma descrição próprios para o Google. Deixando
   em branco, o site usa o título e a linha de apoio da matéria.
8. Mude o status para **Publicado** e clique em **Salvar matéria**.

Marcar **Destacar no carrossel da home** coloca a matéria no topo da página inicial.

## Cadastrar um evento

Em **Eventos → Novo evento**, preencha título, data, local e região, e envie as fotos na
**galeria**. Você pode selecionar várias fotos de uma vez.

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

Em **Imóveis → Novo imóvel**, preencha a ficha (tipo, cidade, metragem, quartos, banheiros,
vagas) e o valor. Marcando **Valor sob consulta**, o site mostra "Sob consulta" no lugar do
preço.

O botão de contato do imóvel abre o WhatsApp já com o nome do imóvel na mensagem.

## Modo Revista

Uma **edição** é uma sequência de matérias lida em tela cheia, como quem folheia uma revista.

Em **Edições (Modo Revista) → Nova edição**, dê um nome à edição e escolha as matérias na
coluna da esquerda. A ordem da coluna da direita é a ordem em que as pessoas vão ler — use as
setas ↑ e ↓ para reorganizar.

Publicando a edição, a chamada aparece na página inicial.

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

## Botão "Assine agora"

Em **Configurações**, o campo **WhatsApp comercial** define para qual número o botão leva, e
a **mensagem pré-preenchida** define o texto que já vem escrito para a pessoa enviar.

O número vai com código do país e DDD, só números: `5545999998888`.

## Usuários

Há dois papéis:

- **Editor de conteúdo** — publica matérias, eventos, imóveis, vídeos e edições.
- **Administrador geral** — faz tudo isso e também altera configurações e usuários.

Quando alguém sai da equipe, desmarque **Acesso liberado** em vez de excluir: o conteúdo
publicado por essa pessoa continua com a autoria correta.

## Dúvidas frequentes

**Enviei a foto e ela ficou cortada.** Use a proporção indicada no campo. As capas são
cortadas no centro para caber em 16:9.

**Publiquei e não apareceu no site.** Confira se o status está em *Publicado* e recarregue a
página. As listagens se atualizam em até cinco minutos.

**Posso apagar uma categoria em uso?** Pode. Os conteúdos continuam publicados, apenas sem
aquela categoria.

**Esqueci a senha.** Um administrador geral cadastra uma nova em **Usuários → Editar**.
