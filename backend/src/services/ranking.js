// ============================================================
// RANKING DAS TURMAS em funções PURAS (sem banco).
// Recebe listas simples e devolve a classificação pronta.
// Testes em tests/ranking.test.js
//
// Formatos esperados:
//   equipes:     [{ id, nome, slug, cor, escudo_url }]
//   competicoes: [{ id, campeao_id }]
//   jogos:       [{ competicao_id, status, equipe_a_id, equipe_b_id,
//                   placar_a, placar_b, vencedor_id }]
// ============================================================

export const PONTUACAO_PADRAO = { vitoria: 3, derrota: 0 };

const participa = (jogo, equipeId) => jogo.equipe_a_id === equipeId || jogo.equipe_b_id === equipeId;

/**
 * Situação da turma:
 * - 'campea'     : ganhou pelo menos um título
 * - 'em_disputa' : tem jogo por jogar, OU ainda não perdeu em alguma
 *                  competição que segue sem campeão
 * - 'eliminada'  : nenhum dos casos acima
 */
export function definirSituacao(equipeId, competicoes, jogos, titulos) {
  if (titulos > 0) return 'campea';

  const temJogoPorJogar = jogos.some((jogo) => participa(jogo, equipeId) && jogo.status !== 'encerrado');
  if (temJogoPorJogar) return 'em_disputa';

  for (const competicao of competicoes) {
    if (competicao.campeao_id) continue; // competição já terminou

    const jogosDela = jogos.filter((jogo) => jogo.competicao_id === competicao.id && participa(jogo, equipeId));
    if (jogosDela.length === 0) continue; // a turma não está nesta competição

    const perdeu = jogosDela.some((jogo) => jogo.status === 'encerrado' && jogo.vencedor_id !== equipeId);
    if (!perdeu) return 'em_disputa';
  }

  return 'eliminada';
}

/**
 * Ordem do ranking: mais pontos, depois mais vitórias, depois mais
 * títulos e, por fim, ordem alfabética do nome (101 antes de 102).
 */
export function compararLinhas(x, y) {
  return (
    y.pontos - x.pontos ||
    y.vitorias - x.vitorias ||
    y.titulos - x.titulos ||
    x.equipe.nome.localeCompare(y.equipe.nome, 'pt-BR', { numeric: true })
  );
}

/**
 * Monta a classificação.
 * @param porCompeticao true = ranking de UMA competição: mostra o saldo
 *                      e lista só as turmas que estão nela.
 */
export function calcularRanking({ equipes, competicoes, jogos, pontuacao = {}, porCompeticao = false }) {
  const regra = { ...PONTUACAO_PADRAO, ...pontuacao };

  // Uma linha zerada para cada turma
  const linhas = new Map(
    equipes.map((equipe) => [
      equipe.id,
      { equipe, pontos: 0, jogos: 0, vitorias: 0, derrotas: 0, titulos: 0, saldo: 0, participa: false },
    ]),
  );

  // Soma jogos, vitórias, derrotas e saldo a partir dos jogos encerrados
  for (const jogo of jogos) {
    const lados = [
      { id: jogo.equipe_a_id, pro: jogo.placar_a, contra: jogo.placar_b },
      { id: jogo.equipe_b_id, pro: jogo.placar_b, contra: jogo.placar_a },
    ];

    for (const lado of lados) {
      const linha = linhas.get(lado.id);
      if (!linha) continue; // vaga "a definir"
      linha.participa = true;

      if (jogo.status !== 'encerrado' || !jogo.vencedor_id) continue;
      linha.jogos += 1;
      linha.saldo += lado.pro - lado.contra; // gols ou sets
      if (jogo.vencedor_id === lado.id) linha.vitorias += 1;
      else linha.derrotas += 1;
    }
  }

  // Títulos
  for (const competicao of competicoes) {
    const linha = linhas.get(competicao.campeao_id);
    if (linha) linha.titulos += 1;
  }

  // Pontos e situação
  for (const linha of linhas.values()) {
    linha.pontos = linha.vitorias * regra.vitoria + linha.derrotas * regra.derrota;
    linha.situacao = definirSituacao(linha.equipe.id, competicoes, jogos, linha.titulos);
  }

  return [...linhas.values()]
    .filter((linha) => !porCompeticao || linha.participa)
    .sort(compararLinhas)
    .map((linha, indice) => ({
      posicao: indice + 1,
      equipe: linha.equipe,
      pontos: linha.pontos,
      jogos: linha.jogos,
      vitorias: linha.vitorias,
      derrotas: linha.derrotas,
      titulos: linha.titulos,
      // Saldo (SG) só faz sentido dentro de UMA competição (gols e sets não se misturam)
      saldo: porCompeticao ? linha.saldo : null,
      situacao: linha.situacao,
    }));
}
