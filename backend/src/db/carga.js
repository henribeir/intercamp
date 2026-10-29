// ============================================================
// CARGA INICIAL: apaga as tabelas, recria a estrutura e grava os
// dados REAIS da tabela oficial do Interclasse.
// Usada pelo "npm run seed" e pelos testes (com o banco em memória).
//
// Os dados foram copiados da tabela SEM corrigir nada.
// Legenda das vagas nos jogos:
//   'NOME DA TURMA' -> equipe já definida
//   null            -> a definir (célula em branco na tabela)
//   'V#n'           -> vencedor do jogo n (origem conhecida)
//   'V?'            -> "Vencedor do jogo" sem número (sorteio/definição posterior)
//   'DIRETO'        -> "Vencedor - direto" (vaga direta, origem não informada)
// ============================================================
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// ------------------------------------------------------------
// 1. TORNEIO
// ------------------------------------------------------------
export const TORNEIO = {
  nome: 'InterCamp',
  subtitulo: 'Interclasse CEM Dom Marcelino de Milão',
  organizacao: '301 INT',
  lemas: ['Esporte, união, respeito e grandes conquistas!', 'Mais que jogos, formamos grandes histórias!'],
  pontuacao: { vitoria: 3, derrota: 0 },
};

// ------------------------------------------------------------
// 2. TURMAS (equipes)
// ------------------------------------------------------------
export const EQUIPES = [
  { nome: '101', slug: '101', serie: 1, curso: null, cor: '#38BDF8' },
  { nome: '102', slug: '102', serie: 1, curso: null, cor: '#F43F5E' },
  { nome: '103', slug: '103', serie: 1, curso: null, cor: '#A3E635' },
  { nome: '200 ADM', slug: '200-adm', serie: 2, curso: 'ADM', cor: '#F97316' },
  { nome: '200 INT', slug: '200-int', serie: 2, curso: 'INT', cor: '#8B5CF6' },
  { nome: '201 INT', slug: '201-int', serie: 2, curso: 'INT', cor: '#14B8A6' },
  { nome: '300 ADM', slug: '300-adm', serie: 3, curso: 'ADM', cor: '#EAB308' },
  { nome: '300 INT', slug: '300-int', serie: 3, curso: 'INT', cor: '#EF4444' },
  { nome: '301 INT', slug: '301-int', serie: 3, curso: 'INT', cor: '#1E6BFF' },
];

// ------------------------------------------------------------
// 3. COMPETIÇÕES E JOGOS (tabela oficial)
// fase: 1, 2, 3 ou 'final'
// ------------------------------------------------------------
const REGRAS_GOLS = { formato_placar: 'gols', sets_para_vencer: null, pontos_por_set: null, pontos_set_decisivo: null };
const REGRAS_QUADRA = { formato_placar: 'sets', sets_para_vencer: 2, pontos_por_set: 25, pontos_set_decisivo: 15 };
const REGRAS_PRAIA = { formato_placar: 'sets', sets_para_vencer: 2, pontos_por_set: 21, pontos_set_decisivo: 15 };

