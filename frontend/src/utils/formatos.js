// ============================================================
// Funções de formatação (datas, períodos, nomes) usadas nas telas.
// São funções puras: recebem dados e devolvem texto.
// ============================================================

// ---------- Datas ----------

/** Data de hoje no formato da API: "2026-05-20" (fuso do celular) */
export function hojeISO(agora = new Date()) {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** "2026-05-20" -> Date ao meio-dia (evita "voltar um dia" pelo fuso) */
function paraData(iso) {
  return new Date(`${iso}T12:00:00`);
}

const semanaCurta = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const diaMesAno = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const semanaLonga = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });

/** Para a faixa de dias: { semana: "QUA", dia: "20" } */
export function partesDoDia(iso) {
  const data = paraData(iso);
  return {
    semana: semanaCurta.format(data).replace('.', '').slice(0, 3).toUpperCase(),
    dia: String(data.getDate()),
  };
}

/** "Hoje, 20 de maio de 2026" ou "Quinta, 21 de maio de 2026" */
export function tituloDoDia(iso, agora = new Date()) {
  const data = paraData(iso);
  const prefixo = iso === hojeISO(agora) ? 'Hoje' : semanaLonga.format(data).replace('-feira', '');
  const texto = `${prefixo}, ${diaMesAno.format(data)}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Qua 20/05" */
export function dataCurta(iso) {
  const data = paraData(iso);
  const { semana } = partesDoDia(iso);
  const diaMes = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
  return `${semana.charAt(0)}${semana.slice(1).toLowerCase()} ${diaMes}`;
}

/** "Qua · 20/05" (cabeçalho de dia no Calendário) */
export function diaDoCalendario(iso) {
  return dataCurta(iso).replace(' ', ' · ');
}

/** Data de publicação (timestamp da API) -> "20 de maio de 2026" */
export function dataPorExtenso(timestamp) {
  return diaMesAno.format(new Date(timestamp));
}

/** Quando o jogo acontece, em poucas palavras ("19:30", "Qua 20/05 · 19:30", "A definir") */
export function quandoJogo(jogo, agora = new Date()) {
  const ehHoje = jogo.data === hojeISO(agora);
  if (jogo.data && jogo.horario) return ehHoje ? jogo.horario : `${dataCurta(jogo.data)} · ${jogo.horario}`;
  if (jogo.data) return ehHoje ? 'Hoje' : dataCurta(jogo.data);
  if (jogo.horario) return jogo.horario;
  return 'A definir';
}

// ---------- Relógio e período ----------

/** Mesmo cálculo do back-end: minutos completos desde o início do período */
export function calcularMinuto(jogo, agora = new Date()) {
  const relogioCorrendo = ['1º tempo', '2º tempo'].includes(jogo.periodo);
  if (jogo.status !== 'ao_vivo' || !relogioCorrendo || !jogo.periodo_iniciado_em) return null;
  const minutos = Math.floor((agora.getTime() - new Date(jogo.periodo_iniciado_em).getTime()) / 60000);
  return Math.max(0, minutos);
}

/** Texto do momento do jogo ao vivo: "1º TEMPO · 12'", "INTERVALO" ou "Set 2 · 14 x 11" */
export function textoAoVivo(jogo, agora = new Date()) {
  if (jogo.competicao.formato_placar === 'sets') {
    const set = jogo.set_atual;
    return set ? `Set ${set.numero} · ${set.pontos_a} x ${set.pontos_b}` : 'Aguardando encerramento';
  }
  if (jogo.periodo === 'intervalo') return 'INTERVALO';
  const minuto = calcularMinuto(jogo, agora);
  const periodo = (jogo.periodo ?? 'Ao vivo').toUpperCase();
  return minuto === null ? periodo : `${periodo} · ${minuto}'`;
}

// ---------- Nomes ----------

const ESPORTES = {
  futsal: 'Futsal',
  handebol: 'Handebol',
  volei_quadra: 'Vôlei Quadra',
  volei_praia: 'Vôlei Praia',
};

/** "Futsal Masc." — cabe nos chips */
export function nomeCurtoCompeticao(competicao) {
  return `${ESPORTES[competicao.esporte] ?? competicao.nome} ${competicao.naipe === 'feminino' ? 'Fem.' : 'Masc.'}`;
}

/** "Futsal Masculino · 1ª Fase · Jogo 3" */
export function descricaoJogo(jogo) {
  return `${jogo.competicao.nome} · ${jogo.fase_rotulo} · Jogo ${jogo.numero}`;
}

/** Nome da equipe da vaga, ou o rótulo ("Vencedor do jogo 1") */
export function nomeDaVaga(jogo, lado) {
  return jogo[`equipe_${lado}`]?.nome ?? jogo[`rotulo_${lado}`] ?? 'A definir';
}

/** "301 INT" -> { numero: "301", curso: "INT" }  |  "101" -> { numero: "101", curso: null } */
export function separarNomeTurma(nome = '') {
  const [numero, ...resto] = nome.trim().split(/\s+/);
  return { numero, curso: resto.join(' ') || null };
}
