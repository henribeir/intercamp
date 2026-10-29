// ============================================================
// Estado do login do mestre. Atualiza a tela sozinho quando o
// token é salvo (login) ou apagado (sair, ou API respondeu 401).
// ============================================================
import { useSyncExternalStore } from 'react';
import { assinarToken, estaLogado, lerMotivoSaida } from '../api/client';

export function useMestre() {
  const logado = useSyncExternalStore(assinarToken, estaLogado);
  const motivoSaida = useSyncExternalStore(assinarToken, lerMotivoSaida);
  return { logado, sessaoExpirou: motivoSaida === 'expirou' };
}
