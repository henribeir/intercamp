// ============================================================
// SERVICE dos jogos: consulta e cadastro.
// (O andamento da partida fica em partidaService.js)
// ============================================================
import { query, comTransacao } from '../db/pool.js';
import { ErroHttp } from '../utils/ErroHttp.js';
import { jsonEquipe, montarSet } from '../utils/sql.js';
import { calcularMinuto, contarEstatisticas } from './calculos.js';
import { vencedorPorSets } from './volei.js';

// Consulta base: jogo + competição + as duas equipes já em formato JSON
const SELECT_JOGO = `
  SELECT j.id, j.competicao_id, j.numero, j.fase_ordem, j.fase_rotulo, j.eh_final,
         j.equipe_a_id, j.equipe_b_id, j.origem_a_jogo_id, j.origem_b_jogo_id,
         j.rotulo_a, j.rotulo_b, j.local, j.data,
         to_char(j.horario, 'HH24:MI') AS horario,
         j.status, j.periodo, j.periodo_iniciado_em,
         j.placar_a, j.placar_b, j.vencedor_id, j.atualizado_em,
         json_build_object(
           'id', c.id, 'slug', c.slug, 'nome', c.nome, 'cor', c.cor,
           'esporte', c.esporte, 'formato_placar', c.formato_placar,
           'sets_para_vencer', c.sets_para_vencer, 'pontos_por_set', c.pontos_por_set,
           'pontos_set_decisivo', c.pontos_set_decisivo
         ) AS competicao,
         ${jsonEquipe('ea')} AS equipe_a,
         ${jsonEquipe('eb')} AS equipe_b,
         -- Vôlei: set em andamento (o card mostra "Set 2 · 14 x 11")
         (SELECT json_build_object('numero', s.numero, 'pontos_a', s.pontos_a, 'pontos_b', s.pontos_b)
            FROM sets_volei s
           WHERE s.jogo_id = j.id AND NOT s.encerrado
           ORDER BY s.numero DESC
           LIMIT 1) AS set_atual
    FROM jogos j
    JOIN competicoes c ON c.id = j.competicao_id
    LEFT JOIN equipes ea ON ea.id = j.equipe_a_id
    LEFT JOIN equipes eb ON eb.id = j.equipe_b_id`;

const ORDEM_PADRAO = 'ORDER BY j.data NULLS LAST, j.horario NULLS LAST, c.ordem, j.fase_ordem, j.numero';

/**
 * Transforma a linha do banco no formato que a API devolve.
 * - Vaga sem equipe: mostra o rótulo (ou "A definir").
 * - Ao vivo: calcula o minuto do relógio.
 * - Vôlei: informa se o jogo já pode ser encerrado.
 */
export function formatarJogo(linha, agora = new Date()) {
  const { competicao } = linha;
  const ehVolei = competicao.formato_placar === 'sets';

  return {
    id: linha.id,
    numero: linha.numero,
    fase_ordem: linha.fase_ordem,
    fase_rotulo: linha.fase_rotulo,
    eh_final: linha.eh_final,
    competicao,
    equipe_a: linha.equipe_a,
    equipe_b: linha.equipe_b,
    rotulo_a: linha.equipe_a ? null : linha.rotulo_a ?? 'A definir',
    rotulo_b: linha.equipe_b ? null : linha.rotulo_b ?? 'A definir',
    origem_a_jogo_id: linha.origem_a_jogo_id,
    origem_b_jogo_id: linha.origem_b_jogo_id,
    local: linha.local,
    data: linha.data,
    horario: linha.horario,
    status: linha.status,
    periodo: linha.periodo,
    periodo_iniciado_em: linha.periodo_iniciado_em,
    minuto: calcularMinuto(linha, agora),
    placar_a: linha.placar_a,
    placar_b: linha.placar_b,
    set_atual: ehVolei ? linha.set_atual : null,
    vencedor_id: linha.vencedor_id,
    pronto_para_encerrar: ehVolei
      ? linha.status === 'ao_vivo' &&
        vencedorPorSets({ a: linha.placar_a, b: linha.placar_b }, { setsParaVencer: competicao.sets_para_vencer }) !== null
      : null,
    atualizado_em: linha.atualizado_em,
  };
}

