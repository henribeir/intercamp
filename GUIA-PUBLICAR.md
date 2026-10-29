# Guia: colocar o InterCamp no ar

Depois deste guia, o InterCamp fica na internet com **um link** que funciona em qualquer celular:

- **Torcida (telespectador):** abre o link e acompanha jogos, placar ao vivo, chaveamento e ranking. Não precisa de login.
- **Mestres (admin):** abrem o mesmo link, entram em **Mais → Área do mestre** com e-mail e senha e marcam os placares.

Tudo é **gratuito**. Leva de **40 minutos a 1 hora**, uma vez só. Faça com calma, **pelo menos 1 dia antes do Interclasse**.

## Como funciona

```
 Celulares da torcida e dos mestres
              │
              ▼
  ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
  │ SITE                 │ ───▶ │ API                  │ ───▶ │ BANCO DE DADOS   │
  │ GitHub Pages         │      │ Render               │      │ Neon             │
  │ (as telas)           │      │ (regras e placares)  │      │ (guarda tudo)    │
  └──────────────────────┘      └──────────────────────┘      └──────────────────┘
```

Você vai criar uma conta em cada um, nesta ordem: **GitHub → Neon → Render → GitHub Pages**.

### Antes de começar, tenha:

- [ ] A pasta do InterCamp no seu computador (a mesma que você usou no INICIAR-DEMO)
- [ ] Um e-mail para criar as contas
- [ ] Um bloco de notas aberto, para anotar endereços e a senha do mestre

---

## Parte 1: Enviar o projeto para o GitHub (10 min)

O Render e o GitHub Pages pegam o código do GitHub. Vamos usar o programa **GitHub Desktop**, que é o jeito mais fácil:
ele já ignora sozinho as pastas pesadas (`node_modules`) e os arquivos de senha (`.env`).

0. **Renomeie a pasta** do projeto para exatamente `intercamp` (sem espaços nem números, ex.: não `intercamp (4)`).
   O nome da pasta vira o nome do repositório e entra no endereço do site.
1. Crie uma conta em <https://github.com> (se ainda não tiver). **Anote o seu usuário** (ex.: `henrique-c`).
2. Baixe e instale o **GitHub Desktop**: <https://desktop.github.com>. Abra e entre com a sua conta do GitHub.
3. No GitHub Desktop: menu **File → Add Local Repository...** → **Choose...** → escolha a **pasta do InterCamp** → **Add Repository**.
   - Se aparecer *"This directory does not appear to be a Git repository"*, clique no link **create a repository** que aparece na mensagem.
     Na janela seguinte, deixe tudo como está e clique em **Create Repository**.
4. No canto de cima, clique em **Publish repository**:
   - **Name:** `intercamp`
   - **Desmarque** a caixa **"Keep this code private"** (o GitHub Pages grátis só funciona com repositório público.
     Não tem problema: as senhas não vão junto)
   - Clique em **Publish Repository**.
5. Confira no navegador: abra `https://github.com/SEU-USUARIO/intercamp`. Devem aparecer as pastas `backend`, `frontend` e `.github`,
   e **não** pode aparecer nenhuma pasta `node_modules` nem arquivo `.env`.

> 💡 Se a aba **Actions** do repositório mostrar um ❌ vermelho agora, é normal: o site ainda não foi configurado. Vamos resolver na Parte 4.

---

## Parte 2: Criar o banco de dados no Neon (5 min)

1. Acesse <https://neon.tech> → **Sign up** (pode entrar com a conta do GitHub).
2. Crie um projeto:
   - **Project name:** `intercamp`
   - **Region:** a mais próxima do Brasil (ex.: *AWS South America (São Paulo)*, se aparecer)
   - Clique em **Create project**.
3. No painel do projeto, clique em **Connect**. Aparece um texto que começa com `postgresql://...`.
   Clique no botão de **copiar** ao lado (📋). Essa é a **connection string**.
   - Se tiver uma opção "Show password", ligue antes de copiar: a string precisa ter a senha dentro.
4. Cole no seu bloco de notas. Vamos usar já já.

---

## Parte 3: Configurar a senha do mestre e criar os jogos (5 min)

Aqui entra o **assistente** que faz as partes chatas por você.

