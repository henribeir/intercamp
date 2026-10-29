// ============================================================
// Aviso rápido ("Gol registrado!", "Erro: ...") que some sozinho.
// Uso:
//   const { aviso, avisar } = useAvisoRapido();
//   avisar('Salvo!');  avisar('Falhou', 'erro');
//   <AvisoRapido aviso={aviso} />
// ============================================================
import { useCallback, useEffect, useState } from 'react';

const DURACAO_MS = 2600;

export function useAvisoRapido() {
  const [aviso, setAviso] = useState(null);

  const avisar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return undefined;
    const relogio = setTimeout(() => setAviso(null), aviso.tipo === 'erro' ? DURACAO_MS * 2 : DURACAO_MS);
    return () => clearTimeout(relogio);
  }, [aviso]);

  return { aviso, avisar };
}

/** Mensagem de erro da API, incluindo os campos inválidos (erros 400) */
export function textoDoErro(erro) {
  if (erro?.detalhes?.length) {
    return erro.detalhes.map((d) => `${d.campo}: ${d.mensagem}`).join(' · ');
  }
  return erro?.message || 'Algo deu errado. Tente de novo.';
}

export default function AvisoRapido({ aviso }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      {aviso && (
        <p
          key={aviso.id}
          className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
            aviso.tipo === 'erro' ? 'bg-ao-vivo text-white' : 'bg-sucesso text-[#052E14]'
          }`}
        >
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
