// ============================================================
// Traduz as mensagens padrão do zod para o português.
// Basta importar este arquivo uma vez (schemas/comuns.js já faz isso).
// ============================================================
import { z } from 'zod';

const NOMES_DOS_TIPOS = {
  string: 'texto',
  number: 'número',
  integer: 'número inteiro',
  boolean: 'verdadeiro ou falso',
  object: 'objeto',
  array: 'lista',
};

z.setErrorMap((problema, contexto) => {
  switch (problema.code) {
    case 'invalid_type':
      if (problema.received === 'undefined') return { message: 'Campo obrigatório' };
      if (problema.received === 'null') return { message: 'Não pode ser nulo' };
      return { message: `Tipo inválido: esperado ${NOMES_DOS_TIPOS[problema.expected] || problema.expected}` };

    case 'invalid_enum_value':
      return { message: `Valor inválido. Use um destes: ${problema.options.join(', ')}` };

    case 'invalid_string':
      if (problema.validation === 'email') return { message: 'E-mail inválido' };
      if (problema.validation === 'url') return { message: 'URL inválida' };
      return { message: 'Formato inválido' };

    case 'too_small':
      if (problema.type === 'string') return { message: `Deve ter no mínimo ${problema.minimum} caractere(s)` };
      return { message: `Deve ser no mínimo ${problema.minimum}` };

    case 'too_big':
      if (problema.type === 'string') return { message: `Deve ter no máximo ${problema.maximum} caractere(s)` };
      return { message: `Deve ser no máximo ${problema.maximum}` };

    case 'unrecognized_keys':
      return { message: `Campo(s) não permitido(s): ${problema.keys.join(', ')}` };

    case 'invalid_literal':
    case 'invalid_union':
      return { message: 'Valor inválido' };

    default:
      return { message: contexto.defaultError };
  }
});
