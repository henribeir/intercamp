// ============================================================
// Relógio: devolve a hora atual e se atualiza a cada intervalo.
// Usado para o minuto do jogo ao vivo andar sozinho na tela.
// ============================================================
import { useEffect, useState } from 'react';

export function useAgora(intervaloMs = 30000) {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), intervaloMs);
    return () => clearInterval(relogio);
  }, [intervaloMs]);

  return agora;
}
