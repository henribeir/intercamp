// ============================================================
// Validação de jogos: filtros da listagem, cadastro, confronto
// e andamento da partida (status, eventos e pontos do vôlei).
// ============================================================
import {
  z, FASES, STATUS_JOGO, ACOES_STATUS, TIPOS_EVENTO_MANUAIS,
  idParam, idNulavel, textoCurto, dataSchema, dataValida, horarioSchema,
  temAlgumCampo, MSG_ALGUM_CAMPO,
} from './comuns.js';

// Regra usada em vários schemas: A e B não podem ser a mesma turma
const equipesDiferentes = (dados) => dados.equipe_a_id == null || dados.equipe_a_id !== dados.equipe_b_id;
const ERRO_EQUIPES_IGUAIS = { message: 'Equipe A e equipe B devem ser diferentes', path: ['equipe_b_id'] };

// ---------- GET /api/jogos?competicao=&status=&data= ----------
export const listarJogosQuery = z.object({
  // id numérico ou slug (ex.: 3 ou "futsal-masculino")
  competicao: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/i, 'Competição inválida: use o id ou o slug')
    .optional(),
  status: z.enum(STATUS_JOGO).optional(),
  // data exata, ou "sem" para jogos ainda sem data
  data: z
    .string()
    .refine((valor) => valor === 'sem' || dataValida(valor), 'Use uma data AAAA-MM-DD ou "sem"')
    .optional(),
});

// ---------- Campos de cadastro de um jogo ----------
const camposCadastro = {
  numero: z.number().int().positive().max(999),
  fase_ordem: z.number().int().positive().max(10),
  fase_rotulo: z.enum(FASES),
  eh_final: z.boolean(),
  origem_a_jogo_id: idNulavel,
  origem_b_jogo_id: idNulavel,
  rotulo_a: textoCurto(60).nullable(),
  rotulo_b: textoCurto(60).nullable(),
  local: textoCurto(80).nullable(),
  data: dataSchema.nullable(),
  horario: horarioSchema.nullable(),
};

/** Campo opcional que, se não vier, vale null */
const opcionalNulo = (schema) => schema.optional().default(null);

// POST /api/jogos
export const criarJogoSchema = z
  .object({
    competicao_id: z.number().int().positive(),
    numero: camposCadastro.numero,
    fase_ordem: camposCadastro.fase_ordem,
    fase_rotulo: camposCadastro.fase_rotulo,
    eh_final: camposCadastro.eh_final.optional(), // se não vier, deduzido de fase_rotulo
    equipe_a_id: opcionalNulo(idNulavel),
    equipe_b_id: opcionalNulo(idNulavel),
    origem_a_jogo_id: opcionalNulo(camposCadastro.origem_a_jogo_id),
    origem_b_jogo_id: opcionalNulo(camposCadastro.origem_b_jogo_id),
    rotulo_a: opcionalNulo(camposCadastro.rotulo_a),
    rotulo_b: opcionalNulo(camposCadastro.rotulo_b),
    local: opcionalNulo(camposCadastro.local),
    data: opcionalNulo(camposCadastro.data),
    horario: opcionalNulo(camposCadastro.horario),
  })
  .strict()
  .refine(equipesDiferentes, ERRO_EQUIPES_IGUAIS);

// PATCH /api/jogos/:id  (dados de cadastro; equipes ficam na rota /confronto)
export const editarJogoSchema = z.object(camposCadastro).partial().strict().refine(temAlgumCampo, MSG_ALGUM_CAMPO);

// PATCH /api/jogos/:id/confronto  (depois do sorteio / definição)
export const confrontoSchema = z
  .object({
    equipe_a_id: idNulavel,
    equipe_b_id: idNulavel,
    local: camposCadastro.local,
    data: camposCadastro.data,
    horario: camposCadastro.horario,
  })
  .partial()
  .strict()
  .refine(temAlgumCampo, MSG_ALGUM_CAMPO)
  .refine(equipesDiferentes, ERRO_EQUIPES_IGUAIS);

// ---------- Andamento da partida ----------

// PATCH /api/jogos/:id/status
export const statusSchema = z
  .object({
    acao: z.enum(ACOES_STATUS),
    vencedor_id: z.number().int().positive().optional(), // só para "encerrar" com empate
  })
  .strict();

// POST /api/jogos/:id/eventos
export const eventoSchema = z
  .object({
    tipo: z.enum(TIPOS_EVENTO_MANUAIS),
    equipe_id: z.number().int().positive(),
    minuto: z.number().int().min(0).max(200).optional(), // se não vier, usa o relógio do jogo
    jogador: textoCurto(60).optional(),
  })
  .strict();

// DELETE /api/jogos/:id/eventos/:eventoId
export const paramsEvento = z.object({ id: idParam, eventoId: idParam });

// POST /api/jogos/:id/pontos  (vôlei)
export const pontoSchema = z
  .object({
    time: z.enum(['A', 'B']),
    delta: z.number().refine((valor) => valor === 1 || valor === -1, 'delta deve ser 1 (ponto) ou -1 (desfazer)'),
  })
  .strict();
