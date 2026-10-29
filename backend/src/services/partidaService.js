// ============================================================
// SERVICE do andamento da partida:
//   - status (iniciar, intervalo, segundo_tempo, encerrar, reabrir)
//   - eventos dos esportes de gols (gol altera o placar)
//   - pontos do vôlei (regras em volei.js)
//
// Toda alteração roda numa TRANSAÇÃO e começa travando a linha
// do jogo (SELECT ... FOR UPDATE). Assim, dois cliques ao mesmo
// tempo são processados um depois do outro, sem bagunçar o placar.
// ============================================================
import { comTransacao } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { calcularMinuto } from './calculos.js';
import { obterJogo } from './jogosService.js';
import { aplicarPonto, contarSetsVencidos, vencedorPorSets, ErroRegraVolei } from './volei.js';
import { TIPOS_EVENTO_CONTROLE } from '../schemas/comuns.js';

// ============================================================
// Ajudantes
// ============================================================

/** Jogo + regras da competição, com a linha do jogo travada. */
async function buscarJogoTravado(cliente, id) {
  const { rows } = await cliente.query(
    `SELECT j.*, c.formato_placar, c.sets_para_vencer, c.pontos_por_set, c.pontos_set_decisivo
       FROM jogos j
       JOIN competicoes c ON c.id = j.competicao_id
      WHERE j.id = $1
      FOR UPDATE OF j`,
    [id],
  );
  if (rows.length === 0) throw new ErroHttp(404, 'Jogo não encontrado');
  return rows[0];
}

function regrasDoVolei(jogo) {
  return {
    setsParaVencer: jogo.sets_para_vencer,
    pontosPorSet: jogo.pontos_por_set,
    pontosSetDecisivo: jogo.pontos_set_decisivo,
  };
}

const ehJogoDeGols = (jogo) => jogo.formato_placar === 'gols';

function exigirGols(jogo) {
  if (!ehJogoDeGols(jogo)) throw new ErroHttp(409, 'Esta ação é só para jogos de gols (futsal e handebol)');
}

function exigirVolei(jogo) {
  if (ehJogoDeGols(jogo)) throw new ErroHttp(409, 'Esta ação é só para jogos de vôlei');
}

function exigirStatus(jogo, statusEsperado, mensagem) {
  if (jogo.status !== statusEsperado) throw new ErroHttp(409, `${mensagem} (status atual: ${jogo.status})`);
}

// ============================================================
// 1) STATUS DA PARTIDA
// ============================================================

async function iniciar(cliente, jogo) {
  exigirStatus(jogo, 'agendado', 'Só é possível iniciar um jogo agendado');
  if (!jogo.equipe_a_id || !jogo.equipe_b_id) {
    throw new ErroHttp(409, 'Não é possível iniciar: há equipe "a definir" neste jogo');
  }

  const gols = ehJogoDeGols(jogo);
  await cliente.query(
    `UPDATE jogos
        SET status = 'ao_vivo', periodo = $2, periodo_iniciado_em = now(),
            placar_a = 0, placar_b = 0, vencedor_id = NULL, atualizado_em = now()
      WHERE id = $1`,
    [jogo.id, gols ? '1º tempo' : null],
  );

  if (gols) {
    await cliente.query(`INSERT INTO eventos (jogo_id, tipo, minuto) VALUES ($1, 'inicio', 0)`, [jogo.id]);
  } else {
    // Vôlei: abre o 1º set
    await cliente.query(
      'INSERT INTO sets_volei (jogo_id, numero) VALUES ($1, 1) ON CONFLICT (jogo_id, numero) DO NOTHING',
      [jogo.id],
    );
  }
}

