// ============================================================
// CLIENTE DA API: todas as chamadas ao back-end passam por aqui.
// - Monta a URL a partir de VITE_API_URL
// - Envia o token do mestre (guardado no localStorage)
// - Transforma erros em mensagens legíveis (ErroApi)
// - Avisa quando o servidor está "acordando" (Render gratuito)
// ============================================================

const URL_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const URL_STREAM = `${URL_BASE}/api/stream`;
export const CHAVE_TOKEN = 'mestre_token';

/** Erro com mensagem pronta para mostrar na tela. */
export class ErroApi extends Error {
  constructor(mensagem, status = 0, detalhes = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status; // 0 = sem conexão
    this.detalhes = detalhes; // campos inválidos (erros 400)
  }
}

// ------------------------------------------------------------
// Token do mestre (localStorage pode falhar em aba anônima)
// As telas "assinam" mudanças no token: quando ele é salvo ou
// apagado (ex.: a API respondeu 401), o painel volta ao login.
// ------------------------------------------------------------
const ouvintesToken = new Set();
let motivoSaida = null; // 'expirou' quando a API recusou o token

function avisarMudancaToken() {
  ouvintesToken.forEach((ouvinte) => ouvinte());
}

/** Lê o "exp" de dentro do JWT (sem validar: quem valida é a API) */
function tokenVencido(token) {
  try {
    const [, conteudo] = token.split('.');
    const { exp } = JSON.parse(atob(conteudo.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true; // token estranho = trata como vencido
  }
}

/** Token válido guardado, ou null */
export function lerToken() {
  let token = null;
  try {
    token = localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
  return token && !tokenVencido(token) ? token : null;
}

function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // sem armazenamento: o login vale só até recarregar a página
  }
  motivoSaida = null;
  avisarMudancaToken();
}

/** Apaga o token. motivo = 'expirou' mostra o aviso na tela de login. */
export function apagarToken(motivo = null) {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // nada a fazer
  }
  motivoSaida = motivo;
  avisarMudancaToken();
}

/** Para o hook useMestre (useSyncExternalStore) */
export function assinarToken(ouvinte) {
  ouvintesToken.add(ouvinte);
  return () => ouvintesToken.delete(ouvinte);
}
export const estaLogado = () => Boolean(lerToken());
export const lerMotivoSaida = () => motivoSaida;

// ------------------------------------------------------------
// "Acordando o servidor": no plano gratuito do Render a API
// dorme quando ninguém usa. A 1ª resposta pode levar ~1 minuto.
// ------------------------------------------------------------
const ESPERA_PARA_AVISAR_MS = 4000;
let primeiraRespostaChegou = false;
let servidorAcordando = false;
const ouvintesAcordando = new Set();

function definirAcordando(valor) {
  if (servidorAcordando === valor) return;
  servidorAcordando = valor;
  ouvintesAcordando.forEach((ouvinte) => ouvinte());
}

/** Para o hook useServidorAcordando (useSyncExternalStore). */
export function assinarAcordando(ouvinte) {
  ouvintesAcordando.add(ouvinte);
  return () => ouvintesAcordando.delete(ouvinte);
}
export const estaAcordando = () => servidorAcordando;

// ------------------------------------------------------------
// Requisição genérica
// ------------------------------------------------------------
const MENSAGENS_POR_STATUS = {
  400: 'Dados inválidos.',
  401: 'Faça login como mestre para continuar.',
  404: 'Não encontrado.',
  409: 'Esta ação não é permitida agora.',
  429: 'Muitas tentativas. Aguarde alguns minutos.',
  500: 'O servidor teve um problema. Tente de novo.',
};

