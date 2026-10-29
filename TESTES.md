# Roteiro de teste com dois celulares

Faça este roteiro **antes do Interclasse**, com o site e a API já publicados (ou rodando no computador, na mesma rede Wi-Fi).
Leva uns 30 minutos. Anote o resultado de cada passo na coluna **OK?**.

## Preparação

| Quem | O quê |
|---|---|
| 📱 **Celular A: MESTRE** | Quem marca o placar. Vai entrar em **Mais → Área do mestre**. |
| 📱 **Celular B: TORCIDA** | Só assiste. **Não** faz login. |
| 💻 Computador (opcional) | Para os testes com `curl` da parte 7. |

1. Rode o seed para começar com a tabela limpa: `cd backend && npm run seed`.
2. Abra o site nos dois celulares **10 minutos antes** (a API pode estar dormindo, veja o README, seção 11).
3. Endereços:
   - Site: `https://SEU-USUARIO.github.io/NOME-DO-REPO/`
   - API: `https://SEU-APP.onrender.com/api/health` (deve mostrar `"banco":"ok"`)

---

## 1. Login do mestre

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 1.1 | A | Mais → Área do mestre. Digite uma senha **errada** e toque em Entrar. | Aparece *"E-mail ou senha incorretos."* | |
| 1.2 | A | Digite a senha certa. | Abre o painel *"Área do mestre"* com os atalhos. | |
| 1.3 | B | Abra `.../#/mestre`. | Aparece a tela de **login** (a torcida não vê o painel). | |

## 2. Preparar um jogo

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 2.1 | A | Definir confrontos → Handebol Masculino Jogo 1: preencha a data de **hoje**, o horário e o local "Quadra da Escola". Salve. | Aviso verde *"Jogo 1 salvo"*. | |
| 2.2 | B | Abra o Início. | O jogo aparece em **"Jogos de hoje"**, com horário e local, em até ~2 segundos e sem recarregar. | |
| 2.3 | A | Futsal Masculino Jogo 8 (vaga "a definir") → abra o controle do jogo. | Aparece o aviso de vaga "a definir" e **não** existe o botão Iniciar. | |

## 3. Gol e desfazer (futsal ou handebol)

Deixe o celular **B** na tela do jogo (Jogos → toque no card do Handebol Jogo 1).

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 3.1 | A | Painel → Handebol Jogo 1 → **Iniciar partida**. | Status *"1º tempo"* e cronômetro andando. | |
| 3.2 | B | Olhe a tela (sem tocar). | Selo **AO VIVO**, *"1º TEMPO · 0'"* e *"Início da partida"* na linha do tempo. | |
| 3.3 | A | **Gol** da equipe A → escreva "Pedro" → Confirmar gol. | Placar **1 - 0**, aviso verde e vibração. | |
| 3.4 | B | Olhe a tela. | **1 - 0** e, na linha do tempo, *"Gol"* com *"Pedro (201 INT)"*, em até ~2 segundos. | |
| 3.5 | A | Toque **duas vezes bem rápido** em "Falta" da equipe B. | Registra **uma** falta só (confira em "Últimos lances"). | |
| 3.6 | A | Toque em **Desfazer** no gol do Pedro. | Placar volta para **0 - 0**. | |
| 3.7 | B | Olhe a tela. | **0 - 0** e o gol sumiu da linha do tempo. | |
| 3.8 | A | Marque 1 gol para cada lado (**1 - 1**). Toque em Intervalo e depois em Iniciar 2º tempo. | Cronômetro recomeça do 00:00 no 2º tempo. | |

## 4. Empate no mata-mata

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 4.1 | A | Com **1 - 1**, toque em **Encerrar jogo**. | Pergunta *"Jogo empatado: quem venceu?"* com um botão para cada equipe. | |
| 4.2 | A | Toque em **Cancelar**. | Nada muda: o jogo continua ao vivo. | |
| 4.3 | A | Encerrar jogo → **Vitória de 300 INT** (pênaltis). | Jogo encerrado: *"Vitória de 300 INT"*. | |
| 4.4 | B | Abra o **Chaveamento** do Handebol. | Jogo 1 com **Fim**, 300 INT em destaque, e a **Final (Jogo 3)** já com **300 INT** na vaga A. | |
| 4.5 | B | Abra **Classificação** → Handebol Masc. | 300 INT com 3 pontos e faixa amarela; 201 INT com faixa vermelha (eliminada). | |
| 4.6 | A | No Jogo 1, toque em **Reabrir jogo (corrigir)** → Reabrir. | Volta para ao vivo, e a vaga da Final volta a *"Vencedor do jogo 1"*. Depois encerre de novo. | |

