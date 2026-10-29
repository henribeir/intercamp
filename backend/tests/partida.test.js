// ============================================================
// Andamento das partidas e regras do mata-mata
// (API completa com o banco em memória e a tabela oficial)
// ============================================================
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import {
  api, query, entrarComoMestre, encerrarBanco, reiniciarBanco,
  idDoJogo, idDaEquipe, comoMestre,
} from './ajudantes.js';

let mestre;

beforeAll(async () => {
  await reiniciarBanco();
  mestre = comoMestre(await entrarComoMestre());
});

// Cada teste começa com a tabela oficial intacta
beforeEach(reiniciarBanco);

afterAll(encerrarBanco);

describe('iniciar jogo', () => {
  it('não inicia jogo com vaga "a definir" (Futsal M, jogo 8)', async () => {
    const resposta = await mestre.status(await idDoJogo('futsal-masculino', 8), 'iniciar');
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toMatch(/a definir/);
  });

  it('não inicia a final do Handebol antes de J1 e J2 terminarem', async () => {
    const resposta = await mestre.status(await idDoJogo('handebol-masculino', 3), 'iniciar');
    expect(resposta.status).toBe(409);
  });

  it('inicia jogo com as duas turmas definidas: ao vivo, 1º tempo, evento "inicio"', async () => {
    const resposta = await mestre.status(await idDoJogo('handebol-masculino', 1), 'iniciar');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ status: 'ao_vivo', periodo: '1º tempo', minuto: 0 });
    expect(resposta.body.eventos[0].tipo).toBe('inicio');
  });
});

describe('gols', () => {
  it('gol incrementa o placar e desfazer decrementa', async () => {
    const jogo = await idDoJogo('handebol-masculino', 1);
    const turma201 = await idDaEquipe('201 INT');
    await mestre.status(jogo, 'iniciar');

    await mestre.gol(jogo, turma201);
    const depoisDoGol = await mestre.gol(jogo, turma201);
    expect(depoisDoGol.body.placar_a).toBe(2);
    expect(depoisDoGol.body.estatisticas.a.gols).toBe(2);

    const golId = depoisDoGol.body.eventos[0].id;
    const desfeito = await mestre.delete(`/api/jogos/${jogo}/eventos/${golId}`);
    expect(desfeito.status).toBe(200);
    expect(desfeito.body.placar_a).toBe(1);
  });

  it('desfazer gol nunca deixa o placar negativo', async () => {
    const jogo = await idDoJogo('handebol-masculino', 1);
    await mestre.status(jogo, 'iniciar');
    const resposta = await mestre.gol(jogo, await idDaEquipe('300 INT'));
    const golId = resposta.body.eventos[0].id;

    // Simula um placar corrigido à mão para 0 com o evento ainda lá
    await query('UPDATE jogos SET placar_b = 0 WHERE id = $1', [jogo]);

    const desfeito = await mestre.delete(`/api/jogos/${jogo}/eventos/${golId}`);
    expect(desfeito.body.placar_b).toBe(0);
  });

  it('gol de turma que não está no jogo responde 400', async () => {
    const jogo = await idDoJogo('handebol-masculino', 1);
    await mestre.status(jogo, 'iniciar');
    const resposta = await mestre.gol(jogo, await idDaEquipe('101'));
    expect(resposta.status).toBe(400);
  });
});

describe('encerrar', () => {
  it('empate em jogo de gols sem vencedor_id é rejeitado', async () => {
    const jogo = await idDoJogo('handebol-masculino', 2);
    await mestre.status(jogo, 'iniciar');

    const semVencedor = await mestre.status(jogo, 'encerrar');
    expect(semVencedor.status).toBe(400);
    expect(semVencedor.body.erro).toMatch(/empatado/);

    const comVencedor = await mestre.status(jogo, 'encerrar', { vencedor_id: await idDaEquipe('102') });
    expect(comVencedor.status).toBe(200);
    expect(comVencedor.body.status).toBe('encerrado');
  });

  it('vencedor_id que contradiz o placar é rejeitado', async () => {
    const jogo = await idDoJogo('handebol-masculino', 1);
    await mestre.status(jogo, 'iniciar');
    await mestre.gol(jogo, await idDaEquipe('201 INT'));

    const resposta = await mestre.status(jogo, 'encerrar', { vencedor_id: await idDaEquipe('300 INT') });
    expect(resposta.status).toBe(400);
  });

  it('vencedores de J1 e J2 do Handebol vão para as vagas A e B da final (J3)', async () => {
    const [j1, j2, j3] = [
      await idDoJogo('handebol-masculino', 1),
      await idDoJogo('handebol-masculino', 2),
      await idDoJogo('handebol-masculino', 3),
    ];
    const turma300 = await idDaEquipe('300 INT');
    const turma101 = await idDaEquipe('101');

    // J1: 201 INT x 300 INT -> vence 300 INT (lado B do J1)
    await mestre.status(j1, 'iniciar');
    await mestre.gol(j1, turma300);
    await mestre.status(j1, 'encerrar');

    let final = await api().get(`/api/jogos/${j3}`);
    expect(final.body.equipe_a.nome).toBe('300 INT'); // origem_a = J1
    expect(final.body.equipe_b).toBeNull();
    expect(final.body.rotulo_b).toBe('Vencedor do jogo 2');

    // J2: 101 x 102 -> vence 101 (lado A do J2)
    await mestre.status(j2, 'iniciar');
    await mestre.gol(j2, turma101);
    await mestre.status(j2, 'encerrar');

    final = await api().get(`/api/jogos/${j3}`);
    expect(final.body.equipe_a.id).toBe(turma300);
    expect(final.body.equipe_b.id).toBe(turma101); // origem_b = J2
  });

  it('encerrar a final grava campeão e vice da competição', async () => {
    const [j1, j2, j3] = [
      await idDoJogo('handebol-masculino', 1),
      await idDoJogo('handebol-masculino', 2),
      await idDoJogo('handebol-masculino', 3),
    ];
    const turma201 = await idDaEquipe('201 INT');
    const turma102 = await idDaEquipe('102');

    await mestre.status(j1, 'iniciar');
    await mestre.gol(j1, turma201);
    await mestre.status(j1, 'encerrar');
    await mestre.status(j2, 'iniciar');
    await mestre.status(j2, 'encerrar', { vencedor_id: turma102 }); // 0 x 0, 102 nos pênaltis

    await mestre.status(j3, 'iniciar');
    await mestre.gol(j3, turma102);
    await mestre.gol(j3, turma102);
    await mestre.status(j3, 'encerrar');

    const competicoes = await api().get('/api/competicoes');
    const handebol = competicoes.body.find((c) => c.slug === 'handebol-masculino');
    expect(handebol.campeao.nome).toBe('102');
    expect(handebol.vice.nome).toBe('201 INT');
  });
});

