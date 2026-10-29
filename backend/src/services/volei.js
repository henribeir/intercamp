// ============================================================
// REGRAS DO VÔLEI em funções PURAS:
// não acessam banco nem rede; recebem dados e devolvem dados.
// Por isso são fáceis de testar (veja tests/volei.test.js).
//
// Formato de um set:  { numero, pontos_a, pontos_b, encerrado }
// Formato das regras: { setsParaVencer, pontosPorSet, pontosSetDecisivo }
// ============================================================

/** Erro de regra do vôlei (o service transforma em resposta HTTP 409). */
export class ErroRegraVolei extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroRegraVolei';
  }
}

/** Quantidade máxima de sets. Ex.: melhor de 3 -> 2 para vencer -> 3 sets. */
export function totalDeSets(regras) {
  return regras.setsParaVencer * 2 - 1;
}

/** O set decisivo (tie-break) é o último possível. */
export function ehSetDecisivo(numeroSet, regras) {
  return numeroSet === totalDeSets(regras);
}

/** Pontos necessários para fechar este set (25/21, ou 15 no decisivo). */
export function pontosParaFecharSet(numeroSet, regras) {
  return ehSetDecisivo(numeroSet, regras) ? regras.pontosSetDecisivo : regras.pontosPorSet;
}

/** Um set termina quando alguém atinge o alvo com 2 pontos de vantagem. */
export function setTerminou(set, regras) {
  const alvo = pontosParaFecharSet(set.numero, regras);
  const maior = Math.max(set.pontos_a, set.pontos_b);
  const diferenca = Math.abs(set.pontos_a - set.pontos_b);
  return maior >= alvo && diferenca >= 2;
}

/** Conta quantos sets cada time já venceu (só sets encerrados). */
export function contarSetsVencidos(sets) {
  const placar = { a: 0, b: 0 };
  for (const set of sets) {
    if (!set.encerrado) continue;
    if (set.pontos_a > set.pontos_b) placar.a += 1;
    else placar.b += 1;
  }
  return placar;
}

/** Devolve 'A', 'B' ou null (ninguém chegou ao número de sets para vencer). */
export function vencedorPorSets(placar, regras) {
  if (placar.a >= regras.setsParaVencer) return 'A';
  if (placar.b >= regras.setsParaVencer) return 'B';
  return null;
}

function novoSet(numero) {
  return { numero, pontos_a: 0, pontos_b: 0, encerrado: false };
}

/**
 * Aplica um ponto (delta = 1) ou desfaz um ponto (delta = -1) para o time 'A' ou 'B'.
 * Não altera a lista recebida: devolve uma lista NOVA.
 *
 * - Ponto que fecha o set: marca o set como encerrado e abre o próximo
 *   (a não ser que o jogo já tenha um vencedor).
 * - Desfazer logo após um set fechar: remove o set vazio que foi aberto
 *   e reabre o set anterior.
 *
 * @returns {{ sets, placar: {a, b}, vencedor: 'A'|'B'|null, prontoParaEncerrar: boolean }}
 */
export function aplicarPonto(setsAtuais, regras, time, delta) {
  if (time !== 'A' && time !== 'B') throw new ErroRegraVolei('Time deve ser "A" ou "B"');
  if (delta !== 1 && delta !== -1) throw new ErroRegraVolei('delta deve ser 1 ou -1');

  const sets = setsAtuais.map((set) => ({ ...set })); // cópia
  const campo = time === 'A' ? 'pontos_a' : 'pontos_b';

  if (delta === 1) {
    if (vencedorPorSets(contarSetsVencidos(sets), regras)) {
      throw new ErroRegraVolei('O jogo já tem vencedor. Encerre a partida (ou desfaça o último ponto).');
    }
    // Se não há set aberto, abre um novo
    let atual = sets.at(-1);
    if (!atual || atual.encerrado) {
      atual = novoSet(sets.length + 1);
      sets.push(atual);
    }
    atual[campo] += 1;
  } else {
    // Set vazio aberto automaticamente? Descarta e volta para o anterior
    const ultimo = sets.at(-1);
    if (ultimo && !ultimo.encerrado && ultimo.pontos_a === 0 && ultimo.pontos_b === 0 && sets.length > 1) {
      sets.pop();
    }
    const atual = sets.at(-1);
    if (!atual || atual[campo] === 0) {
      throw new ErroRegraVolei(`Não há ponto do time ${time} para desfazer neste set`);
    }
    atual[campo] -= 1;
  }

  // Recalcula a situação do set que mudou (sempre o último da lista)
  const setAlterado = sets.at(-1);
  setAlterado.encerrado = setTerminou(setAlterado, regras);

  const placar = contarSetsVencidos(sets);
  const vencedor = vencedorPorSets(placar, regras);

  // Set fechou e o jogo continua: abre o próximo set
  if (setAlterado.encerrado && !vencedor) {
    sets.push(novoSet(setAlterado.numero + 1));
  }

  return { sets, placar, vencedor, prontoParaEncerrar: vencedor !== null };
}