async function requisitar(caminho, { metodo = 'GET', corpo, comToken = false } = {}) {
  const cabecalhos = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (comToken) {
    const token = lerToken();
    if (!token) {
      apagarToken('expirou');
      throw new ErroApi('Sua sessão expirou. Entre de novo.', 401);
    }
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  // Se a primeiríssima resposta demorar, mostra o aviso
  const vigia = primeiraRespostaChegou ? null : setTimeout(() => definirAcordando(true), ESPERA_PARA_AVISAR_MS);

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi('Sem conexão com o servidor. Verifique sua internet e tente de novo.', 0);
  } finally {
    clearTimeout(vigia);
  }

  primeiraRespostaChegou = true;
  definirAcordando(false);

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // Token vencido ou inválido: sai do modo mestre e volta ao login
    if (resposta.status === 401 && comToken) apagarToken('expirou');
    const mensagem = dados?.erro || MENSAGENS_POR_STATUS[resposta.status] || `Erro ${resposta.status}.`;
    throw new ErroApi(mensagem, resposta.status, dados?.detalhes ?? null);
  }

  return dados;
}

/** Monta "?a=1&b=2" ignorando valores vazios. */
function parametros(objeto = {}) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(objeto)) {
    if (valor !== undefined && valor !== null && valor !== '') busca.set(chave, valor);
  }
  const texto = busca.toString();
  return texto ? `?${texto}` : '';
}

// ------------------------------------------------------------
// Todas as rotas da API
// ------------------------------------------------------------
const comoMestre = (metodo, caminho, corpo) => requisitar(caminho, { metodo, corpo, comToken: true });

export const api = {
  // ---------- Públicas ----------
  saude: () => requisitar('/health'),
  torneio: () => requisitar('/torneio'),
  competicoes: () => requisitar('/competicoes'),
  chaveamento: (slug) => requisitar(`/competicoes/${encodeURIComponent(slug)}/chaveamento`),
  ranking: (competicao) => requisitar(`/ranking${parametros({ competicao })}`),
  equipes: () => requisitar('/equipes'),
  jogos: (filtros) => requisitar(`/jogos${parametros(filtros)}`), // { competicao, status, data }
  jogo: (id) => requisitar(`/jogos/${id}`),
  noticias: () => requisitar('/noticias'),
  noticia: (id) => requisitar(`/noticias/${id}`),

  // ---------- Login do mestre ----------
  async entrar(email, senha) {
    // Login não usa token; um 401 aqui é "senha errada", não "sessão expirou"
    const resposta = await requisitar('/auth/login', { metodo: 'POST', corpo: { email, senha } });
    salvarToken(resposta.token);
    return resposta;
  },
  sair: () => apagarToken(),
  estaLogado,

  // ---------- Mestre: equipes ----------
  criarEquipe: (dados) => comoMestre('POST', '/equipes', dados),
  editarEquipe: (id, dados) => comoMestre('PATCH', `/equipes/${id}`, dados),
  excluirEquipe: (id) => comoMestre('DELETE', `/equipes/${id}`),

  // ---------- Mestre: jogos ----------
  criarJogo: (dados) => comoMestre('POST', '/jogos', dados),
  editarJogo: (id, dados) => comoMestre('PATCH', `/jogos/${id}`, dados),
  excluirJogo: (id) => comoMestre('DELETE', `/jogos/${id}`),
  definirConfronto: (id, dados) => comoMestre('PATCH', `/jogos/${id}/confronto`, dados),

  // ---------- Mestre: andamento da partida ----------
  alterarStatus: (id, acao, vencedorId) =>
    comoMestre('PATCH', `/jogos/${id}/status`, vencedorId ? { acao, vencedor_id: vencedorId } : { acao }),
  registrarEvento: (id, evento) => comoMestre('POST', `/jogos/${id}/eventos`, evento),
  desfazerEvento: (id, eventoId) => comoMestre('DELETE', `/jogos/${id}/eventos/${eventoId}`),
  registrarPonto: (id, time, delta) => comoMestre('POST', `/jogos/${id}/pontos`, { time, delta }),

  // ---------- Mestre: notícias ----------
  criarNoticia: (dados) => comoMestre('POST', '/noticias', dados),
  editarNoticia: (id, dados) => comoMestre('PATCH', `/noticias/${id}`, dados),
  excluirNoticia: (id) => comoMestre('DELETE', `/noticias/${id}`),
};