1. Na pasta do InterCamp, dê **dois cliques** em:
   - **Mac:** `CONFIGURAR.command`
   - **Windows:** `CONFIGURAR.bat`
2. Ele vai perguntar, uma coisa por vez (cole com **Cmd + V** no Mac ou **Ctrl + V** no Windows e aperte **Enter**):

   | Pergunta | O que responder |
   |---|---|
   | 1) connection string do Neon | a que você copiou na Parte 2 |
   | 2) usuário do GitHub | só o usuário, ex.: `henrique-c` |
   | 3) e-mail do mestre | o e-mail de login dos mestres, ex.: `mestre@intercamp.com` |
   | 4) senha do mestre | uma senha forte, com 8 caracteres ou mais. **Anote!** |
   | Criar agora? | `s` (cria as tabelas e os 26 jogos da tabela oficial no Neon) |

3. No final, ele mostra um bloco assim:

   ```
   NODE_VERSION=22
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   FRONTEND_URL=https://henrique-c.github.io,http://localhost:5173
   JWT_SECRET=...
   MESTRE_EMAIL=...
   MESTRE_SENHA_HASH=$2b$10$...
   ```

   **Deixe essa janela aberta.** Vamos copiar esse bloco na próxima parte.

> 🔒 Esse bloco tem os segredos do sistema. Não mande para ninguém nem poste no grupo da turma.

---

## Parte 4: Colocar a API no Render (10 min)

1. Acesse <https://render.com> → **Get Started** → entre com a conta do **GitHub**.
2. Clique em **+ New → Web Service**.
3. Em *"Connect a repository"*, escolha **intercamp**. Se não aparecer, clique em **Configure account** / **GitHub**
   e dê permissão para o repositório `intercamp`.
4. Preencha **exatamente** assim:

   | Campo | Valor |
   |---|---|
   | Name | `intercamp-api` |
   | Region | a mais próxima (ex.: *Ohio* ou *Virginia*, tanto faz) |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime / Language | `Node` |
   | Build Command | `npm ci --omit=dev` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

5. Desça até **Environment Variables** e clique em **Add from .env**.
   Copie o bloco inteiro que o assistente mostrou (Parte 3, passo 3), cole na caixa e clique em **Add variables**.
   - Confira se ficaram **7 variáveis**. **Não** crie a variável `PORT`.
6. Se aparecer **Advanced**, abra e coloque em **Health Check Path**: `/api/health`.
7. Clique em **Deploy Web Service** (ou **Create Web Service**) e espere uns 3 a 5 minutos, até aparecer **Live** (verde).
8. No topo da página aparece o endereço da API, parecido com `https://intercamp-api.onrender.com`
   (às vezes com letras no final, como `https://intercamp-api-x7k2.onrender.com`). **Anote no bloco de notas.**
9. Teste: abra no navegador `https://SEU-ENDERECO.onrender.com/api/health`.
   Deve aparecer `"status":"ok"` e `"banco":"ok"`. ✅

---

## Parte 5: Publicar o site no GitHub Pages (5 min)

1. Abra `https://github.com/SEU-USUARIO/intercamp` → aba **Settings** (engrenagem ⚙️).
2. Menu da esquerda → **Pages**. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Menu da esquerda → **Secrets and variables → Actions** → aba **Variables** → **New repository variable**:
   - **Name:** `VITE_API_URL`
   - **Value:** o endereço do Render, ex.: `https://intercamp-api.onrender.com`
     (**sem** `/api` e **sem** barra no fim)
   - **Add variable**.
4. Vá na aba **Actions** → na esquerda, clique em **Publicar no GitHub Pages** → botão **Run workflow** → **Run workflow** (verde).
5. Espere uns 2 minutos, até a bolinha ficar **verde ✅**.
6. Pronto! O site está em:

   ## `https://SEU-USUARIO.github.io/intercamp/`

---

## Parte 6: Testar tudo (10 min)

1. Abra o link do site no **seu celular**. Os jogos devem aparecer.
   (Se aparecer *"Acordando o servidor"*, espere até 1 minuto: veja o "Dia do evento" abaixo.)
