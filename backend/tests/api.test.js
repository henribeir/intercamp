// ============================================================
// Autenticação e validação (API com banco em memória)
// ============================================================
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { api, entrarComoMestre, encerrarBanco, reiniciarBanco } from './ajudantes.js';
import { MESTRE_TESTE, SEGREDO_JWT_TESTE } from './constantes.js';

let token;

beforeAll(async () => {
  await reiniciarBanco();
  token = await entrarComoMestre();
});

afterAll(encerrarBanco);

describe('login', () => {
  it('credenciais válidas devolvem um token JWT de 12 horas', async () => {
    const resposta = await api().post('/api/auth/login').send(MESTRE_TESTE);

    expect(resposta.status).toBe(200);
    expect(resposta.body.tipo).toBe('Bearer');
    const dados = jwt.verify(resposta.body.token, SEGREDO_JWT_TESTE);
    expect(dados.papel).toBe('mestre');
    expect(dados.exp - dados.iat).toBe(12 * 60 * 60);
  });

  it('senha errada responde 401', async () => {
    const resposta = await api().post('/api/auth/login').send({ ...MESTRE_TESTE, senha: 'senha-errada' });
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('E-mail ou senha incorretos');
  });

  it('e-mail errado responde 401 com a MESMA mensagem (não revela quem existe)', async () => {
    const resposta = await api().post('/api/auth/login').send({ email: 'outro@teste.com', senha: MESTRE_TESTE.senha });
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('E-mail ou senha incorretos');
  });

  it('corpo inválido responde 400 com os campos em português', async () => {
    const resposta = await api().post('/api/auth/login').send({ email: 'nao-e-email', senha: '' });
    expect(resposta.status).toBe(400);
    const campos = resposta.body.detalhes.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['email', 'senha']));
  });
});

describe('rotas de escrita exigem token', () => {
  it.each([
    ['POST', '/api/equipes'],
    ['PATCH', '/api/jogos/1/status'],
    ['POST', '/api/jogos/1/eventos'],
    ['DELETE', '/api/jogos/1'],
    ['POST', '/api/noticias'],
  ])('%s %s sem token responde 401', async (metodo, url) => {
    const resposta = await api()[metodo.toLowerCase()](url).send({});
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toMatch(/Authorization: Bearer/);
  });

  it('token assinado com outro segredo responde 401', async () => {
    const falso = jwt.sign({ papel: 'mestre' }, 'outro-segredo');
    const resposta = await api().delete('/api/jogos/1').set('Authorization', `Bearer ${falso}`);
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toMatch(/Token inválido/);
  });

  it('token expirado responde 401 pedindo novo login', async () => {
    const expirado = jwt.sign({ papel: 'mestre', exp: Math.floor(Date.now() / 1000) - 10 }, SEGREDO_JWT_TESTE);
    const resposta = await api().delete('/api/jogos/1').set('Authorization', `Bearer ${expirado}`);
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toMatch(/expirou/);
  });

  it('leitura continua pública', async () => {
    expect((await api().get('/api/jogos')).status).toBe(200);
  });
});

describe('validações', () => {
  const comToken = (req) => req.set('Authorization', `Bearer ${token}`);

  it('confronto com equipe A igual à B responde 400', async () => {
    const resposta = await comToken(api().patch('/api/jogos/1/confronto')).send({ equipe_a_id: 3, equipe_b_id: 3 });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].mensagem).toMatch(/diferentes/);
  });

  it('ação de status inválida responde 400 listando as opções', async () => {
    const resposta = await comToken(api().patch('/api/jogos/1/status')).send({ acao: 'pausar' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].mensagem).toMatch(/iniciar, intervalo/);
  });

  it('data e horário em formato errado respondem 400', async () => {
    const resposta = await comToken(api().patch('/api/jogos/1/confronto')).send({ data: '2026-02-30', horario: '25:00' });
    expect(resposta.status).toBe(400);
    const campos = resposta.body.detalhes.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['data', 'horario']));
  });

  it('campo não permitido é rejeitado (não dá para mudar o placar pelo PATCH)', async () => {
    const resposta = await comToken(api().patch('/api/jogos/1')).send({ placar_a: 10 });
    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes[0].mensagem).toMatch(/não permitido/);
  });

  it('escudo aceita link https ou arquivo da pasta escudos/, e recusa o resto', async () => {
    const editar = (escudo) => comToken(api().patch('/api/equipes/1')).send({ escudo_url: escudo });

    expect((await editar('escudos/101.png')).body.escudo_url).toBe('escudos/101.png');
    expect((await editar('https://exemplo.com/101.png')).status).toBe(200);
    expect((await editar(null)).body.escudo_url).toBeNull();

    for (const invalido of ['101.png', '../segredo.png', 'escudos/../x.png', 'javascript:alert(1)']) {
      const resposta = await editar(invalido);
      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes[0].mensagem).toMatch(/Escudo inválido/);
    }
  });

  it('filtro de data aceita só AAAA-MM-DD ou "sem"', async () => {
    expect((await api().get('/api/jogos?data=amanha')).status).toBe(400);
    expect((await api().get('/api/jogos?data=sem')).status).toBe(200);
  });

  it('JSON malformado responde 400 sem vazar detalhes', async () => {
    const resposta = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'JSON inválido no corpo da requisição' });
  });
});
