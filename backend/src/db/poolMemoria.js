// ============================================================
// "Pool" de mentirinha para os TESTES: um PostgreSQL de verdade
// compilado para WebAssembly (PGlite), rodando dentro do Node,
// sem servidor, sem internet e sem tocar no banco do Neon.
//
// Ele imita só o que o nosso código usa do pg.Pool:
//   pool.query(texto, parametros) -> { rows, rowCount }
//   pool.connect()                -> cliente com query() e release()
//   pool.end()
// ============================================================
import { PGlite, types } from '@electric-sql/pglite';

export function criarPoolEmMemoria() {
  // Mesma regra do pool.js: DATE volta como texto '2026-05-20'
  const banco = new PGlite({ parsers: { [types.DATE]: (valor) => valor } });

  // O PGlite tem UMA conexão só. Esta "fila" garante que uma transação
  // termine antes de outra consulta começar (como um cadeado).
  let fila = Promise.resolve();
  function esperarAVez() {
    let liberar;
    const anterior = fila;
    fila = new Promise((resolver) => {
      liberar = resolver;
    });
    return anterior.then(() => liberar);
  }

  async function executar(texto, parametros) {
    // Com parâmetros: consulta preparada (um comando só).
    if (parametros && parametros.length > 0) {
      const resultado = await banco.query(texto, parametros);
      return { rows: resultado.rows, rowCount: resultado.affectedRows ?? resultado.rows.length };
    }
    // Sem parâmetros: aceita vários comandos de uma vez (ex.: schema.sql).
    const resultados = await banco.exec(texto);
    const ultimo = resultados.at(-1) ?? { rows: [], affectedRows: 0 };
    return { rows: ultimo.rows, rowCount: ultimo.affectedRows ?? ultimo.rows.length };
  }

  return {
    async query(texto, parametros) {
      const liberar = await esperarAVez();
      try {
        return await executar(texto, parametros);
      } finally {
        liberar();
      }
    },

    async connect() {
      const liberar = await esperarAVez();
      return { query: executar, release: liberar };
    },

    async end() {
      await banco.close();
    },

    on() {}, // o pool.js do pg registra eventos; aqui não há nada a fazer
  };
}