2. Toque em **Mais → Área do mestre** e entre com o e-mail e a senha da Parte 3.
3. Peça para outra pessoa abrir o link em **outro celular**. Marque um gol de teste e veja o placar mudar no celular dela.
4. Para um teste completo, siga o roteiro do arquivo **`TESTES.md`**.
5. **Depois dos testes, zere os jogos:** dê dois cliques em `CONFIGURAR.command` (ou `.bat`) de novo → opção **1 - Zerar os jogos**.

---

## Como divulgar

| Para quem | O que mandar |
|---|---|
| **Torcida (alunos, professores, pais)** | Só o link: `https://SEU-USUARIO.github.io/intercamp/`. Dica: gere um **QR Code** do link (ex.: no site qr-code-generator.com) e cole nos murais da escola. No celular, dá para tocar em **Compartilhar → Adicionar à Tela de Início** para virar um "app". |
| **Mestres (quem marca o placar)** | O link + o **e-mail e a senha do mestre**, só pessoalmente ou em mensagem privada. Todos os mestres usam o **mesmo login** e podem estar conectados ao mesmo tempo, em celulares diferentes. |

> 🔒 **Nunca** mande a senha do mestre no grupo da turma. Quem tiver a senha consegue mudar qualquer placar.
> Se a senha vazar: rode o `CONFIGURAR` → opção **2**, responda **n** em "Criar agora?" e, no Render,
> troque **só** a variável `MESTRE_SENHA_HASH` pela nova (Environment → editar → Save Changes).
> Atenção: a opção 2 também gera um `JWT_SECRET` novo; troque ele no Render também, para desconectar quem estava logado.

---

## Dia do Interclasse

| Quando | O que fazer |
|---|---|
| **Na véspera** | Crie uma conta grátis no [UptimeRobot](https://uptimerobot.com) → **Add New Monitor** → tipo **HTTP(s)** → URL `https://SEU-ENDERECO.onrender.com/api/health` → intervalo **5 minutos**. Isso impede a API de "dormir" (veja abaixo). |
| **10 min antes** | Abra o site no celular do mestre e confira se os jogos aparecem. |
| **Durante** | O mestre de cada jogo abre **Mais → Área do mestre → Painel** e toca no jogo. Antes de repetir um gol depois de uma falha de internet, olhe os **Últimos lances**. |
| **Depois** | Pause o monitor do UptimeRobot (para não gastar as horas grátis). |

**Por que a API "dorme"?** No plano grátis do Render, a API desliga depois de uns 15 minutos sem uso.
O próximo acesso a liga de novo, e isso leva até 1 minuto (o site mostra *"Acordando o servidor..."*).
O UptimeRobot visita a API a cada 5 minutos, então ela nunca dorme.

---

## Se algo der errado

| Problema | Solução |
|---|---|
| Site abre, mas mostra *"Sem conexão com o servidor"* | 1) Confira o `VITE_API_URL` no GitHub (Parte 5, passo 3): sem `/api` e sem barra no fim. Se corrigir, rode o **Run workflow** de novo. 2) Confira o `FRONTEND_URL` no Render: deve ser `https://SEU-USUARIO.github.io` (com o seu usuário **em letras minúsculas**). |
| `/api/health` mostra `"banco":"indisponivel"` | A `DATABASE_URL` no Render está errada. Copie de novo do Neon e cole no Render (Environment → editar → Save Changes). |
| Mestre não consegue entrar (*"E-mail ou senha incorretos"*) | Confira se o `MESTRE_EMAIL` e o `MESTRE_SENHA_HASH` no Render são os mesmos que o assistente mostrou. |
| Página em branco no GitHub Pages | Settings → Pages → Source tem que estar em **GitHub Actions**. Depois rode o **Run workflow** de novo. |
| Actions com ❌ em *"Conferir a variável VITE_API_URL"* | Faltou criar a variável (Parte 5, passo 3). |
| Render com erro no deploy | Confira **Root Directory** = `backend` e os comandos da Parte 4. Na aba **Logs** do Render aparece a mensagem de erro. |
| Mudei algo no código e quero atualizar | No GitHub Desktop: escreva um resumo em **Summary** → **Commit to main** → **Push origin**. O site e a API se atualizam sozinhos em alguns minutos. **Não faça isso durante os jogos.** |

Mais detalhes técnicos: `README.md`, seções 4 a 13.
