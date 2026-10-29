// ============================================================
// Cálculos PUROS sobre uma partida de gols:
// minuto do relógio e estatísticas tiradas dos eventos.
// ============================================================

// Períodos em que o relógio está correndo
const PERIODOS_COM_RELOGIO = ['1º tempo', '2º tempo'];

/**
 * Minuto atual do período (contado a partir de periodo_iniciado_em).
 * Devolve null se o jogo não estiver ao vivo com o relógio correndo.
 * Ex.: período começou há 12 min e 40 s -> 12
 */
export function calcularMinuto(jogo, agora = new Date()) {
  if (jogo.status !== 'ao_vivo' || !PERIODOS_COM_RELOGIO.includes(jogo.periodo) || !jogo.periodo_iniciado_em) {
    return null;
  }
  const milissegundos = agora.getTime() - new Date(jogo.periodo_iniciado_em).getTime();
  return Math.max(0, Math.floor(milissegundos / 60000));
}

function estatisticasZeradas() {
  return { gols: 0, finalizacoes: 0, finalizacoes_alvo: 0, faltas: 0, cartoes_amarelos: 0, cartoes_vermelhos: 0 };
}

/**
 * Conta as estatísticas de cada lado ('a' e 'b') a partir dos eventos.
 * Como no futebol: todo gol também conta como finalização no alvo,
 * e toda finalização no alvo também conta como finalização.
 * Assim o mestre registra cada lance uma única vez.
 */
export function contarEstatisticas(eventos, equipeAId, equipeBId) {
  const estatisticas = { a: estatisticasZeradas(), b: estatisticasZeradas() };

  for (const evento of eventos) {
    let lado = null;
    if (evento.equipe_id != null && evento.equipe_id === equipeAId) lado = 'a';
    else if (evento.equipe_id != null && evento.equipe_id === equipeBId) lado = 'b';
    if (!lado) continue; // eventos sem equipe (início, intervalo, fim)

    const contagem = estatisticas[lado];
    switch (evento.tipo) {
      case 'gol':
        contagem.gols += 1;
        contagem.finalizacoes_alvo += 1;
        contagem.finalizacoes += 1;
        break;
      case 'finalizacao_alvo':
        contagem.finalizacoes_alvo += 1;
        contagem.finalizacoes += 1;
        break;
      case 'finalizacao':
        contagem.finalizacoes += 1;
        break;
      case 'falta':
        contagem.faltas += 1;
        break;
      case 'cartao_amarelo':
        contagem.cartoes_amarelos += 1;
        break;
      case 'cartao_vermelho':
        contagem.cartoes_vermelhos += 1;
        break;
      default:
        break;
    }
  }

  return estatisticas;
}
