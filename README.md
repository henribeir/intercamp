# InterCamp

Aplicativo do **Interclasse do CEM Dom Marcelino de Milão**, feito pela turma **301 INT**.
Mostra os jogos, os placares **ao vivo**, o **chaveamento** de cada competição e o **ranking das turmas**.
O "mestre" (quem cuida do placar) usa o próprio celular para marcar gols, pontos e encerrar os jogos.

> *Esporte, união, respeito e grandes conquistas!*

> 🚀 **Quer colocar no ar para a escola usar?** Siga o **[GUIA-PUBLICAR.md](GUIA-PUBLICAR.md)**, passo a passo, sem precisar programar.
> Só quer testar no seu computador? Dois cliques em `INICIAR-DEMO.command` (Mac) ou `INICIAR-DEMO.bat` (Windows).

---

## Sumário

1. [Como o sistema funciona](#1-como-o-sistema-funciona)
2. [Pastas do projeto](#2-pastas-do-projeto)
3. [Rodar no seu computador](#3-rodar-no-seu-computador)
4. [Banco de dados no Neon](#4-banco-de-dados-no-neon)
5. [Senha do mestre (hash)](#5-senha-do-mestre-hash)
6. [API no Render](#6-api-no-render)
7. [FRONTEND_URL e CORS](#7-frontend_url-e-cors)
8. [Site no GitHub Pages (pelo Actions)](#8-site-no-github-pages-pelo-actions)
9. [Escudos das turmas](#9-escudos-das-turmas)
10. [Logo, ícones e tabela oficial](#10-logo-ícones-e-tabela-oficial)
11. [Limitações do plano gratuito](#11-limitações-do-plano-gratuito)
12. [Testes](#12-testes)
13. [Problemas comuns](#13-problemas-comuns)
14. [Desafios extras](#14-desafios-extras)

---

## 1. Como o sistema funciona

```
 Celulares (torcida e mestre)
        │  abre o site
        ▼
 GitHub Pages  ──────────────►  Render (API Node.js)  ──────────►  Neon (PostgreSQL)
 (React, pasta /frontend)        (pasta /backend)                   (as tabelas)
        ▲                               │
        └──── aviso "algo mudou" ◄──────┘   (Server-Sent Events: placar ao vivo)
```

- **Front-end** (o que aparece na tela): React + Vite + Tailwind. Fica **de graça** no GitHub Pages.
- **Back-end** (a API): Node.js + Express. Fica **de graça** no Render.
- **Banco de dados**: PostgreSQL. Fica **de graça** no Neon.
- **Tempo real**: quando o mestre marca um gol, a API avisa todos os celulares conectados e eles atualizam a tela sozinhos.

## 2. Pastas do projeto

```
backend/                 API
  src/db/schema.sql      estrutura do banco (tabelas)
  src/db/carga.js        dados oficiais da tabela de jogos (usado pelo seed)
  src/routes/            endereços da API (/api/jogos, /api/ranking...)
  src/controllers/       recebem a requisição e respondem
  src/services/          regras de negócio (vôlei, ranking, mata-mata...)
  tests/                 testes automáticos (rodam sem banco de verdade)
frontend/                site
  src/pages/             telas (Início, Jogos, Chaveamento, Mestre...)
  src/components/        peças reaproveitadas (JogoCard, Escudo...)
  src/content/           textos de Regras e Sobre (edite à vontade!)
  public/escudos/        imagens dos escudos das turmas
.github/workflows/       publicação automática no GitHub Pages
TESTES.md                roteiro de teste com dois celulares
DESAFIOS.md              ideias para evoluir o app
```

## 3. Rodar no seu computador

**Você vai precisar de:** [Node.js 22](https://nodejs.org) (ou 20+), [Git](https://git-scm.com) e um banco PostgreSQL (o do Neon serve, veja a seção 4).

### Atalho: testar SEM banco de dados (modo demonstração)

Quer só ver o site funcionando? Não precisa de Neon nem de `.env`. Só do Node.js.

- **Windows:** dois cliques em `INICIAR-DEMO.bat` (na pasta principal).
- **Mac:** dois cliques em `INICIAR-DEMO.command`. Na 1ª vez o Mac pode avisar que o arquivo
  "não pode ser aberto": clique com o **botão direito** nele → **Abrir** → **Abrir**. Ele lembra da escolha.
  Se ainda reclamar de permissão, no Terminal (dentro da pasta) rode `chmod +x INICIAR-DEMO.command`.
- **Qualquer sistema, pelo terminal:** na pasta principal, rode `node iniciar-demo.mjs`.

Na 1ª vez ele instala as dependências (alguns minutos). Depois liga a API e o site e abre o navegador em
<http://localhost:5173>. A API usa um PostgreSQL **em memória** (o mesmo dos testes), já com a tabela oficial.
Login do mestre: `mestre@intercamp.com` / `intercamp123`.

Prefere fazer à mão? Em um terminal: `cd backend && npm install && npm run demo`.
Em outro: `cd frontend && npm install && npm run dev`.

> ⚠️ Tudo fica só na memória: ao fechar a API (Ctrl+C), os placares e notícias somem e a tabela volta ao começo.
> Serve para testar, **nunca** para o dia do Interclasse.

### API (back-end)

```bash
cd backend
npm install
cp .env.example .env
```

Abra o arquivo `backend/.env` e preencha (as seções 4 e 5 explicam cada item):

| Variável | O que é |
|---|---|
| `DATABASE_URL` | endereço do banco (Neon ou local) |
| `FRONTEND_URL` | `http://localhost:5173` para rodar no computador |
| `JWT_SECRET` | texto longo e aleatório (veja abaixo) |
| `MESTRE_EMAIL` | e-mail usado no login do mestre |
| `MESTRE_SENHA_HASH` | hash da senha do mestre (`npm run hash-senha`) |

Gerar o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Criar as tabelas e carregar a tabela oficial de jogos, depois ligar a API:

```bash
npm run seed
npm run dev
```

Abra <http://localhost:3000/api/health>. Deve aparecer `"banco":"ok"`.

### Site (front-end)

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abra <http://localhost:5173>. Dica: no navegador, aperte F12 e ligue o "modo celular".

## 4. Banco de dados no Neon

1. Crie uma conta em <https://neon.tech> (dá para entrar com o GitHub).
2. Crie um projeto chamado `intercamp`. Escolha a região mais próxima (São Paulo, se aparecer na lista).
3. No painel do projeto, clique em **Connect** e copie a **connection string**. Ela é parecida com:
   `postgresql://usuario:senha@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`
4. Cole essa string no `DATABASE_URL` do `backend/.env`.
5. **Crie as tabelas e os dados** rodando, no seu computador:

   ```bash
   cd backend
   npm run seed
   ```

   O seed executa o `src/db/schema.sql` (cria as tabelas) e grava a tabela oficial do Interclasse
   (as 9 turmas, as 6 competições e os 26 jogos), além de 3 notícias de exemplo.

> ⚠️ **O seed APAGA tudo e começa do zero.** Rode antes do evento, nunca durante.
> Quer só ver a estrutura? Abra o `schema.sql` e leia: cada tabela está comentada.

## 5. Senha do mestre (hash)

A senha do mestre **nunca** é guardada em texto. Guardamos só o *hash* (um "embaralhamento" que não dá para desfazer):

```bash
cd backend
npm run hash-senha
```

Digite a senha (mínimo de 8 caracteres) e copie a linha que aparece:

```
MESTRE_SENHA_HASH=$2b$10$....
```

Cole no `.env` (no computador) e também no Render (seção 6).
Para **trocar a senha**, gere um hash novo e substitua o antigo.

> 🔒 O arquivo `.env` tem segredos e **não vai para o GitHub** (está no `.gitignore`).

## 6. API no Render

1. Crie uma conta em <https://render.com> (entre com o GitHub).
2. **New → Web Service** e escolha o repositório do InterCamp.
3. Preencha:

   | Campo | Valor |
   |---|---|
   | Name | `intercamp-api` (vira `https://intercamp-api.onrender.com`) |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm ci --omit=dev` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

4. Em **Environment Variables**, adicione:

   | Variável | Valor |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | a string do Neon |
   | `JWT_SECRET` | o texto aleatório que você gerou |
   | `MESTRE_EMAIL` | o e-mail do mestre |
   | `MESTRE_SENHA_HASH` | o hash gerado na seção 5 |
   | `FRONTEND_URL` | o endereço do site (seção 7) |

   Não crie a variável `PORT`: o Render escolhe a porta sozinho.
5. Em **Advanced → Health Check Path**, coloque `/api/health`.
6. Clique em **Create Web Service** e espere o deploy.
7. Teste: `https://intercamp-api.onrender.com/api/health` deve mostrar `"banco":"ok"`.

> O seed **não** roda no Render. Rode no seu computador, com o `DATABASE_URL` do Neon no `.env` (seção 4).

## 7. FRONTEND_URL e CORS

O navegador só deixa o site conversar com a API se a API autorizar o endereço do site. Isso se chama **CORS**.
Quem autoriza é a variável `FRONTEND_URL` da API.

- Use **só a origem**: protocolo + domínio. **Sem** o nome do repositório e **sem** barra no fim.
  - ✅ `https://seu-usuario.github.io`
  - ❌ `https://seu-usuario.github.io/intercamp/`
- Para aceitar o site publicado **e** o computador ao mesmo tempo, separe por vírgula:
  `https://seu-usuario.github.io,http://localhost:5173`

Se o `FRONTEND_URL` estiver errado, o site mostra *"Sem conexão com o servidor"* e o console do navegador (F12) mostra um erro com a palavra **CORS**.

## 8. Site no GitHub Pages (pelo Actions)

O arquivo `.github/workflows/deploy.yml` testa, gera e publica o site sozinho a cada `push` na branch `main` que mexa em `frontend/`.

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
   Em **Build and deployment → Source**, escolha **GitHub Actions**.
2. Vá em **Settings → Secrets and variables → Actions → aba Variables → New repository variable**:
   - Name: `VITE_API_URL`
   - Value: `https://intercamp-api.onrender.com` (o endereço do Render, **sem** `/api` e **sem** barra no fim)
3. Faça um `push` na `main` (ou abra a aba **Actions** → "Publicar no GitHub Pages" → **Run workflow**).
4. Quando ficar verde ✅, o site estará em `https://seu-usuario.github.io/NOME-DO-REPOSITORIO/`.

O **`VITE_BASE`** é calculado sozinho a partir do nome do repositório (`/NOME-DO-REPOSITORIO/`).
Se o repositório se chamar `seu-usuario.github.io`, ele usa `/`.

As telas usam endereços com `#`, como `.../#/jogos/12`. Isso é de propósito: o GitHub Pages não conhece as rotas do React,
e com o `#` qualquer link funciona, até ao recarregar a página.

> ⚠️ Um repositório tem **um só** site no GitHub Pages. Se o repositório já publica outro site, ele será substituído.
> Use um repositório só para o InterCamp.

## 9. Escudos das turmas

Sem imagem, o app desenha um escudo com o número e o curso da turma, na cor da turma. Para usar escudos de verdade:

1. Salve as imagens em `frontend/public/escudos/`, com o nome da turma em minúsculas e hífen no lugar do espaço:
   `101.png`, `200-adm.png`, `301-int.png`...
   Formatos: png, jpg, webp ou svg. Ideal: 256 × 300 px com fundo transparente.
2. Faça commit e push (o Actions publica o site de novo).
3. No app, vá em **Mais → Área do mestre → Turmas → Editar** e escreva no campo **Escudo**:
   `escudos/301-int.png`. Toque em **Salvar**.

Também dá para usar um link completo (`https://...`) de uma imagem publicada em outro lugar.
No mesmo formulário, o mestre muda a **cor** da turma.

## 10. Logo, ícones e tabela oficial

- A logo dos alunos fica em `frontend/marca/logo-original.png`. Depois de trocar a imagem, rode:

  ```bash
  cd frontend
  npm run icones
  ```

  O script recorta as bordas pretas e gera a logo do cabeçalho e os ícones do app (aba do navegador e tela inicial do celular).
- A imagem da tabela oficial (tela **Mais → Tabela oficial**) é `frontend/public/tabela-oficial.png`.
- O logo da escola (tela **Sobre**) é `frontend/public/brand/logo-cem.png`. Enquanto o arquivo não existir, aparece um espaço reservado.
- Os textos de **Regras** e **Sobre** ficam em `frontend/src/content/`: `#` vira título, `-` vira item de lista e `**texto**` vira negrito.

## 11. Limitações do plano gratuito

| O quê | O que acontece | O que fazer |
|---|---|---|
| **API no Render dorme** | Depois de ~15 minutos sem nenhum acesso, o Render desliga a API. O próximo acesso a "acorda", e isso leva até ~1 minuto. O app mostra *"Acordando o servidor, pode levar até 1 minuto"*. | **Abra o site uns 10 minutos antes do evento** e deixe aberto. |
| **Manter acordada** | Um "vigia" pode acessar a API de tempos em tempos para ela não dormir. | Crie uma conta grátis no [UptimeRobot](https://uptimerobot.com), **New monitor → HTTP(s)**, URL `https://intercamp-api.onrender.com/api/health`, intervalo de **5 minutos**. Ligue o monitor **só na semana do Interclasse** e pause depois. |
| **Horas grátis do Render** | O plano grátis tem um limite de horas por mês (hoje, 750 h). Uma API ligada o mês inteiro cabe nele, mas não sobra para outra. | Use uma API só. Pause o UptimeRobot fora do evento. |
| **Neon** | O `/api/health` também consulta o banco, então o monitor mantém o Neon acordado. O plano grátis do Neon tem limite mensal de uso e de espaço (o InterCamp usa muito pouco espaço). | De novo: monitor ligado só nos dias de jogo. Confira os limites atuais no painel do Neon. |
| **Placar ao vivo cai** | Conexões longas (Server-Sent Events) podem ser cortadas pela rede ou pelo Render. | Nada: o app reconecta sozinho e, enquanto estiver sem conexão, busca os dados de novo a cada 15 s. |
| **Deploy demora** | Cada deploy no Render leva alguns minutos, e a API fica fora do ar nesse tempo. | **Não faça deploy durante os jogos.** |

## 12. Testes

**Automáticos** (não precisam de internet nem de banco de verdade):

```bash
cd backend && npm test
cd frontend && npm test
```

- O back-end roda o PostgreSQL em memória (PGlite): o Neon nunca é tocado.
- O front-end usa Vitest + Testing Library (cards de jogo, ranking, minuto do jogo, login).

**Manual com dois celulares:** siga o roteiro do [TESTES.md](TESTES.md) antes do evento.

## 13. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Sem conexão com o servidor" | `FRONTEND_URL` errado (CORS) ou `VITE_API_URL` errado | Seções 7 e 8. Depois de mudar o `VITE_API_URL`, rode o workflow de novo. |
| "Acordando o servidor..." toda hora | A API dormiu (plano grátis) | Seção 11 |
| "E-mail ou senha incorretos" com a senha certa | Hash no Render diferente do `.env` | Gere o hash de novo e cole no Render (seção 5) |
| "Sua sessão expirou" | O login do mestre vale 12 horas | Entre de novo |
| "Muitas tentativas de login" | 10 tentativas erradas em 15 minutos | Espere 15 minutos |
| `/api/health` mostra `"banco":"indisponivel"` | `DATABASE_URL` errado ou Neon fora do ar | Confira a string do Neon |
| Página em branco no GitHub Pages | Pages não está como "GitHub Actions" | Seção 8, passo 1 |
| Workflow falha em "Conferir a variável VITE_API_URL" | Variável não criada | Seção 8, passo 2 |
| "localhost recusou a conexão" no modo demonstração | O site ainda não ligou (1ª instalação demora) ou a janela do Terminal foi fechada | Espere aparecer *"Pronto!"* no Terminal e deixe a janela **aberta**. Se aparecer `ERRO`, leia a mensagem |
| Mac: `EPERM: process.cwd failed ... operation not permitted` | O macOS não deixa o Terminal ler a pasta Transferências, Mesa ou Documentos | Mova a pasta do projeto para a sua pasta pessoal (Finder → Ir → Início), ou libere em Ajustes do Sistema → Privacidade e Segurança → Arquivos e Pastas → Terminal |
| Modo demonstração: "A porta 3000 já está sendo usada" | O InterCamp já está aberto em outra janela | Feche todas as janelas do Terminal e abra de novo |

## 14. Desafios extras

Quer continuar evoluindo o app? Veja o [DESAFIOS.md](DESAFIOS.md): escalação, posse de bola, PWA, notificações, QR Code e artilharia.

---

Feito com 💙 pela turma **301 INT** · *Mais que jogos, formamos grandes histórias!*
