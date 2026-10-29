# Desafios extras

Ideias para a turma continuar evoluindo o InterCamp. Cada desafio diz **o que fazer**, **por onde começar** e **onde mexer**.
Dificuldade: ⭐ fácil · ⭐⭐ médio · ⭐⭐⭐ difícil.

> Regra de ouro: para cada desafio, crie primeiro o **teste** (back-end em `backend/tests`, front-end em `*.test.jsx`)
> e só depois o código. Assim você sabe quando terminou.

---

## 1. Escalação ⭐⭐

Mostrar os jogadores de cada turma no detalhe do jogo (a aba "Escalação" do mockup).

- **Banco** (`schema.sql`): tabela `jogadores` (id, equipe_id, nome, numero_camisa) e tabela `escalacoes` (jogo_id, jogador_id, titular).
- **API**: `GET /api/equipes/:id/jogadores`, `POST /api/jogos/:id/escalacao` (mestre).
- **Front**: aba "Escalação" em `JogoDetalhe.jsx`, com duas colunas.
- **Bônus**: no diálogo do gol (`ControleGols.jsx`), trocar o campo de texto pela lista de jogadores escalados.
  Assim a artilharia (desafio 6) fica perfeita.

## 2. Posse de bola manual ⭐⭐

O mestre (ou um ajudante) toca em "posse: equipe A" ou "posse: equipe B", e o app soma o tempo de cada uma.

- **Banco**: na tabela `jogos`, colunas `posse_lado` ('a' | 'b' | null), `posse_desde` (timestamptz), `posse_a_segundos` e `posse_b_segundos`.
- **Regra (função pura, com teste)**: ao trocar de lado, some `agora - posse_desde` no lado anterior. No intervalo e no fim, pause.
- **API**: `PATCH /api/jogos/:id/posse` com `{ lado: 'a' | 'b' | null }`.
- **Front**: barra "Posse de bola 62% x 38%" em Estatísticas (já existe o componente `BarraComparativa`).
- **Pense nisto**: quem segura o celular durante o jogo todo? Dá para usar um segundo celular logado como mestre.

## 3. PWA: instalar o app no celular ⭐⭐

Fazer o InterCamp virar "app de verdade": ícone na tela inicial, abrir em tela cheia e funcionar com internet ruim.

- O `public/manifest.webmanifest` e os ícones **já existem** (`npm run icones`).
- Instale o [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) e gere um *service worker*.
- **Cuidado com o cache**: guarde no celular os arquivos do site (JS, CSS, imagens), mas **não** as respostas da API.
  Senão a torcida vê placar velho.
- Teste no Chrome: F12 → Lighthouse → "Progressive Web App".

## 4. Notificações de início de jogo ⭐⭐⭐

"O jogo da sua turma vai começar!": a torcida escolhe a turma e recebe um aviso quando o mestre toca em Iniciar.

- Use **Web Push**, com a biblioteca [`web-push`](https://www.npmjs.com/package/web-push) no back-end e chaves VAPID nas variáveis de ambiente.
- **Banco**: tabela `inscricoes_push` (id, equipe_id, endpoint, chaves, criado_em).
- **API**: `POST /api/notificacoes/inscrever` (público) e, dentro da ação `iniciar` em `partidaService.js`, enviar o aviso para quem segue as duas turmas.
- Precisa do **service worker** do desafio 3. No iPhone, só funciona com o app **instalado** na tela inicial.
- **Privacidade**: não peça nome nem e-mail; deixe a pessoa cancelar a inscrição.

## 5. QR Code ⭐

Cartazes na escola com um QR Code que abre o app, ou um QR por jogo que abre o placar ao vivo.

- Biblioteca [`qrcode`](https://www.npmjs.com/package/qrcode) (gera a imagem no navegador).
- Nova tela `/qrcode` (em Mais): QR do site + botão "Imprimir" (`window.print()`) e um CSS de impressão com fundo branco.
- No detalhe do jogo: botão "Compartilhar" que mostra o QR do link `.../#/jogos/ID` (o mockup tem esse ícone).
- **Bônus**: use `navigator.share()` para abrir o menu de compartilhar do celular.

## 6. Ranking de artilheiros ⭐⭐

Quem fez mais gols no Interclasse? Os gols já ficam salvos com o nome do jogador (campo `jogador` em `eventos`).

- **API**: `GET /api/artilharia?competicao=slug` → `[{ jogador, equipe, gols }]`, ordenado por gols.
- **Regra (função pura, com teste)**: agrupar os eventos `tipo = 'gol'`. Junte nomes iguais ignorando maiúsculas e espaços
  ("pedro silva" = "Pedro  Silva").
- **Front**: nova aba "Artilharia" na tela Classificação, com o escudo da turma ao lado do nome.
- **Problema real**: se o mestre não digitar o nome, o gol fica "sem jogador". Mostre esses gols como "Não informado"
  (ou resolva com o desafio 1).

---

### Quer mais?

- Modo **telão**: tela `/telao` com letras gigantes para projetar na quadra.
- **Histórico** de edições: quem mudou o quê e quando (bom para o mestre conferir).
- **Tema claro** opcional, para usar ao sol.
- Prêmio **Fair Play**: a turma com menos cartões.