export const COMPETICOES = [
  {
    slug: 'handebol-masculino',
    nome: 'Handebol Masculino', // na tabela impressa está escrito "HANDBOL"
    esporte: 'handebol',
    naipe: 'masculino',
    cor: '#1D4ED8', // azul
    ...REGRAS_GOLS,
    jogos: [
      { numero: 1, fase: 1, a: '201 INT', b: '300 INT' },
      { numero: 2, fase: 1, a: '101', b: '102' },
      { numero: 3, fase: 'final', a: 'V#1', b: 'V#2' },
    ],
  },
  {
    slug: 'futsal-feminino',
    nome: 'Futsal Feminino',
    esporte: 'futsal',
    naipe: 'feminino',
    cor: '#C0185D', // magenta
    ...REGRAS_GOLS,
    jogos: [
      { numero: 1, fase: 1, a: '201 INT', b: '301 INT' },
      { numero: 2, fase: 'final', a: '102', b: 'V#1' },
    ],
  },
  {
    slug: 'volei-quadra-masculino',
    nome: 'Vôlei de Quadra Masculino',
    esporte: 'volei_quadra',
    naipe: 'masculino',
    cor: '#6D28D9', // roxo
    ...REGRAS_QUADRA,
    jogos: [
      { numero: 1, fase: 1, a: '300 INT', b: '103' },
      { numero: 2, fase: 1, a: '200 INT', b: '201 INT' },
      { numero: 3, fase: 1, a: '102', b: null }, // adversário em branco na tabela
      { numero: 4, fase: 2, a: '102', b: 'V?' },
      { numero: 5, fase: 'final', a: 'V?', b: 'V#4' }, // final sem número na tabela
    ],
  },
  {
    slug: 'futsal-masculino',
    nome: 'Futsal Masculino',
    esporte: 'futsal',
    naipe: 'masculino',
    cor: '#15803D', // verde
    ...REGRAS_GOLS,
    jogos: [
      { numero: 1, fase: 1, a: '301 INT', b: '101' },
      { numero: 2, fase: 1, a: '300 ADM', b: '200 INT' },
      { numero: 3, fase: 1, a: '300 INT', b: '201 INT' },
      { numero: 4, fase: 1, a: '200 ADM', b: '103' },
      { numero: 5, fase: 1, a: '102', b: null }, // adversário em branco na tabela
      // 2ª Fase: "NO DIA HAVERÁ SORTEIO PARA FASES DO FUTSAL—MASCULINO"
      { numero: 6, fase: 2, a: '102', b: 'V?' },
      { numero: 7, fase: 2, a: 'V?', b: 'V?' },
      { numero: 8, fase: 2, a: 'DIRETO', b: null }, // vaga direta, sem adversário
      { numero: 9, fase: 3, a: 'DIRETO', b: 'V?' },
      { numero: 10, fase: 'final', a: 'DIRETO', b: 'V#9' },
    ],
  },
  {
    slug: 'volei-praia-masculino',
    nome: 'Vôlei de Praia Masculino',
    esporte: 'volei_praia',
    naipe: 'masculino',
    cor: '#EA7317', // laranja
    ...REGRAS_PRAIA,
    jogos: [
      { numero: 1, fase: 1, a: '300 INT', b: '201 INT' },
      { numero: 2, fase: 1, a: '301 INT', b: '103' },
      { numero: 3, fase: 1, a: '101', b: '102' },
      { numero: 4, fase: 2, a: 'V?', b: 'V?' },
      { numero: 5, fase: 'final', a: 'DIRETO', b: 'V#4' }, // final sem número na tabela
    ],
  },
  {
    slug: 'volei-praia-feminino',
    nome: 'Vôlei de Praia Feminino',
    esporte: 'volei_praia',
    naipe: 'feminino',
    cor: '#0F8A8F', // verde-água
    ...REGRAS_PRAIA,
    jogos: [
      // CONFIRMAR: a tabela diz apenas "201" (sem curso). Assumimos "201 INT",
      // a única turma 201. Se estiver errado, troque aqui e rode o seed de novo.
      { numero: 1, fase: 'final', a: '102', b: '201 INT' },
    ],
  },
];

// ------------------------------------------------------------
// 4. NOTÍCIAS DE EXEMPLO
// ------------------------------------------------------------
export const NOTICIAS = [
  {
    titulo: 'InterCamp 2026 começa com grandes jogos!',
    resumo: 'O Interclasse do CEM Dom Marcelino de Milão está chegando. Acompanhe tudo pelo app.',
    corpo:
      'O InterCamp, aplicativo criado pela turma 301 INT, vai mostrar em tempo real os placares, ' +
      'o chaveamento e o ranking das turmas em todas as competições do Interclasse.',
    destaque: true,
    diasAtras: 0,
  },
  {
    titulo: 'Confira a tabela de jogos do Interclasse',
    resumo: 'Seis competições, nove turmas e muita emoção no mata-mata.',
    corpo:
      'Handebol Masculino, Futsal Feminino, Futsal Masculino, Vôlei de Quadra Masculino, ' +
      'Vôlei de Praia Masculino e Vôlei de Praia Feminino. Datas e locais serão divulgados em breve.',
    destaque: false,
    diasAtras: 2,
  },
  {
    titulo: 'Regras e regulamento das competições',
    resumo: 'Entenda como funciona o mata-mata e o ranking das turmas.',
    corpo:
      'Todas as competições são eliminatórias: quem vence avança. No Futsal Masculino haverá ' +
      'sorteio no dia para as fases seguintes. Respeito e fair play acima de tudo!',
    destaque: false,
    diasAtras: 5,
  },
];

// ============================================================
// Funções auxiliares
// ============================================================

/** Converte a fase (1, 2, 3 ou 'final') para o texto exibido no app. */
function rotuloDaFase(fase) {
  return fase === 'final' ? 'Final' : `${fase}ª Fase`;
}

/**
 * Traduz uma vaga da tabela ('301 INT', 'V#1', 'V?', 'DIRETO' ou null)
 * para as colunas equipe_id, origem_jogo_id e rotulo.
 */
function interpretarVaga(vaga, idsEquipes, idsJogosDaCompeticao) {
  // Célula em branco: a definir
  if (vaga === null) {
    return { equipeId: null, origemId: null, rotulo: null };
  }

  // Vaga direta, sem origem conhecida
  if (vaga === 'DIRETO') {
    return { equipeId: null, origemId: null, rotulo: 'Vencedor - direto' };
  }

  // Vencedor de jogo sem número informado
  if (vaga === 'V?') {
    return { equipeId: null, origemId: null, rotulo: 'Vencedor do jogo' };
  }

  // Vencedor de um jogo numerado (ex.: 'V#4')
  if (vaga.startsWith('V#')) {
    const numero = Number(vaga.slice(2));
    const origemId = idsJogosDaCompeticao.get(numero);
    if (!origemId) throw new Error(`Jogo de origem ${numero} não encontrado (vaga "${vaga}")`);
    return { equipeId: null, origemId, rotulo: `Vencedor do jogo ${numero}` };
  }

  // Nome de turma
  const equipeId = idsEquipes.get(vaga);
  if (!equipeId) throw new Error(`Turma "${vaga}" não cadastrada`);
  return { equipeId, origemId: null, rotulo: null };
}

