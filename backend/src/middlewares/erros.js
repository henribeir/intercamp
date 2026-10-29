// ============================================================
// MIDDLEWARES de erro: respostas padronizadas para
// rota inexistente (404) e para qualquer erro lançado.
// Regra de ouro: o usuário recebe uma mensagem clara, mas
// NUNCA detalhes internos (SQL, pilha de chamadas, senhas...).
// ============================================================
import { ErroHttp } from '../utils/ErroHttp.js';

// Mensagens amigáveis para as restrições do banco (nomes vêm do schema.sql)
const MENSAGENS_DAS_RESTRICOES = {
  equipes_nome_key: 'Já existe uma turma com esse nome',
  equipes_slug_key: 'Já existe uma turma com esse slug',
  jogos_numero_uk: 'Já existe um jogo com esse número nesta competição',
  jogos_equipes_diferentes_ck: 'Equipe A e equipe B devem ser diferentes',
  jogos_vencedor_ck: 'O vencedor deve ser uma das equipes do jogo',
  jogos_final_ck: 'eh_final deve ser verdadeiro somente quando a fase for "Final"',
  jogos_origem_ck: 'Um jogo não pode ser origem dele mesmo',
};

// Códigos de erro do PostgreSQL que são culpa dos dados enviados
const ERROS_DO_POSTGRES = {
  23505: { status: 409, mensagem: 'Registro duplicado' }, // UNIQUE
  23503: { status: 400, mensagem: 'Algum id informado não existe' }, // chave estrangeira
  23514: { status: 400, mensagem: 'Os dados violam uma regra do banco' }, // CHECK
  '22P02': { status: 400, mensagem: 'Valor em formato inválido' },
};

/** Qualquer rota não encontrada cai aqui. */
export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

/** Converte qualquer erro em { status, corpo } seguro para enviar. */
function traduzirErro(erro) {
  // 1) Erros que nós mesmos lançamos
  if (erro instanceof ErroHttp) {
    const corpo = { erro: erro.message };
    if (erro.detalhes) corpo.detalhes = erro.detalhes;
    return { status: erro.status, corpo };
  }

  // 2) JSON malformado ou grande demais (gerados pelo express.json)
  if (erro.type === 'entity.parse.failed') {
    return { status: 400, corpo: { erro: 'JSON inválido no corpo da requisição' } };
  }
  if (erro.type === 'entity.too.large') {
    return { status: 413, corpo: { erro: 'Corpo da requisição grande demais' } };
  }

  // 3) Restrições do PostgreSQL
  const erroDoBanco = ERROS_DO_POSTGRES[erro.code];
  if (erroDoBanco) {
    const mensagem = MENSAGENS_DAS_RESTRICOES[erro.constraint] || erroDoBanco.mensagem;
    return { status: erroDoBanco.status, corpo: { erro: mensagem } };
  }

  // 4) Qualquer outra coisa é falha nossa: resposta genérica
  return { status: 500, corpo: { erro: 'Erro interno do servidor' } };
}

/**
 * Tratador central de erros. O Express 5 envia para cá
 * inclusive os erros lançados dentro de funções async.
 */
// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, req, res, next) {
  const { status, corpo } = traduzirErro(erro);

  // Só erros 500 vão para o log completo (para quem cuida do servidor)
  if (status >= 500) {
    console.error(`[erro] ${req.method} ${req.originalUrl}`, erro);
  }

  res.status(status).json(corpo);
}
