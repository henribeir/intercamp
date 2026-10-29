// ============================================================
// Peças de validação reaproveitadas pelos outros schemas
// e as listas de valores permitidos (enums) do sistema.
// ============================================================
import { z } from 'zod';
import './zodPtBr.js';

export { z };

// ---------- Valores permitidos (iguais aos CHECKs do schema.sql) ----------
export const STATUS_JOGO = ['agendado', 'ao_vivo', 'encerrado'];
export const FASES = ['1ª Fase', '2ª Fase', '3ª Fase', 'Final'];
export const CURSOS = ['INT', 'ADM'];

// Eventos que o mestre registra pela rota de eventos
export const TIPOS_EVENTO_MANUAIS = ['gol', 'cartao_amarelo', 'cartao_vermelho', 'falta', 'finalizacao', 'finalizacao_alvo'];
// Eventos criados automaticamente pela rota de status
export const TIPOS_EVENTO_CONTROLE = ['inicio', 'intervalo', 'fim'];

export const ACOES_STATUS = ['iniciar', 'intervalo', 'segundo_tempo', 'encerrar', 'reabrir'];

// ---------- Peças básicas ----------

/** id vindo da URL (texto) convertido para número inteiro positivo */
export const idParam = z.coerce.number().int().positive();
export const paramsId = z.object({ id: idParam });

/** id no corpo JSON: número inteiro positivo ou null ("a definir") */
export const idNulavel = z.number().int().positive().nullable();

/** Texto obrigatório, sem espaços nas pontas, com tamanho máximo */
export const textoCurto = (maximo) => z.string().trim().min(1).max(maximo);

/** Confere se "AAAA-MM-DD" é uma data que existe no calendário (ex.: rejeita 2026-02-30) */
export function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(texto);
}

export const dataSchema = z.string().refine(dataValida, 'Data inválida: use o formato AAAA-MM-DD');

export const horarioSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido: use o formato HH:MM (00:00 a 23:59)');

export const corHex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida: use o formato #RRGGBB');

/** Para PATCH: o corpo precisa trazer pelo menos um campo */
export const temAlgumCampo = (dados) => Object.keys(dados).length > 0;
export const MSG_ALGUM_CAMPO = 'Envie pelo menos um campo para alterar';
