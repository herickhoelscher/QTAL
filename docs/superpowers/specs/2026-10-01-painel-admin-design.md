# Spec C — Painel administrativo no visual pedido pelo cliente

Data: 2026-10-01
Estado: aprovado

O cliente mandou capturas de outro painel (Mundial FM, feito pela B7) e quer o
nosso com o mesmo desenho. Copia-se o visual; os campos, as seções e as regras
continuam os deste projeto.

## Decisões

| Pergunta | Resposta |
|---|---|
| Tabela de visualizações do dashboard | Fica, abaixo dos cards e das ações rápidas |
| Marca no topo | Só o texto "B7 MÍDIA", sem ícone |
| Tema escuro | Só no painel, salvo no navegador |
| Categorias e Usuários | Saem do gerenciador na própria lista e ganham Ver / Editar / Novo |
| Campos da categoria | Nome e Tipo (os do projeto), sem Descrição nem Sede |
| Rótulo do login | "E-mail" (não existe nome de usuário aqui) |
| Lembrar de mim | Desmarcado: 8 horas, como hoje. Marcado: 30 dias |

## Como se troca o visual

O painel tem layout raiz próprio (`src/app/admin/layout.tsx`). Ele ganha a
classe `admin-theme` no `<html>`, e essa classe redefine os tokens de cor do
Tailwind (`--color-ink`, `--color-brand`, `--color-surface`…) com a paleta da
referência: azul-marinho quase preto, cinzas-azulados, links azuis. Assim todo
componente do painel que já usa `bg-surface`, `text-muted` etc. muda de cor sem
ser reescrito, e o site público não é tocado.

O tema escuro é `admin-theme[data-theme="dark"]`, que redefine os mesmos
tokens. Um script inline no `<head>` aplica a escolha salva antes da pintura,
para não piscar branco.

Fonte do painel: Nunito Sans (a da referência), carregada só no layout do
painel.

## Telas

**Login.** Fundo cinza-azulado claro; cartão branco arredondado com sombra no
centro. "Entrar", subtítulo, E-mail, Senha com botão de olho, "Lembrar de mim"
à esquerda e botão escuro "Entrar" à direita. Erro dentro do cartão.

**Estrutura.** Barra superior escura: "B7 MÍDIA" à esquerda; "Nome · Perfil" e
"Sair" em pílulas à direita. Menu lateral escuro: logo do cliente (ou nome do
site) no alto, itens abaixo, item ativo em bloco arredondado mais claro, chave
"Tema escuro" no pé. No celular o menu vira gaveta.

Itens: Painel, Matérias, Eventos, Imóveis, Vídeos, Edições, Categorias,
Usuários*, Configurações*, Ver o site. (*só administrador)

**Painel.** Seis cards com número grande (Matérias publicadas, Rascunhos,
Eventos, Imóveis, Vídeos, Usuários), card "Ações rápidas" e, abaixo, a tabela
de visualizações atual no visual novo.

**Listas** (Matérias, Eventos, Imóveis, Vídeos, Edições, Categorias, Usuários).
Título, "Gerencie o catálogo de …", botão "+ Nova …". Campo "Buscar por nome" e
botão "Buscar" (`?q=`). Tabela arredondada com Registro, Status, Visualizações
(só matérias) e Atualizado; setas ⇅ ordenam (`?ordem=`). Ações Ver / Editar /
Excluir. Paginação numerada, 20 por página (`?pagina=`). O próprio usuário não
tem "Excluir".

**Ver.** Seta de voltar, título, "Detalhes de …", botão "Abrir …" que leva à
página no site. Ficha em duas colunas com rótulos pequenos em maiúsculas; corpo
em largura total. Editar e Excluir no fim.

**Formulários.** Campos arredondados, rótulo pequeno em cima, duas colunas
quando couber, "Cancelar" e botão escuro "Atualizar …"/"Criar …" à direita.
Campos e gravação não mudam. Usuário ganha "Confirmação de senha" e olho nos
dois campos de senha. Categoria passa a poder ser editada (hoje só cria).

**Configurações.** Cada grupo vira um cartão com rótulo, campo, dica e botão de
salvar à direita.

## Fora de escopo

Mudanças no banco, nas permissões e no site público.

## Verificação

`npm run lint`, `npm run build`, `npm test`. Depois, no navegador: cada tela
nos temas claro e escuro e em largura de celular; busca, ordenação e paginação;
criar, editar e excluir categoria e usuário; login com e sem "Lembrar de mim".
