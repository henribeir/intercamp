// ============================================================
// Testes do ranking (funções puras, sem banco)
// ============================================================
import { describe, it, expect } from 'vitest';
import { calcularRanking, definirSituacao } from '../src/services/ranking.js';

// Turmas de exemplo
const T101 = { id: 1, nome: '101' };
const T102 = { id: 2, nome: '102' };
const T103 = { id: 3, nome: '103' };
const T301 = { id: 9, nome: '301 INT' };

/** Jogo encerrado: quem vence leva placar maior */
function encerrado(competicaoId, a, b, placarA, placarB, vencedor = placarA > placarB ? a : b) {
  return { competicao_id: competicaoId, status: 'encerrado', equipe_a_id: a, equipe_b_id: b, placar_a: placarA, placar_b: placarB, vencedor_id: vencedor };
}
function agendado(competicaoId, a, b) {
  return { competicao_id: competicaoId, status: 'agendado', equipe_a_id: a, equipe_b_id: b, placar_a: 0, placar_b: 0, vencedor_id: null };
}
const nomes = (classificacao) => classificacao.map((linha) => linha.equipe.nome);

describe('pontos, jogos e saldo', () => {
  const competicoes = [{ id: 10, campeao_id: null }];
  const jogos = [encerrado(10, 1, 2, 3, 1), encerrado(10, 1, 3, 2, 0), agendado(10, 1, 9)];

  it('vitória vale 3 e derrota 0 por padrão; jogo agendado não conta', () => {
    const [primeiro] = calcularRanking({ equipes: [T101, T102, T103, T301], competicoes, jogos });
    expect(primeiro).toMatchObject({ posicao: 1, pontos: 6, jogos: 2, vitorias: 2, derrotas: 0 });
  });

  it('usa a pontuação do torneio quando informada', () => {
    const ranking = calcularRanking({
      equipes: [T101, T102, T103],
      competicoes,
      jogos,
      pontuacao: { vitoria: 2, derrota: 1 },
    });
    expect(ranking.find((l) => l.equipe.id === 1).pontos).toBe(4);
    expect(ranking.find((l) => l.equipe.id === 2).pontos).toBe(1);
  });

  it('saldo (SG) só aparece no ranking de uma competição', () => {
    const geral = calcularRanking({ equipes: [T101, T102], competicoes, jogos });
    expect(geral[0].saldo).toBeNull();

    const porCompeticao = calcularRanking({ equipes: [T101, T102, T103], competicoes, jogos, porCompeticao: true });
    expect(porCompeticao.find((l) => l.equipe.id === 1).saldo).toBe(4); // (3-1) + (2-0)
    expect(porCompeticao.find((l) => l.equipe.id === 2).saldo).toBe(-2);
  });

  it('ranking de competição lista só quem participa dela', () => {
    const ranking = calcularRanking({
      equipes: [T101, T102, T103, T301, { id: 50, nome: 'Fora' }],
      competicoes,
      jogos,
      porCompeticao: true,
    });
    expect(nomes(ranking)).not.toContain('Fora');
    expect(ranking).toHaveLength(4);
  });

  it('empate nos pênaltis: placar igual, mas vitória de quem vence o desempate', () => {
    const [primeiro] = calcularRanking({
      equipes: [T101, T102],
      competicoes,
      jogos: [encerrado(10, 1, 2, 1, 1, 2)],
      porCompeticao: true,
    });
    expect(primeiro).toMatchObject({ equipe: T102, vitorias: 1, saldo: 0 });
  });
});