// ============================================================
// Consultas públicas
// ============================================================

/** Lista jogos com filtros opcionais: competicao (id ou slug), status e data ("sem" = sem data). */
export async function listarJogos({ competicao, status, data } = {}) {
  const condicoes = [];
  const valores = [];

  if (competicao) {
    if (/^\d+$/.test(competicao)) {
      valores.push(Number(competicao));
      condicoes.push(`c.id = $${valores.length}`);
    } else {
      valores.push(competicao.toLowerCase());
      condicoes.push(`c.slug = $${valores.length}`);
    }
  }
  if (status) {
    valores.push(status);
    condicoes.push(`j.status = $${valores.length}`);
  }
  if (data === 'sem') {
    condicoes.push('j.data IS NULL');
  } else if (data) {
    valores.push(data);
    condicoes.push(`j.data = $${valores.length}`);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
  const { rows } = await query(`${SELECT_JOGO} ${where} ${ORDEM_PADRAO}`, valores);

  const agora = new Date();
  return rows.map((linha) => formatarJogo(linha, agora));
}

/** Um jogo completo: dados + eventos e estatísticas (gols) ou sets (vôlei). */
export async function obterJogo(id) {
  const { rows } = await query(`${SELECT_JOGO} WHERE j.id = $1`, [id]);
  if (rows.length === 0) throw new ErroHttp(404, 'Jogo não encontrado');

  const linha = rows[0];
  const jogo = formatarJogo(linha);

  if (linha.competicao.formato_placar === 'gols') {
    const { rows: eventos } = await query(
      `SELECT id, tipo, minuto, equipe_id, jogador, criado_em
         FROM eventos WHERE jogo_id = $1
        ORDER BY criado_em DESC, id DESC`, // mais recente primeiro
      [id],
    );
    jogo.eventos = eventos;
    jogo.estatisticas = contarEstatisticas(eventos, linha.equipe_a_id, linha.equipe_b_id);
    jogo.sets = null;
  } else {
    const { rows: sets } = await query(
      'SELECT numero, pontos_a, pontos_b, encerrado FROM sets_volei WHERE jogo_id = $1 ORDER BY numero',
      [id],
    );
    jogo.eventos = [];
    jogo.estatisticas = null;
    jogo.sets = sets;
  }

  return jogo;
}

// ============================================================
// Cadastro (mestre)
// ============================================================

/** Confere se os jogos de origem existem, são da mesma competição e não são o próprio jogo. */
async function validarOrigens(executor, competicaoId, origens, jogoId = null) {
  for (const origemId of origens) {
    if (origemId == null) continue;
    if (origemId === jogoId) throw new ErroHttp(400, 'Um jogo não pode ser origem dele mesmo');

    const { rows } = await executor.query('SELECT competicao_id FROM jogos WHERE id = $1', [origemId]);
    if (rows.length === 0) throw new ErroHttp(400, `Jogo de origem ${origemId} não existe`);
    if (rows[0].competicao_id !== competicaoId) {
      throw new ErroHttp(400, `Jogo de origem ${origemId} é de outra competição`);
    }
  }
}

/** Busca o jogo e trava a linha até o fim da transação (evita duas alterações ao mesmo tempo). */
async function buscarJogoTravado(cliente, id) {
  const { rows } = await cliente.query('SELECT * FROM jogos WHERE id = $1 FOR UPDATE', [id]);
  if (rows.length === 0) throw new ErroHttp(404, 'Jogo não encontrado');
  return rows[0];
}

export async function criarJogo(dados) {
  const { rows: competicao } = await query('SELECT id FROM competicoes WHERE id = $1', [dados.competicao_id]);
  if (competicao.length === 0) throw new ErroHttp(400, 'Competição não encontrada');

  await validarOrigens({ query }, dados.competicao_id, [dados.origem_a_jogo_id, dados.origem_b_jogo_id]);

  const ehFinal = dados.eh_final ?? dados.fase_rotulo === 'Final';
  const { rows } = await query(
    `INSERT INTO jogos
       (competicao_id, numero, fase_ordem, fase_rotulo, eh_final,
        equipe_a_id, equipe_b_id, origem_a_jogo_id, origem_b_jogo_id,
        rotulo_a, rotulo_b, local, data, horario)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      dados.competicao_id, dados.numero, dados.fase_ordem, dados.fase_rotulo, ehFinal,
      dados.equipe_a_id, dados.equipe_b_id, dados.origem_a_jogo_id, dados.origem_b_jogo_id,
      dados.rotulo_a, dados.rotulo_b, dados.local, dados.data, dados.horario,
    ],
  );
  return obterJogo(rows[0].id);
}

/** Edita dados de cadastro. Só jogos ainda agendados. */
export async function editarJogo(id, dados) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    if (jogo.status !== 'agendado') {
      throw new ErroHttp(409, 'Só é possível editar o cadastro de um jogo agendado');
    }

    // Mudou a fase e não disse se é final? Deduzimos pelo rótulo.
    const alteracoes = { ...dados };
    if (alteracoes.fase_rotulo !== undefined && alteracoes.eh_final === undefined) {
      alteracoes.eh_final = alteracoes.fase_rotulo === 'Final';
    }

    await validarOrigens(cliente, jogo.competicao_id, [alteracoes.origem_a_jogo_id, alteracoes.origem_b_jogo_id], id);

    const { trecho, valores } = montarSet(alteracoes, 2);
    await cliente.query(`UPDATE jogos SET ${trecho}, atualizado_em = now() WHERE id = $1`, [id, ...valores]);
  });
  return obterJogo(id);
}

/** Exclui um jogo agendado do qual nenhum outro jogo dependa. */
export async function excluirJogo(id) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);
    if (jogo.status !== 'agendado') {
      throw new ErroHttp(409, 'Só é possível excluir um jogo agendado');
    }

    const { rows: dependentes } = await cliente.query(
      'SELECT numero FROM jogos WHERE origem_a_jogo_id = $1 OR origem_b_jogo_id = $1 ORDER BY numero',
      [id],
    );
    if (dependentes.length > 0) {
      const numeros = dependentes.map((d) => d.numero).join(', ');
      throw new ErroHttp(409, `Não é possível excluir: o vencedor deste jogo vai para o(s) jogo(s) ${numeros}`);
    }

    await cliente.query('DELETE FROM jogos WHERE id = $1', [id]);
  });
}

/**
 * Define o confronto (após o sorteio) e/ou data, horário e local.
 * - Jogo encerrado: nada pode mudar.
 * - Jogo ao vivo: só data, horário e local (as equipes já estão em campo).
 */
export async function definirConfronto(id, dados) {
  await comTransacao(async (cliente) => {
    const jogo = await buscarJogoTravado(cliente, id);

    if (jogo.status === 'encerrado') {
      throw new ErroHttp(409, 'Não é possível alterar o confronto de um jogo encerrado');
    }

    const mudaEquipes =
      (dados.equipe_a_id !== undefined && dados.equipe_a_id !== jogo.equipe_a_id) ||
      (dados.equipe_b_id !== undefined && dados.equipe_b_id !== jogo.equipe_b_id);
    if (jogo.status === 'ao_vivo' && mudaEquipes) {
      throw new ErroHttp(409, 'Não é possível trocar as equipes com o jogo em andamento');
    }

    // Confere A ≠ B considerando o que já está gravado
    const equipeA = dados.equipe_a_id !== undefined ? dados.equipe_a_id : jogo.equipe_a_id;
    const equipeB = dados.equipe_b_id !== undefined ? dados.equipe_b_id : jogo.equipe_b_id;
    if (equipeA != null && equipeA === equipeB) {
      throw new ErroHttp(400, 'Equipe A e equipe B devem ser diferentes');
    }

    const { trecho, valores } = montarSet(dados, 2);
    await cliente.query(`UPDATE jogos SET ${trecho}, atualizado_em = now() WHERE id = $1`, [id, ...valores]);
  });
  return obterJogo(id);
}