describe('reabrir', () => {
  it('é bloqueado quando o jogo seguinte já começou', async () => {
    const [j1, j2, j3] = [
      await idDoJogo('handebol-masculino', 1),
      await idDoJogo('handebol-masculino', 2),
      await idDoJogo('handebol-masculino', 3),
    ];
    await mestre.status(j1, 'iniciar');
    await mestre.gol(j1, await idDaEquipe('201 INT'));
    await mestre.status(j1, 'encerrar');
    await mestre.status(j2, 'iniciar');
    await mestre.gol(j2, await idDaEquipe('101'));
    await mestre.status(j2, 'encerrar');
    await mestre.status(j3, 'iniciar'); // a final começou

    const resposta = await mestre.status(j1, 'reabrir');
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toMatch(/já começou/);
  });

  it('com o jogo seguinte ainda agendado, reabre e limpa a vaga preenchida', async () => {
    const [j1, j3] = [await idDoJogo('handebol-masculino', 1), await idDoJogo('handebol-masculino', 3)];
    await mestre.status(j1, 'iniciar');
    await mestre.gol(j1, await idDaEquipe('201 INT'));
    await mestre.status(j1, 'encerrar');

    const reaberto = await mestre.status(j1, 'reabrir');
    expect(reaberto.status).toBe(200);
    expect(reaberto.body.status).toBe('ao_vivo');
    expect(reaberto.body.vencedor_id).toBeNull();

    const final = await api().get(`/api/jogos/${j3}`);
    expect(final.body.equipe_a).toBeNull();
    expect(final.body.rotulo_a).toBe('Vencedor do jogo 1');
  });
});

describe('vôlei', () => {
  it('Vôlei de Praia F: 2 sets de 21 deixam o jogo pronto e a final dá o título', async () => {
    const jogo = await idDoJogo('volei-praia-feminino', 1);
    await mestre.status(jogo, 'iniciar');

    let resposta;
    for (let ponto = 0; ponto < 42; ponto += 1) {
      resposta = await mestre.post(`/api/jogos/${jogo}/pontos`, { time: 'A', delta: 1 });
    }
    expect(resposta.body.placar_a).toBe(2);
    expect(resposta.body.pronto_para_encerrar).toBe(true);
    expect(resposta.body.set_atual).toBeNull(); // jogo decidido: nenhum set aberto

    const encerrado = await mestre.status(jogo, 'encerrar');
    expect(encerrado.body.vencedor_id).toBe(await idDaEquipe('102'));

    const chaveamento = await api().get('/api/competicoes/volei-praia-feminino/chaveamento');
    expect(chaveamento.body.campeao.nome).toBe('102');
  });

  it('não encerra vôlei antes de alguém vencer 2 sets', async () => {
    const jogo = await idDoJogo('volei-praia-feminino', 1);
    await mestre.status(jogo, 'iniciar');
    const resposta = await mestre.status(jogo, 'encerrar');
    expect(resposta.status).toBe(409);
  });

  it('a lista de jogos traz o set em andamento (para o card)', async () => {
    const jogo = await idDoJogo('volei-praia-feminino', 1);
    await mestre.status(jogo, 'iniciar');
    for (let ponto = 0; ponto < 21; ponto += 1) await mestre.post(`/api/jogos/${jogo}/pontos`, { time: 'A', delta: 1 });
    await mestre.post(`/api/jogos/${jogo}/pontos`, { time: 'B', delta: 1 });

    const lista = await api().get('/api/jogos?competicao=volei-praia-feminino');
    expect(lista.body[0].set_atual).toEqual({ numero: 2, pontos_a: 0, pontos_b: 1 });
    expect(lista.body[0].placar_a).toBe(1);

    const futsal = await api().get('/api/jogos?competicao=futsal-masculino');
    expect(futsal.body[0].set_atual).toBeNull();
  });
});
