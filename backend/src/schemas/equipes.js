// ============================================================
// Validação do cadastro de equipes (turmas)
// ============================================================
import { z, CURSOS, corHex, textoCurto, temAlgumCampo, MSG_ALGUM_CAMPO } from './comuns.js';

const campos = {
  nome: textoCurto(40),
  slug: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug inválido: use letras minúsculas, números e hífens (ex.: 301-int)'),
  serie: z.number().int().min(1).max(3),
  curso: z.enum(CURSOS).nullable(),
  cor: corHex.nullable(),
  // Link completo (https://...) ou arquivo da pasta public/escudos do site (escudos/301-int.png)
  escudo_url: z
    .string()
    .trim()
    .max(500)
    .refine(
      (valor) => /^https?:\/\/\S+$/i.test(valor) || /^escudos\/[\w.-]+\.(png|jpe?g|webp|svg)$/i.test(valor),
      'Escudo inválido: use um link https://... ou escudos/nome-do-arquivo.png',
    )
    .nullable(),
};

// POST: nome e série obrigatórios; o slug é gerado a partir do nome se não vier
export const criarEquipeSchema = z
  .object({
    nome: campos.nome,
    slug: campos.slug.optional(),
    serie: campos.serie,
    curso: campos.curso.optional().default(null),
    cor: campos.cor.optional().default(null),
    escudo_url: campos.escudo_url.optional().default(null),
  })
  .strict();

// PATCH: qualquer campo, mas pelo menos um
export const editarEquipeSchema = z.object(campos).partial().strict().refine(temAlgumCampo, MSG_ALGUM_CAMPO);
