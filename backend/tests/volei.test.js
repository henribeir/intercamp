// ============================================================
// Testes das regras do vôlei (funções puras, sem banco)
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  aplicarPonto, setTerminou, pontosParaFecharSet, totalDeSets,
  contarSetsVencidos, vencedorPorSets, ErroRegraVolei,
} from '../src/services/volei.js';

const QUADRA = { setsParaVencer: 2, pontosPorSet: 25, pontosSetDecisivo: 15 };
const PRAIA = { setsParaVencer: 2, pontosPorSet: 21, pontosSetDecisivo: 15 };

const set = (numero, pontos_a, pontos_b, encerrado = false) => ({ numero, pontos_a, pontos_b, encerrado });

/** Marca vários pontos seguidos para um time */
function marcar(sets, regras, time, vezes) {
  let resultado = { sets };
  for (let i = 0; i < vezes; i += 1) resultado = aplicarPonto(resultado.sets, regras, time, 1);
  return resultado;
}

describe('regras básicas', () => {
  it('melhor de 3: 3 sets no máximo, o 3º é o decisivo (15 pontos)', () => {
    expect(totalDeSets(QUADRA)).toBe(3);
    expect(pontosParaFecharSet(1, QUADRA)).toBe(25);
    expect(pontosParaFecharSet(3, QUADRA)).toBe(15);
    expect(pontosParaFecharSet(2, PRAIA)).toBe(21);
  });

  it('set só termina com o alvo E 2 pontos de vantagem', () => {
    expect(setTerminou(set(1, 25, 23), QUADRA)).toBe(true);
    expect(setTerminou(set(1, 25, 24), QUADRA)).toBe(false);
    expect(setTerminou(set(1, 27, 25), QUADRA)).toBe(true);
    expect(setTerminou(set(3, 15, 10), QUADRA)).toBe(true);
    expect(setTerminou(set(1, 21, 19), PRAIA)).toBe(true);
  });

  it('conta sets vencidos e define o vencedor', () => {
    const placar = contarSetsVencidos([set(1, 25, 20, true), set(2, 18, 25, true), set(3, 15, 9, true)]);
    expect(placar).toEqual({ a: 2, b: 1 });
    expect(vencedorPorSets(placar, QUADRA)).toBe('A');
    expect(vencedorPorSets({ a: 1, b: 1 }, QUADRA)).toBeNull();
  });
});

describe('aplicarPonto', () => {
  it('cria o 1º set se ainda não existir', () => {
    const r = aplicarPonto([], QUADRA, 'A', 1);
    expect(r.sets).toEqual([set(1, 1, 0)]);
  });

  it('não altera a lista original (função pura)', () => {
    const original = [set(1, 3, 2)];
    aplicarPonto(original, QUADRA, 'B', 1);
    expect(original).toEqual([set(1, 3, 2)]);
  });

  it('fecha o set no 25º ponto com vantagem e abre o próximo', () => {
    const r = aplicarPonto([set(1, 24, 20)], QUADRA, 'A', 1);
    expect(r.sets).toEqual([set(1, 25, 20, true), set(2, 0, 0)]);
    expect(r.placar).toEqual({ a: 1, b: 0 });
    expect(r.prontoParaEncerrar).toBe(false);
  });

  it('em 24 x 24 o set continua (precisa de 2 de vantagem)', () => {
    const r = aplicarPonto([set(1, 24, 24)], QUADRA, 'A', 1);
    expect(r.sets).toEqual([set(1, 25, 24)]);
  });

  it('no set decisivo bastam 15 pontos', () => {
    const r = aplicarPonto([set(1, 25, 20, true), set(2, 20, 25, true), set(3, 14, 10)], QUADRA, 'A', 1);
    expect(r.sets.at(-1)).toEqual(set(3, 15, 10, true));
    expect(r.vencedor).toBe('A');
    expect(r.prontoParaEncerrar).toBe(true);
    expect(r.sets).toHaveLength(3); // não abre um 4º set
  });

  it('jogo completo 2 x 0 na praia', () => {
    let r = marcar([], PRAIA, 'B', 21);
    expect(r.placar).toEqual({ a: 0, b: 1 });
    r = marcar(r.sets, PRAIA, 'B', 21);
    expect(r.vencedor).toBe('B');
    expect(r.prontoParaEncerrar).toBe(true);
  });

  it('não aceita ponto depois que o jogo tem vencedor', () => {
    const decidido = [set(1, 25, 10, true), set(2, 25, 10, true)];
    expect(() => aplicarPonto(decidido, QUADRA, 'A', 1)).toThrow(ErroRegraVolei);
  });

  it('desfaz um ponto no set atual', () => {
    const r = aplicarPonto([set(1, 10, 8)], QUADRA, 'B', -1);
    expect(r.sets).toEqual([set(1, 10, 7)]);
  });

  it('desfazer o ponto que fechou o set reabre o set e remove o set vazio', () => {
    const fechou = aplicarPonto([set(1, 24, 20)], QUADRA, 'A', 1);
    const desfeito = aplicarPonto(fechou.sets, QUADRA, 'A', -1);
    expect(desfeito.sets).toEqual([set(1, 24, 20)]);
    expect(desfeito.placar).toEqual({ a: 0, b: 0 });
  });

  it('desfazer o último ponto de um jogo decidido tira o "pronto para encerrar"', () => {
    const decidido = [set(1, 25, 10, true), set(2, 25, 10, true)];
    const r = aplicarPonto(decidido, QUADRA, 'A', -1);
    expect(r.sets.at(-1)).toEqual(set(2, 24, 10));
    expect(r.prontoParaEncerrar).toBe(false);
  });

  it('não deixa desfazer ponto que não existe', () => {
    expect(() => aplicarPonto([set(1, 0, 3)], QUADRA, 'A', -1)).toThrow(ErroRegraVolei);
    expect(() => aplicarPonto([], QUADRA, 'A', -1)).toThrow(ErroRegraVolei);
  });
});
