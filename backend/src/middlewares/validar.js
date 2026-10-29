// ============================================================
// MIDDLEWARE de validação com zod.
// Uso na rota:  validar({ params: paramsId, body: criarJogoSchema })
// Se tudo estiver certo, os dados limpos ficam em req.validado:
//   req.validado.params / req.validado.query / req.validado.body
// (No Express 5, req.query é só leitura; por isso usamos req.validado.)
// ============================================================
import { ErroHttp } from '../utils/ErroHttp.js';

const PARTES = ['params', 'query', 'body'];

export function validar(schemas) {
  return (req, res, next) => {
    const validado = {};
    const problemas = [];

    for (const parte of PARTES) {
      const schema = schemas[parte];
      if (!schema) continue;

      // Sem corpo, o Express 5 deixa req.body undefined: tratamos como {}
      const resultado = schema.safeParse(req[parte] ?? {});

      if (resultado.success) {
        validado[parte] = resultado.data;
      } else {
        for (const problema of resultado.error.issues) {
          problemas.push({
            local: parte,
            campo: problema.path.join('.') || '(geral)',
            mensagem: problema.message,
          });
        }
      }
    }

    if (problemas.length > 0) {
      throw new ErroHttp(400, 'Dados inválidos', problemas);
    }

    req.validado = { ...req.validado, ...validado };
    next();
  };
}