// ============================================================
// Carga completa
// ============================================================

/**
 * Apaga tudo, recria as tabelas e grava os dados oficiais.
 * Deve ser chamada dentro de uma transação: comTransacao(recriarBanco)
 * @param cliente  conexão do banco (pg ou banco em memória)
 * @param avisar   função para mensagens de progresso (padrão: silenciosa)
 */
export async function recriarBanco(cliente, avisar = () => {}) {
  const caminhoSchema = fileURLToPath(new URL('./schema.sql', import.meta.url));
  const schemaSql = await readFile(caminhoSchema, 'utf8');

  // 1) Apaga as tabelas antigas
  avisar('Apagando tabelas antigas...');
  await cliente.query('DROP TABLE IF EXISTS eventos, sets_volei, jogos, competicoes, equipes, noticias, torneio CASCADE');

  // 2) Recria a estrutura
  avisar('Criando tabelas (schema.sql)...');
  await cliente.query(schemaSql);

  // 3) Torneio
  await cliente.query(
    `INSERT INTO torneio (nome, subtitulo, organizacao, lemas, pontuacao)
     VALUES ($1, $2, $3, $4, $5)`,
    [TORNEIO.nome, TORNEIO.subtitulo, TORNEIO.organizacao, TORNEIO.lemas, TORNEIO.pontuacao],
  );

  // 4) Equipes: guardamos nome -> id para montar os jogos
  const idsEquipes = new Map();
  for (const equipe of EQUIPES) {
    const { rows } = await cliente.query(
      `INSERT INTO equipes (nome, slug, serie, curso, cor)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [equipe.nome, equipe.slug, equipe.serie, equipe.curso, equipe.cor],
    );
    idsEquipes.set(equipe.nome, rows[0].id);
  }
  avisar(`${EQUIPES.length} turmas cadastradas.`);

  // 5) Competições e seus jogos
  let totalJogos = 0;
  for (const [indice, comp] of COMPETICOES.entries()) {
    const { rows } = await cliente.query(
      `INSERT INTO competicoes
         (slug, nome, esporte, naipe, formato_placar,
          sets_para_vencer, pontos_por_set, pontos_set_decisivo, cor, ordem)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        comp.slug, comp.nome, comp.esporte, comp.naipe, comp.formato_placar,
        comp.sets_para_vencer, comp.pontos_por_set, comp.pontos_set_decisivo, comp.cor, indice + 1,
      ],
    );
    const competicaoId = rows[0].id;

    // A fase final fica uma posição depois da maior fase numerada
    const maiorFase = Math.max(0, ...comp.jogos.filter((j) => j.fase !== 'final').map((j) => j.fase));

    // número do jogo -> id, para resolver as origens "V#n"
    const idsJogos = new Map();

    for (const jogo of comp.jogos) {
      const ehFinal = jogo.fase === 'final';
      const ladoA = interpretarVaga(jogo.a, idsEquipes, idsJogos);
      const ladoB = interpretarVaga(jogo.b, idsEquipes, idsJogos);

      const { rows: jogoCriado } = await cliente.query(
        `INSERT INTO jogos
           (competicao_id, numero, fase_ordem, fase_rotulo, eh_final,
            equipe_a_id, equipe_b_id, origem_a_jogo_id, origem_b_jogo_id, rotulo_a, rotulo_b)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          competicaoId, jogo.numero, ehFinal ? maiorFase + 1 : jogo.fase, rotuloDaFase(jogo.fase), ehFinal,
          ladoA.equipeId, ladoB.equipeId, ladoA.origemId, ladoB.origemId, ladoA.rotulo, ladoB.rotulo,
        ],
      );
      idsJogos.set(jogo.numero, jogoCriado[0].id);
    }

    totalJogos += comp.jogos.length;
    avisar(`- ${comp.nome}: ${comp.jogos.length} jogo(s)`);
  }
  avisar(`${COMPETICOES.length} competições e ${totalJogos} jogos cadastrados.`);

  // 6) Notícias de exemplo (datas relativas a hoje)
  for (const noticia of NOTICIAS) {
    await cliente.query(
      `INSERT INTO noticias (titulo, resumo, corpo, destaque, publicada_em)
       VALUES ($1, $2, $3, $4, now() - make_interval(days => $5))`,
      [noticia.titulo, noticia.resumo, noticia.corpo, noticia.destaque, noticia.diasAtras],
    );
  }
  avisar(`${NOTICIAS.length} notícias de exemplo cadastradas.`);
}
