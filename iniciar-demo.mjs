// ============================================================
// INICIAR DEMONSTRAÇÃO: liga TUDO com um comando só.
//
//   1. Confere o Node.js e se as portas 3000 e 5173 estão livres
//   2. Instala as dependências (só na 1ª vez)
//   3. Liga a API em modo demonstração (banco em memória)
//   4. Espera a API responder e liga o site
//   5. Abre o navegador em http://localhost:5173
//
// Como rodar (na pasta principal do projeto):
//   Windows:      dois cliques em INICIAR-DEMO.bat
//   Mac:          dois cliques em INICIAR-DEMO.command
//   Qualquer um:  node iniciar-demo.mjs
// Para parar: Ctrl+C (ou feche a janela).
// ============================================================
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PASTA = dirname(fileURLToPath(import.meta.url));
const PORTA_API = 3000;
const PORTA_SITE = 5173;
const URL_SAUDE = `http://localhost:${PORTA_API}/api/health`;
const URL_SITE = `http://localhost:${PORTA_SITE}`;
const NODE_MINIMO = 20;

/** Processos ligados por este script (para desligar todos juntos) */
const processos = [];

// Cache do npm DENTRO do projeto: se o cache normal (~/.npm) estiver
// com permissão errada (erro EACCES, comum quando alguém já usou
// "sudo npm"), a instalação funciona do mesmo jeito.
const CACHE_NPM = join(PASTA, '.cache-npm');

/** Roda "npm ..." dentro de uma pasta. shell: true faz funcionar no Windows (npm.cmd) */
function npm(argumentos, pasta) {
  // Um texto só (e não uma lista): com shell: true, o Node pede assim.
  // Os argumentos são fixos, escritos por nós, então é seguro.
  const comando = ['npm', ...argumentos].join(' ');
  const processo = spawn(comando, {
    cwd: join(PASTA, pasta),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, npm_config_cache: CACHE_NPM },
  });
  processos.push(processo);
  return processo;
}

/** Espera um processo terminar; dá erro se ele falhar */
function esperarTerminar(processo, descricao) {
  return new Promise((resolver, rejeitar) => {
    processo.on('error', () => rejeitar(new Error(`Não consegui rodar o npm para ${descricao}.`)));
    processo.on('exit', (codigo) =>
      codigo === 0 ? resolver() : rejeitar(new Error(`Falha ao ${descricao}. Veja a mensagem de erro acima.`)),
    );
  });
}

/** true se já tem algum programa usando a porta */
function portaOcupada(porta) {
  return new Promise((resolver) => {
    const conexao = createConnection({ port: porta, host: 'localhost' });
    conexao.setTimeout(1000);
    conexao.on('connect', () => {
      conexao.destroy();
      resolver(true);
    });
    conexao.on('timeout', () => {
      conexao.destroy();
      resolver(false);
    });
    conexao.on('error', () => resolver(false));
  });
}

/** Tenta falar com a API a cada segundo, até ela responder */
async function esperarApi(segundos = 120) {
  for (let i = 0; i < segundos; i++) {
    try {
      const resposta = await fetch(URL_SAUDE);
      if (resposta.ok) return;
    } catch {
      // ainda ligando: tenta de novo
    }
    await new Promise((resolver) => setTimeout(resolver, 1000));
  }
  throw new Error('A API não respondeu em 2 minutos. Veja as mensagens acima.');
}

/** Se a API ou o site pararem sozinhos, avisa e desliga o outro */
function avisarSeParar(processo, nome) {
  processo.on('exit', (codigo) => {
    if (desligando) return;
    console.error(`\nERRO: ${nome} parou (código ${codigo}). Veja a mensagem de erro acima.`);
    console.error('Tire uma foto desta janela e mande para quem está ajudando.\n');
    desligar(1);
  });
}

let desligando = false;
function desligar(codigo) {
  desligando = true;
  for (const processo of processos) processo.kill();
  process.exit(codigo);
}
process.on('SIGINT', () => desligar(0));
process.on('SIGTERM', () => desligar(0));

try {
  console.log(`\nInterCamp - modo demonstração (Node.js ${process.versions.node})`);

  const versao = Number(process.versions.node.split('.')[0]);
  if (versao < NODE_MINIMO) {
    throw new Error(
      `Precisa do Node.js ${NODE_MINIMO} ou mais novo (você tem o ${process.versions.node}). ` +
        'Instale o Node.js 22 em https://nodejs.org',
    );
  }

  // 1. Portas livres? (o erro mais comum: o InterCamp já está aberto em outra janela)
  for (const porta of [PORTA_API, PORTA_SITE]) {
    if (await portaOcupada(porta)) {
      throw new Error(
        `A porta ${porta} já está sendo usada por outro programa. ` +
          'Talvez o InterCamp já esteja aberto em outra janela: feche todas as janelas do Terminal e tente de novo.',
      );
    }
  }

  // 2. Dependências. O npm só cria o arquivo node_modules/.package-lock.json
  // no FIM da instalação: se ele não existe, a instalação nunca terminou
  // (ex.: a janela foi fechada no meio), então instalamos de novo.
  for (const pasta of ['backend', 'frontend']) {
    if (!existsSync(join(PASTA, pasta, 'node_modules', '.package-lock.json'))) {
      console.log(`\n>>> Instalando as dependências do ${pasta} (só na 1ª vez, pode demorar uns minutos)...\n`);
      await esperarTerminar(npm(['install'], pasta), `instalar as dependências do ${pasta}`);
    }
  }

  // 3. API em modo demonstração
  console.log('\n>>> Ligando a API (modo demonstração)...\n');
  avisarSeParar(npm(['run', 'demo'], 'backend'), 'A API');
  await esperarApi();

  // 4. Site; --open abre o navegador quando ele estiver pronto
  console.log('\n>>> Ligando o site...\n');
  avisarSeParar(npm(['run', 'dev', '--', '--port', String(PORTA_SITE), '--strictPort', '--open'], 'frontend'), 'O site');

  console.log(`\n>>> Pronto! Se o navegador não abrir sozinho, abra ${URL_SITE}`);
  console.log('>>> Mestre: mestre@intercamp.com / intercamp123');
  console.log('>>> Deixe esta janela ABERTA enquanto usa o site. Para parar: Ctrl+C\n');
} catch (erro) {
  console.error(`\nERRO: ${erro.message}\n`);
  desligar(1);
}
