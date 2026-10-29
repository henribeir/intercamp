// ============================================================
// TEMPO REAL com Server-Sent Events (SSE).
//
// O navegador abre UMA conexão em GET /api/stream e a deixa aberta.
// Quando algo muda, o servidor escreve um aviso leve, por exemplo:
//   data: {"escopo":"jogos","jogoId":5}
// e o front refaz a busca só do que mudou.
//
// Formato SSE: cada mensagem termina com uma linha em branco ("\n\n").
// Linhas que começam com ":" são comentários (usados como "ping").
// ============================================================

export const ESCOPOS = ['jogos', 'ranking', 'chaveamento', 'noticias'];
export const INTERVALO_PING_MS = 25000;

const clientes = new Set(); // respostas HTTP abertas
let relogioPing = null;

function enviarParaTodos(texto) {
  for (const resposta of clientes) {
    resposta.write(texto);
  }
}

function ligarPing() {
  if (relogioPing) return;
  // O ping evita que proxies (Render, celular) derrubem a conexão parada
  relogioPing = setInterval(() => enviarParaTodos(': ping\n\n'), INTERVALO_PING_MS);
}

function desligarPing() {
  clearInterval(relogioPing);
  relogioPing = null;
}

function removerCliente(resposta) {
  clientes.delete(resposta);
  if (clientes.size === 0) desligarPing(); // ninguém ouvindo: para o relógio
}

/** Abre a conexão SSE e registra o cliente até ele desconectar. */
export function conectarCliente(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // pede para proxies não segurarem as mensagens
  });

  // "retry": se cair, o navegador tenta reconectar em 5 s
  res.write('retry: 5000\n: conectado\n\n');

  clientes.add(res);
  ligarPing();

  // Limpeza quando o usuário fecha a aba ou perde a internet
  req.on('close', () => removerCliente(res));
  res.on('error', () => removerCliente(res));
}

/**
 * Avisa todos os clientes. Um evento por escopo.
 * Ex.: notificar(['jogos', 'chaveamento'], 12)
 */
export function notificar(escopos, jogoId = null) {
  for (const escopo of [].concat(escopos)) {
    enviarParaTodos(`data: ${JSON.stringify({ escopo, jogoId })}\n\n`);
  }
}

/** Quantos clientes estão conectados (útil em testes e no /health). */
export function totalDeClientes() {
  return clientes.size;
}

/** Fecha todas as conexões (ao desligar o servidor). */
export function encerrarTodos() {
  for (const resposta of clientes) resposta.end();
  clientes.clear();
  desligarPing();
}