## 5. Vôlei

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 5.1 | A | Vôlei de Praia Feminino (final) → Iniciar. | Placar de sets **0 - 0** e "Set 1". | |
| 5.2 | A | Toque **+1** na equipe A até 21 pontos. | Aviso *"Fim do 1º set!"* e o set 2 começa em 0 x 0. | |
| 5.3 | B | Abra o jogo. | Tabela de sets: 1º set 21 x 0 e 2º set "em andamento". | |
| 5.4 | A | Toque em **Desfazer ponto** da equipe A uma vez. | O 1º set reabre em **20 x 0** (o set 2 some). | |
| 5.5 | A | Complete dois sets para a mesma equipe. | Aviso verde *"O jogo já pode ser encerrado"*; os botões +1 ficam desligados. | |
| 5.6 | A | Encerrar jogo → confirmar. | A competição ganha **campeã** (troféu no Chaveamento e no Início). | |

## 6. Queda do Wi-Fi do mestre

| # | 📱 Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 6.1 | A | Abra um jogo ao vivo e ligue o **modo avião**. | A tela continua aberta. | |
| 6.2 | A | Toque em **Gol**. | Aviso vermelho *"Sem conexão com o servidor..."*. O placar **não** muda. | |
| 6.3 | B | Olhe a tela. | Nada mudou (o gol não foi registrado). | |
| 6.4 | A | Desligue o modo avião e espere uns 5 segundos. | A tela se atualiza sozinha. | |
| 6.5 | A | Confira "Últimos lances" **antes** de repetir o gol. Depois marque o gol de novo. | O gol entra **uma vez só**. | |
| 6.6 | B | Ligue o modo avião no B por 30 segundos. Enquanto isso, A marca um gol. Desligue o modo avião. | Em até ~15 segundos depois de voltar, o B mostra o gol, sem recarregar. | |

> 💡 **Atenção:** se a internet cair **no meio** do envio, o gol pode ter sido gravado mesmo com o aviso de erro.
> Por isso, olhe sempre os **Últimos lances** antes de repetir. Se entrou duas vezes, use **Desfazer**.

## 7. Escrita sem login (segurança)

| # | Onde | Ação | Resultado esperado | OK? |
|---|---|---|---|---|
| 7.1 | 💻 | `curl -X POST https://SEU-APP.onrender.com/api/jogos/1/eventos -H "Content-Type: application/json" -d '{"tipo":"gol","equipe_id":6}'` | Resposta **401** com *"Acesso restrito ao mestre..."*. O placar não muda. | |
| 7.2 | 💻 | `curl -X PATCH https://SEU-APP.onrender.com/api/jogos/1/status -H "Content-Type: application/json" -d '{"acao":"encerrar"}'` | **401** | |
| 7.3 | 📱 A | No navegador do A: F12 → Application → Local Storage → mude o valor de `mestre_token` para qualquer texto e tente marcar um gol. | Volta para o login com *"Sua sessão expirou. Entre de novo para continuar."* | |
| 7.4 | 📱 B | Tente 11 logins errados seguidos. | Na 11ª tentativa aparece *"Muitas tentativas. Espere 15 minutos..."*. | |

## 8. Plano gratuito (opcional, no dia anterior)

| # | Ação | Resultado esperado | OK? |
|---|---|---|---|
| 8.1 | Não acesse a API por 20 minutos. Depois abra o site. | Aparece *"Acordando o servidor, pode levar até 1 minuto"* e, em seguida, os jogos. | |
| 8.2 | Ligue o monitor do UptimeRobot (README, seção 11) e repita depois de 20 minutos. | O site abre rápido, sem o aviso. | |

---

**Resultado:** ____ de 38 passos OK. Data: ___/___/_____. Responsáveis: _______________________
