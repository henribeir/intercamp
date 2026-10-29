// ============================================================
// Tempo real (SSE): unidade com respostas "falsas" e
// integração com um servidor HTTP de verdade numa porta livre.
// ============================================================
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import {
  conectarCliente, notificar, totalDeClientes, encerrarTodos, INTERVALO_PING_MS,
} from '../src/services/tempoReal.js';
import { app, entrarComoMestre, encerrarBanco, reiniciarBanco, comoMestre } from './ajudantes.js';

/** Imita req/res do Node, guardando tudo o que foi escrito */
function clienteFalso() {
  const req = new EventEmitter();
  const res = new EventEmitter();
  res.escrito = '';
  res.writeHead = vi.fn();
  res.write = (texto) => {
    res.escrito += texto;
  };
  res.end = vi.fn();
  return { req, res };
}

afterEach(() => {
  encerrarTodos();
  vi.useRealTimers();
});

describe('SSE (unidade)', () => {
  it('envia os cabeçalhos corretos e uma saudação', () => {
    const { req, res } = clienteFalso();
    conectarCliente(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    expect(res.escrito).toContain(': conectado');
  });

  it('notificar envia um evento leve por escopo para todos', () => {
    const um = clienteFalso();
    const dois = clienteFalso();
    conectarCliente(um.req, um.res);
    conectarCliente(dois.req, dois.res);

    notificar(['jogos', 'ranking'], 7);

    for (const { res } of [um, dois]) {
      expect(res.escrito).toContain('data: {"escopo":"jogos","jogoId":7}\n\n');
      expect(res.escrito).toContain('data: {"escopo":"ranking","jogoId":7}\n\n');
    }
  });

  it('manda ": ping" a cada 25 s e para quando ninguém está ouvindo', () => {
    vi.useFakeTimers();
    const { req, res } = clienteFalso();
    conectarCliente(req, res);

    vi.advanceTimersByTime(INTERVALO_PING_MS);
    expect(res.escrito.match(/: ping\n\n/g)).toHaveLength(1);

    req.emit('close'); // usuário fechou a aba
    expect(totalDeClientes()).toBe(0);
    expect(vi.getTimerCount()).toBe(0); // relógio do ping desligado
  });

  it('cliente desconectado não recebe mais nada', () => {
    const { req, res } = clienteFalso();
    conectarCliente(req, res);
    req.emit('close');

    notificar('noticias');
    expect(res.escrito).not.toContain('noticias');
  });
});

describe('GET /api/stream (integração)', () => {
  let servidor;
  let porta;
  let mestre;

  beforeAll(async () => {
    await reiniciarBanco();
    mestre = comoMestre(await entrarComoMestre());
    servidor = app.listen(0); // porta livre qualquer
    await new Promise((resolver) => servidor.once('listening', resolver));
    porta = servidor.address().port;
  });

  afterAll(async () => {
    encerrarTodos();
    await new Promise((resolver) => servidor.close(resolver));
    await encerrarBanco();
  });

  it('mantém a conexão aberta e avisa quando uma notícia é criada', async () => {
    const recebido = await new Promise((resolver, rejeitar) => {
      const pedido = http.get(`http://localhost:${porta}/api/stream`, (resposta) => {
        expect(resposta.headers['content-type']).toBe('text/event-stream; charset=utf-8');
        expect(resposta.headers['cache-control']).toBe('no-cache, no-transform');
        expect(resposta.headers['x-accel-buffering']).toBe('no');

        let texto = '';
        resposta.on('data', async (pedaco) => {
          texto += pedaco.toString();
          // Assim que conectou, o mestre publica uma notícia
          if (texto.includes(': conectado') && !texto.includes('data:')) {
            await mestre.post('/api/noticias', { titulo: 'Teste de tempo real' });
          }
          if (texto.includes('data:')) {
            pedido.destroy();
            resolver(texto);
          }
        });
      });
      pedido.on('error', rejeitar);
    });

    expect(recebido).toContain('data: {"escopo":"noticias","jogoId":null}');
  });
});
