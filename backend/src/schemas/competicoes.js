// ============================================================
// Validação de rotas que usam o slug da competição
// ============================================================
import { z } from './comuns.js';

const slugCompeticao = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Competição inválida: use o slug (ex.: futsal-masculino)');

// /api/competicoes/:slug/chaveamento
export const paramsSlug = z.object({ slug: slugCompeticao });

// /api/ranking?competicao=futsal-masculino   (sem competição = ranking geral)
export const rankingQuery = z.object({ competicao: slugCompeticao.optional() });
