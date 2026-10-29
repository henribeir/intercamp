// ============================================================
// Testes da base da API (rodam com: npm test)
// Não precisam de banco: se ele não existir, "banco" vem como "indisponivel".
// ============================================================
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/db/pool.js';

afterAll(async () => {
  await pool.end();
});

describe('GET /api/health', () => {
  it('responde 200 com status ok', async () => {
    const resposta = await request(app).get('/api/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('ok');
    expect(resposta.body.servico).toBe('InterCamp API');
    expect(['ok', 'indisponivel']).toContain(resposta.body.banco);
  });

  it('envia cabeçalhos de segurança do helmet', async () => {
    const resposta = await request(app).get('/api/health');

    expect(resposta.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('rotas inexistentes', () => {
  it('respondem 404 com mensagem em JSON', async () => {
    const resposta = await request(app).get('/api/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toMatch(/Rota não encontrada/);
  });
});
