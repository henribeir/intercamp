// ============================================================
// CONTROLLER das notícias
// ============================================================
import * as noticiasService from '../services/noticiasService.js';
import { notificar } from '../services/tempoReal.js';

/** GET /api/noticias */
export async function listar(req, res) {
  res.json(await noticiasService.listarNoticias());
}

/** GET /api/noticias/:id */
export async function obter(req, res) {
  res.json(await noticiasService.obterNoticia(req.validado.params.id));
}

/** POST /api/noticias (mestre) */
export async function criar(req, res) {
  const noticia = await noticiasService.criarNoticia(req.validado.body);
  notificar('noticias');
  res.status(201).json(noticia);
}

/** PATCH /api/noticias/:id (mestre) */
export async function editar(req, res) {
  const noticia = await noticiasService.editarNoticia(req.validado.params.id, req.validado.body);
  notificar('noticias');
  res.json(noticia);
}

/** DELETE /api/noticias/:id (mestre) */
export async function excluir(req, res) {
  await noticiasService.excluirNoticia(req.validado.params.id);
  notificar('noticias');
  res.status(204).end();
}