async function intervalo(cliente, jogo) {
  exigirGols(jogo);
  if (jogo.status !== 'ao_vivo' || jogo.periodo !== '1º tempo') {
    throw new ErroHttp(409, 'O intervalo só pode começar durante o 1º tempo');
  }
  const minuto = calcularMinuto(jogo);
  await cliente.query(
    `UPDATE jogos SET periodo = 'intervalo', periodo_iniciado_em = now(), atualizado_em = now() WHERE id = $1`,
    [jogo.id],
  );
  await cliente.query(`INSERT INTO eventos (jogo_id, tipo, minuto) VALUES ($1, 'intervalo', $2)`, [jogo.id, minuto]);
}

async function segundoTempo(cliente, jogo) {
  exigirGols(jogo);
  if (jogo.status !== 'ao_vivo' || jogo.periodo !== 'intervalo') {
    throw new ErroHttp(409, 'O 2º tempo só pode começar depois do intervalo');
  }
  await cliente.query(
    `UPDATE jogos SET periodo = '2º tempo', periodo_iniciado_em = now(), atualizado_em = now() WHERE id = $1`,
    [jogo.id],
  );
}

/**
 * Decide o vencedor:
 * - Gols: quem fez mais gols; empate exige vencedor_id (pênaltis/desempate).
 * - Vôlei: quem atingiu sets_para_vencer.
 * Se vencedor_id vier e não bater com o placar, é erro.
 */
function definirVencedor(jogo, vencedorInformado) {
  let vencedorPeloPlacar = null;

  if (ehJogoDeGols(jogo)) {
    if (jogo.placar_a > jogo.placar_b) vencedorPeloPlacar = jogo.equipe_a_id;
    if (jogo.placar_b > jogo.placar_a) vencedorPeloPlacar = jogo.equipe_b_id;

    if (vencedorPeloPlacar === null) {
      if (vencedorInformado === undefined) {
        throw new ErroHttp(400, 'Jogo empatado: informe vencedor_id (vencedor nos pênaltis ou no desempate)');
      }
      if (vencedorInformado !== jogo.equipe_a_id && vencedorInformado !== jogo.equipe_b_id) {
        throw new ErroHttp(400, 'vencedor_id deve ser uma das equipes do jogo');
      }
      return vencedorInformado;
    }
  } else {
    const lado = vencedorPorSets({ a: jogo.placar_a, b: jogo.placar_b }, regrasDoVolei(jogo));
    if (!lado) {
      throw new ErroHttp(409, `O jogo ainda não terminou: nenhuma equipe venceu ${jogo.sets_para_vencer} sets`);
    }
    vencedorPeloPlacar = lado === 'A' ? jogo.equipe_a_id : jogo.equipe_b_id;
  }

  if (vencedorInformado !== undefined && vencedorInformado !== vencedorPeloPlacar) {
    throw new ErroHttp(400, 'O vencedor_id informado não confere com o placar');
  }
  return vencedorPeloPlacar;
}

async function encerrar(cliente, jogo, vencedorInformado) {
  exigirStatus(jogo, 'ao_vivo', 'Só é possível encerrar um jogo ao vivo');

  const vencedorId = definirVencedor(jogo, vencedorInformado);
  const perdedorId = vencedorId === jogo.equipe_a_id ? jogo.equipe_b_id : jogo.equipe_a_id;
  const gols = ehJogoDeGols(jogo);

  // Evento "fim" com o minuto do relógio (antes de mudar o período)
  if (gols) {
    await cliente.query(`INSERT INTO eventos (jogo_id, tipo, minuto) VALUES ($1, 'fim', $2)`, [
      jogo.id,
      calcularMinuto(jogo),
    ]);
  }

  await cliente.query(
    `UPDATE jogos
        SET status = 'encerrado', periodo = $2, vencedor_id = $3, atualizado_em = now()
      WHERE id = $1`,
    [jogo.id, gols ? 'fim' : null, vencedorId],
  );

  // O vencedor ocupa as vagas dos jogos que dependem deste
  await cliente.query(
    `UPDATE jogos SET equipe_a_id = $2, atualizado_em = now() WHERE origem_a_jogo_id = $1 AND status = 'agendado'`,
    [jogo.id, vencedorId],
  );
  await cliente.query(
    `UPDATE jogos SET equipe_b_id = $2, atualizado_em = now() WHERE origem_b_jogo_id = $1 AND status = 'agendado'`,
    [jogo.id, vencedorId],
  );

  // Final: grava campeão e vice da competição
  if (jogo.eh_final) {
    await cliente.query('UPDATE competicoes SET campeao_id = $2, vice_id = $3 WHERE id = $1', [
      jogo.competicao_id,
      vencedorId,
      perdedorId,
    ]);
  }
}

