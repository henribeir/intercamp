// ============================================================
// SERVER: ponto de entrada. Liga o app em uma porta e
// fecha tudo com cuidado quando o processo for encerrado.
// ============================================================
import { app } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { encerrarTodos } from './services/tempoReal.js';

const servidor = app.listen(config.porta, () => {
  console.log(`InterCamp API rodando em http://localhost:${config.porta}/api/health`);
});

// O Render envia SIGTERM ao reiniciar; Ctrl+C envia SIGINT.
// Fechamos as conexões SSE (senão o servidor esperaria por elas para sempre),
// paramos de aceitar requisições e fechamos as conexões do banco.
function encerrar(sinal) {
  console.log(`\n${sinal} recebido. Encerrando...`);
  encerrarTodos();
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
