// ============================================================
// TEMPO REAL: ouve o servidor (SSE em /api/stream) e, a cada
// aviso { escopo, jogoId }, manda o TanStack Query buscar de
// novo SÓ o que mudou.
//
// Se a conexão cair:
//   - o navegador tenta reconectar sozinho (EventSource faz isso);
//   - enquanto estiver fora, buscamos tudo de novo a cada 15 s;
//   - se o navegador desistir, abrimos uma conexão nova em 15 s.
// ============================================================
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { URL_STREAM } from '../api/client';

const INTERVALO_RESERVA_MS = 15000;

// Qual escopo do servidor invalida quais consultas (veja hooks/consultas.js)
const CONSULTAS_POR_ESCOPO = {
  jogos: [['jogos']],
  chaveamento: [['chaveamento'], ['competicoes']], // campeão aparece nas competições
  ranking: [['ranking'], ['equipes']], // mudanças de turma também chegam como "ranking"
  noticias: [['noticias']],
};

export function useTempoReal() {
  const queryClient = useQueryClient();
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    let fonte = null;
    let relogioReserva = null;
    let relogioReabrir = null;
    let jaCaiu = false;

    // Busca de novo tudo o que está na tela
    const atualizarTudo = () => queryClient.invalidateQueries();

    function ligarReserva() {
      if (!relogioReserva) relogioReserva = setInterval(atualizarTudo, INTERVALO_RESERVA_MS);
    }
    function desligarReserva() {
      clearInterval(relogioReserva);
      relogioReserva = null;
    }

    function abrir() {
      fonte = new EventSource(URL_STREAM);

      fonte.onopen = () => {
        setConectado(true);
        desligarReserva();
        // Voltou depois de uma queda? Pode ter perdido avisos: atualiza tudo
        if (jaCaiu) atualizarTudo();
      };

      fonte.onmessage = (evento) => {
        try {
          const { escopo } = JSON.parse(evento.data);
          for (const queryKey of CONSULTAS_POR_ESCOPO[escopo] ?? []) {
            queryClient.invalidateQueries({ queryKey });
          }
        } catch {
          // mensagem fora do formato: ignora
        }
      };

      fonte.onerror = () => {
        setConectado(false);
        jaCaiu = true;
        ligarReserva();
        // CLOSED = o navegador desistiu de reconectar; tentamos nós
        if (fonte.readyState === EventSource.CLOSED) {
          fonte.close();
          clearTimeout(relogioReabrir);
          relogioReabrir = setTimeout(abrir, INTERVALO_RESERVA_MS);
        }
      };
    }

    abrir();

    // Ao sair da tela (ou do app), fecha tudo
    return () => {
      fonte?.close();
      desligarReserva();
      clearTimeout(relogioReabrir);
    };
  }, [queryClient]);

  return { conectado };
}