describe('desempate: pontos, vitórias, títulos, nome', () => {
  it('mais pontos fica na frente', () => {
    const ranking = calcularRanking({
      equipes: [T101, T102],
      competicoes: [{ id: 10, campeao_id: null }],
      jogos: [encerrado(10, 2, 1, 1, 0)],
    });
    expect(nomes(ranking)).toEqual(['102', '101']);
  });

  it('pontos iguais: mais vitórias fica na frente', () => {
    // vitória = 3, derrota = 1: 102 (1V) e 103 (3D) somam 3 pontos
    const ranking = calcularRanking({
      equipes: [T102, T103, T101, T301],
      competicoes: [{ id: 10, campeao_id: null }, { id: 11, campeao_id: null }, { id: 12, campeao_id: null }],
      jogos: [encerrado(10, 2, 1, 1, 0), encerrado(10, 9, 3, 1, 0), encerrado(11, 9, 3, 1, 0), encerrado(12, 9, 3, 1, 0)],
      pontuacao: { vitoria: 3, derrota: 1 },
    });
    const posicao = (nome) => ranking.find((l) => l.equipe.nome === nome).posicao;
    expect(ranking.find((l) => l.equipe.nome === '102').pontos).toBe(ranking.find((l) => l.equipe.nome === '103').pontos);
    expect(posicao('102')).toBeLessThan(posicao('103'));
  });

  it('pontos e vitórias iguais: mais títulos fica na frente', () => {
    const ranking = calcularRanking({
      equipes: [T101, T102, T103, T301],
      competicoes: [{ id: 10, campeao_id: 2 }, { id: 11, campeao_id: null }],
      jogos: [encerrado(10, 2, 3, 1, 0), encerrado(11, 1, 9, 1, 0)],
    });
    expect(nomes(ranking).slice(0, 2)).toEqual(['102', '101']);
    expect(ranking[0].titulos).toBe(1);
  });

  it('tudo igual: ordem alfabética do nome, com números em ordem natural', () => {
    const ranking = calcularRanking({
      equipes: [T301, T103, T101, T102],
      competicoes: [],
      jogos: [],
    });
    expect(nomes(ranking)).toEqual(['101', '102', '103', '301 INT']);
    expect(ranking.map((l) => l.posicao)).toEqual([1, 2, 3, 4]);
  });
});

describe('situação da turma', () => {
  it('"campea" quando tem título', () => {
    const competicoes = [{ id: 10, campeao_id: 1 }];
    expect(definirSituacao(1, competicoes, [encerrado(10, 1, 2, 2, 0)], 1)).toBe('campea');
  });

  it('"em_disputa" quando tem jogo agendado', () => {
    const competicoes = [{ id: 10, campeao_id: null }];
    expect(definirSituacao(1, competicoes, [agendado(10, 1, 2)], 0)).toBe('em_disputa');
  });

  it('"em_disputa" quando venceu e a próxima vaga ainda não foi definida (sem derrota)', () => {
    const competicoes = [{ id: 10, campeao_id: null }];
    expect(definirSituacao(1, competicoes, [encerrado(10, 1, 2, 3, 0)], 0)).toBe('em_disputa');
  });

  it('"eliminada" quando perdeu em todas as competições em que estava', () => {
    const competicoes = [{ id: 10, campeao_id: null }, { id: 11, campeao_id: 3 }];
    const jogos = [encerrado(10, 1, 2, 0, 1), encerrado(11, 1, 3, 0, 2)];
    expect(definirSituacao(1, competicoes, jogos, 0)).toBe('eliminada');
  });

  it('"eliminada" numa competição, mas viva em outra = "em_disputa"', () => {
    const competicoes = [{ id: 10, campeao_id: null }, { id: 11, campeao_id: null }];
    const jogos = [encerrado(10, 1, 2, 0, 1), agendado(11, 1, 3)];
    expect(definirSituacao(1, competicoes, jogos, 0)).toBe('em_disputa');
  });

  it('calcularRanking devolve a situação em cada linha', () => {
    const ranking = calcularRanking({
      equipes: [T101, T102, T103],
      competicoes: [{ id: 10, campeao_id: 2 }, { id: 11, campeao_id: null }],
      jogos: [encerrado(10, 2, 1, 2, 0), agendado(11, 3, 1)],
    });
    const situacao = Object.fromEntries(ranking.map((l) => [l.equipe.nome, l.situacao]));
    expect(situacao).toEqual({ 102: 'campea', 101: 'em_disputa', 103: 'em_disputa' });
  });
});
