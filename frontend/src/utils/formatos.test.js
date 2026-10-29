// ============================================================
// Cálculo do minuto do jogo (mesma regra do back-end)
// ============================================================
import { describe, it, expect } from 'vitest';
import { calcularMinuto, textoAoVivo } from './formatos';
import { criarJogo, VOLEI } from '../testes/dados';

const INICIO = '2026-05-20T19:30:00Z';
const depoisDe = (minutos, segundos = 0) => new Date(Date.parse(INICIO) + (minutos * 60 + segundos) * 1000);

describe('calcularMinuto', () => {
  const aoVivo = criarJogo({ status: 'ao_vivo', periodo: '1º tempo', periodo_iniciado_em: INICIO });

  it('conta os minutos completos desde o início do período', () => {
    expect(calcularMinuto(aoVivo, depoisDe(0, 30))).toBe(0);
    expect(calcularMinuto(aoVivo, depoisDe(12, 40))).toBe(12);
    expect(calcularMinuto(aoVivo, depoisDe(20))).toBe(20);
  });

  it('no 2º tempo recomeça a contagem a partir do início do período', () => {
    const segundoTempo = { ...aoVivo, periodo: '2º tempo' };
    expect(calcularMinuto(segundoTempo, depoisDe(3, 5))).toBe(3);
  });

  it('nunca fica negativo (relógio do celular adiantado/atrasado)', () => {
    expect(calcularMinuto(aoVivo, new Date(Date.parse(INICIO) - 60000))).toBe(0);
  });

  it('é null no intervalo, antes de começar e depois do fim', () => {
    expect(calcularMinuto({ ...aoVivo, periodo: 'intervalo' }, depoisDe(5))).toBeNull();
    expect(calcularMinuto(criarJogo(), depoisDe(5))).toBeNull();
    expect(calcularMinuto({ ...aoVivo, status: 'encerrado', periodo: 'fim' }, depoisDe(5))).toBeNull();
  });
});

describe('textoAoVivo', () => {
  it('gols: "1º TEMPO · 12\'" e "INTERVALO"', () => {
    const jogo = criarJogo({ status: 'ao_vivo', periodo: '1º tempo', periodo_iniciado_em: INICIO });
    expect(textoAoVivo(jogo, depoisDe(12, 40))).toBe("1º TEMPO · 12'");
    expect(textoAoVivo({ ...jogo, periodo: 'intervalo' }, depoisDe(25))).toBe('INTERVALO');
  });

  it('vôlei: mostra o set atual', () => {
    const jogo = criarJogo({ competicao: VOLEI, status: 'ao_vivo', set_atual: { numero: 2, pontos_a: 14, pontos_b: 11 } });
    expect(textoAoVivo(jogo)).toBe('Set 2 · 14 x 11');
  });
});
