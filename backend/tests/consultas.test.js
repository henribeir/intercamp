// ============================================================
// Ranking, chaveamento e notícias pela API (banco em memória)
// ============================================================
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { api, entrarComoMestre, encerrarBanco, reiniciarBanco, idDoJogo, idDaEquipe, comoMestre } from './ajudantes.js';

let mestre;

beforeAll(async () => {
  await reiniciarBanco();
  mestre = comoMestre(await entrarComoMestre());
});
beforeEach(reiniciarBanco);
afterAll(encerrarBanco);

describe('GET /api/ranking', () => {
  it('ranking geral: as 9 turmas, sem saldo, todas em disputa no início', async () => {
    const resposta = await api().get('/api/ranking');
    expect(resposta.status).toBe(200);
    expect(resposta.body.competicao).toBeNull();
    expect(resposta.body.pontuacao).toEqual({ vitoria: 3, derrota: 0 });
    expect(resposta.body.classificacao).toHaveLength(9);
    expect(resposta.body.classificacao.every((l) => l.saldo === null && l.situacao === 'em_disputa')).toBe(true);
  });

  it('ranking de uma competição traz saldo e só as turmas dela', async () => {
    const jogo = await idDoJogo('handebol-masculino', 1);
    await mestre.status(jogo, 'iniciar');
    await mestre.gol(jogo, await idDaEquipe('300 INT'));
    await mestre.gol(jogo, await idDaEquipe('300 INT'));
    await mestre.status(jogo, 'encerrar');

    const resposta = await api().get('/api/ranking?competicao=handebol-masculino');
    const linhas = resposta.body.classificacao;
    expect(resposta.body.competicao.nome).toBe('Handebol Masculino');
    expect(linhas).toHaveLength(4); // 201 INT, 300 INT, 101, 102
    expect(linhas[0]).toMatchObject({ posicao: 1, pontos: 3, saldo: 2, situacao: 'em_disputa' });
    expect(linhas[0].equipe.nome).toBe('300 INT');
    expect(linhas.find((l) => l.equipe.nome === '201 INT').situacao).toBe('eliminada');
  });

  it('competição inexistente responde 404', async () => {
    expect((await api().get('/api/ranking?competicao=xadrez')).status).toBe(404);
  });
});

describe('GET /api/competicoes/:slug/chaveamento', () => {
  it('Futsal Masculino: 4 rodadas em ordem, com rótulos e origens', async () => {
    const resposta = await api().get('/api/competicoes/futsal-masculino/chaveamento');
    expect(resposta.status).toBe(200);

    const { rodadas, campeao } = resposta.body;
    expect(campeao).toBeNull();
    expect(rodadas.map((r) => r.rotulo)).toEqual(['1ª Fase', '2ª Fase', '3ª Fase', 'Final']);
    expect(rodadas[0].jogos.map((j) => j.numero)).toEqual([1, 2, 3, 4, 5]);

    const final = rodadas[3].jogos[0];
    expect(final).toMatchObject({ numero: 10, eh_final: true, rotulo_a: 'Vencedor - direto', origem_b_numero: 9 });
  });

  it('competição inexistente responde 404', async () => {
    expect((await api().get('/api/competicoes/xadrez/chaveamento')).status).toBe(404);
  });
});

describe('notícias', () => {
  it('lista pública, mais recente primeiro', async () => {
    const resposta = await api().get('/api/noticias');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(3);
    expect(resposta.body[0].destaque).toBe(true);
  });

  it('mestre cria, edita e exclui', async () => {
    const criada = await mestre.post('/api/noticias', { titulo: 'Final do Handebol hoje!', resumo: 'Às 19h30.' });
    expect(criada.status).toBe(201);
    expect(criada.body.destaque).toBe(false);

    const editada = await mestre.patch(`/api/noticias/${criada.body.id}`, { destaque: true });
    expect(editada.body.destaque).toBe(true);

    expect((await api().get(`/api/noticias/${criada.body.id}`)).body.titulo).toBe('Final do Handebol hoje!');
    expect((await mestre.delete(`/api/noticias/${criada.body.id}`)).status).toBe(204);
    expect((await api().get(`/api/noticias/${criada.body.id}`)).status).toBe(404);
  });

  it('valida título obrigatório e data ISO', async () => {
    const resposta = await mestre.post('/api/noticias', { publicada_em: '05/11/2026' });
    expect(resposta.status).toBe(400);
    const campos = resposta.body.detalhes.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['titulo', 'publicada_em']));
  });
});