async function reabrir(cliente, jogo) {
  exigirStatus(jogo, 'encerrado', 'Só é possível reabrir um jogo encerrado');

  // Os jogos que receberam o vencedor ainda não podem ter começado
  const { rows: dependentes } = await cliente.query(
    `SELECT numero, status FROM jogos
      WHERE origem_a_jogo_id = $1 OR origem_b_jogo_id = $1
      FOR UPDATE`,
    [jogo.id],
  );
  const jaComecaram = dependentes.filter((d) => d.status !== 'agendado');
  if (jaComecaram.length > 0) {
    const numeros = jaComecaram.map((d) => d.numero).join(', ');
    throw new ErroHttp(409, `Não é possível reabrir: o(s) jogo(s) ${numeros} que recebe(m) o vencedor já começou(aram)`);
  }

  // Desfaz o avanço do vencedor
  await cliente.query('UPDATE jogos SET equipe_a_id = NULL, atualizado_em = now() WHERE origem_a_jogo_id = $1', [jogo.id]);
  await cliente.query('UPDATE jogos SET equipe_b_id = NULL, atualizado_em = now() WHERE origem_b_jogo_id = $1', [jogo.id]);

  if (jogo.eh_final) {
    await cliente.query('UPDATE competicoes SET campeao_id = NULL, vice_id = NULL WHERE id = $1', [jogo.competicao_id]);
  }

  // Volta para "ao vivo" (gols: no 2º tempo, mantendo o relógio do período)
  const gols = ehJogoDeGols(jogo);
  await cliente.query(
    `UPDATE jogos
        SET status = 'ao_vivo', vencedor_id = NULL, periodo = $2, atualizado_em = now()
      WHERE id = $1`,
    [jogo.id, gols ? '2º tempo' : null],
  );
  if (gols) {
    await cliente.query(`DELETE FROM eventos WHERE jogo_id = $1 AND tipo = 'fim'`, [jogo.id]);
  }
}

const ACOES = {
  iniciar,
  intervalo,
  segundo_tempo: segundoTempo,
  encerrar,
  reabrir,
};

/** PATCH /api/jogos/:id/status */
export async function alterarStatus(id, { acao, vencedor_id: vencedorId }) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    await ACOES[acao](cliente, jogo, vencedorId);
  });
  return obterJogo(id);
}

// ============================================================
// 2) EVENTOS (futsal e handebol)
// ============================================================

/** POST /api/jogos/:id/eventos — "gol" soma 1 no placar na mesma transação. */
export async function registrarEvento(id, { tipo, equipe_id: equipeId, minuto, jogador }) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    exigirGols(jogo);
    exigirStatus(jogo, 'ao_vivo', 'Só é possível registrar eventos com o jogo ao vivo');

    if (equipeId !== jogo.equipe_a_id && equipeId !== jogo.equipe_b_id) {
      throw new ErroHttp(400, 'equipe_id deve ser uma das equipes do jogo');
    }

    await cliente.query(
      'INSERT INTO eventos (jogo_id, tipo, minuto, equipe_id, jogador) VALUES ($1, $2, $3, $4, $5)',
      [id, tipo, minuto ?? calcularMinuto(jogo), equipeId, jogador ?? null],
    );

    if (tipo === 'gol') {
      // UPDATE atômico: o banco soma em cima do valor atual
      const coluna = equipeId === jogo.equipe_a_id ? 'placar_a' : 'placar_b';
      await cliente.query(`UPDATE jogos SET ${coluna} = ${coluna} + 1, atualizado_em = now() WHERE id = $1`, [id]);
    }
  });
  return obterJogo(id);
}

