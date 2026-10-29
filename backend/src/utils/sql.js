// ============================================================
// Pequenos ajudantes para montar SQL.
// ============================================================

/**
 * Monta o trecho "coluna1 = $1, coluna2 = $2" de um UPDATE a partir de um objeto.
 * SEGURANÇA: as chaves vêm de schemas zod com .strict(), ou seja,
 * só nomes de colunas conhecidos chegam aqui. Os VALORES vão como parâmetros.
 *
 * Ex.: montarSet({ nome: 'X', cor: '#FFF' }, 2)
 *   -> { trecho: 'nome = $2, cor = $3', valores: ['X', '#FFF'] }
 */
export function montarSet(dados, primeiroParametro = 1) {
  const colunas = Object.keys(dados);
  const trecho = colunas.map((coluna, i) => `${coluna} = $${primeiroParametro + i}`).join(', ');
  const valores = colunas.map((coluna) => dados[coluna]);
  return { trecho, valores };
}

/**
 * Trecho SQL que transforma uma linha de "equipes" (pelo apelido da tabela)
 * em objeto JSON, ou NULL quando a vaga está "a definir".
 */
export function jsonEquipe(apelido) {
  return `CASE WHEN ${apelido}.id IS NULL THEN NULL ELSE json_build_object(
    'id', ${apelido}.id, 'nome', ${apelido}.nome, 'slug', ${apelido}.slug,
    'cor', ${apelido}.cor, 'escudo_url', ${apelido}.escudo_url) END`;
}
