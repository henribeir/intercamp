// ============================================================
// Erro "esperado" da API: carrega o status HTTP e uma mensagem
// que PODE ser mostrada ao usuário.
// Ex.: throw new ErroHttp(404, 'Jogo não encontrado')
// O middleware de erros (middlewares/erros.js) monta a resposta.
// ============================================================
export class ErroHttp extends Error {
  /**
   * @param {number} status    código HTTP (400, 401, 404, 409...)
   * @param {string} mensagem  texto claro para o usuário
   * @param {Array}  [detalhes] lista opcional (ex.: campos inválidos)
   */
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
    this.detalhes = detalhes;
  }
}