/** DELETE /api/jogos/:id/eventos/:eventoId — desfazer um gol tira 1 do placar (nunca abaixo de 0). */
export async function desfazerEvento(id, eventoId) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    exigirGols(jogo);
    if (jogo.status === 'encerrado') {
      throw new ErroHttp(409, 'Jogo encerrado: reabra o jogo antes de desfazer eventos');
    }

    const { rows } = await cliente.query('SELECT tipo, equipe_id FROM eventos WHERE id = $1 AND jogo_id = $2', [
      eventoId,
      id,
    ]);
    if (rows.length === 0) throw new ErroHttp(404, 'Evento não encontrado neste jogo');

    const evento = rows[0];
    if (TIPOS_EVENTO_CONTROLE.includes(evento.tipo)) {
      throw new ErroHttp(400, 'Eventos de início, intervalo e fim são controlados pela rota de status');
    }

    await cliente.query('DELETE FROM eventos WHERE id = $1', [eventoId]);

    if (evento.tipo === 'gol') {
      let coluna = null;
      if (evento.equipe_id === jogo.equipe_a_id) coluna = 'placar_a';
      if (evento.equipe_id === jogo.equipe_b_id) coluna = 'placar_b';
      if (coluna) {
        await cliente.query(
          `UPDATE jogos SET ${coluna} = GREATEST(${coluna} - 1, 0), atualizado_em = now() WHERE id = $1`,
          [id],
        );
      }
    }
  });
  return obterJogo(id);
}

// ============================================================
// 3) PONTOS DO VÔLEI
// ============================================================

/** POST /api/jogos/:id/pontos — { time: 'A'|'B', delta: 1|-1 } */
export async function registrarPonto(id, { time, delta }) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    exigirVolei(jogo);
    exigirStatus(jogo, 'ao_vivo', 'Só é possível marcar pontos com o jogo ao vivo');

    const { rows: setsAtuais } = await cliente.query(
      'SELECT numero, pontos_a, pontos_b, encerrado FROM sets_volei WHERE jogo_id = $1 ORDER BY numero',
      [id],
    );

    // A regra fica toda na função pura; aqui só traduzimos o erro para HTTP
    let resultado;
    try {
      resultado = aplicarPonto(setsAtuais, regrasDoVolei(jogo), time, delta);
    } catch (erro) {
      if (erro instanceof ErroRegraVolei) throw new ErroHttp(409, erro.message);
      throw erro;
    }

    // Grava os sets (insere os novos, atualiza os existentes, apaga os que sumiram)
    for (const set of resultado.sets) {
      await cliente.query(
        `INSERT INTO sets_volei (jogo_id, numero, pontos_a, pontos_b, encerrado)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (jogo_id, numero)
         DO UPDATE SET pontos_a = EXCLUDED.pontos_a, pontos_b = EXCLUDED.pontos_b, encerrado = EXCLUDED.encerrado`,
        [id, set.numero, set.pontos_a, set.pontos_b, set.encerrado],
      );
    }
    await cliente.query('DELETE FROM sets_volei WHERE jogo_id = $1 AND numero > $2', [id, resultado.sets.length]);

    // placar_a/placar_b do jogo = sets vencidos
    const placar = contarSetsVencidos(resultado.sets);
    await cliente.query('UPDATE jogos SET placar_a = $2, placar_b = $3, atualizado_em = now() WHERE id = $1', [
      id,
      placar.a,
      placar.b,
    ]);
  });
  return obterJogo(id);
}
