// ============================================================
// Validação das notícias
// ============================================================
import { z, textoCurto, temAlgumCampo, MSG_ALGUM_CAMPO } from './comuns.js';

const campos = {
  titulo: textoCurto(120),
  resumo: textoCurto(300).nullable(),
  corpo: z.string().trim().max(10000).nullable(),
  imagem_url: z.string().trim().url().max(500).nullable(),
  destaque: z.boolean(),
  // Data e hora com fuso, ex.: 2026-11-05T19:30:00-03:00
  publicada_em: z.string().datetime({ offset: true, message: 'Use data e hora ISO, ex.: 2026-11-05T19:30:00-03:00' }),
};

// POST: só o título é obrigatório
export const criarNoticiaSchema = z
  .object({
    titulo: campos.titulo,
    resumo: campos.resumo.optional().default(null),
    corpo: campos.corpo.optional().default(null),
    imagem_url: campos.imagem_url.optional().default(null),
    destaque: campos.destaque.optional().default(false),
    publicada_em: campos.publicada_em.nullable().optional().default(null), // null = agora
  })
  .strict();

// PATCH: qualquer campo, mas pelo menos um
export const editarNoticiaSchema = z.object(campos).partial().strict().refine(temAlgumCampo, MSG_ALGUM_CAMPO);
