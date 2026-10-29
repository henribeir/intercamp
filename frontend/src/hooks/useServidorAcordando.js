// ============================================================
// true enquanto a primeira resposta da API está demorando
// (servidor do Render "acordando"). Veja api/client.js.
// ============================================================
import { useSyncExternalStore } from 'react';
import { assinarAcordando, estaAcordando } from '../api/client';

export function useServidorAcordando() {
  return useSyncExternalStore(assinarAcordando, estaAcordando);
}
