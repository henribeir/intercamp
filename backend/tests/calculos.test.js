// ============================================================
// Testes do minuto do relógio e das estatísticas (funções puras)
// ============================================================
import { describe, it, expect } from 'vitest';
import { calcularMinuto, contarEstatisticas } from '../src/services/calculos.js';

describe('calcularMinuto', () => {
  const inicio = new Date('2026-05-20T19:30:00Z');

  it('conta os minutos completos desde o início do período', () => {
    const jogo = { status: 'ao_vivo', periodo: '1º tempo', periodo_iniciado_em: inicio };
    expect(calcularMinuto(jogo, new Date('2026-05-20T19:42:40Z'))).toBe(12);
  });

  it('é null no intervalo, antes do início e depois do fim', () => {
    const agora = new Date('2026-05-20T19:42:00Z');
    expect(calcularMinuto({ status: 'ao_vivo', periodo: 'intervalo', periodo_iniciado_em: inicio }, agora)).toBeNull();
    expect(calcularMinuto({ status: 'agendado', periodo: null, periodo_iniciado_em: null }, agora)).toBeNull();
    expect(calcularMinuto({ status: 'encerrado', periodo: 'fim', periodo_iniciado_em: inicio }, agora)).toBeNull();
  });
});

describe('contarEstatisticas', () => {
  it('conta por equipe; gol também é finalização no alvo', () => {
    const eventos = [
      { tipo: 'inicio', equipe_id: null },
      { tipo: 'gol', equipe_id: 1 },
      { tipo: 'finalizacao', equipe_id: 1 },
      { tipo: 'finalizacao_alvo', equipe_id: 2 },
      { tipo: 'falta', equipe_id: 2 },
      { tipo: 'cartao_amarelo', equipe_id: 2 },
      { tipo: 'cartao_vermelho', equipe_id: 1 },
    ];
    const resultado = contarEstatisticas(eventos, 1, 2);

    expect(resultado.a).toEqual({
      gols: 1, finalizacoes: 2, finalizacoes_alvo: 1, faltas: 0, cartoes_amarelos: 0, cartoes_vermelhos: 1,
    });
    expect(resultado.b).toEqual({
      gols: 0, finalizacoes: 1, finalizacoes_alvo: 1, faltas: 1, cartoes_amarelos: 1, cartoes_vermelhos: 0,
    });
  });
});
