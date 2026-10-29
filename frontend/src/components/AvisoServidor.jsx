// ============================================================
// Aviso de "servidor acordando": aparece quando a primeira
// resposta da API demora mais de 4 s (Render gratuito dormindo).
// ============================================================
import { useServidorAcordando } from '../hooks/useServidorAcordando';

export default function AvisoServidor() {
  const acordando = useServidorAcordando();
  if (!acordando) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
    >
      <p className="flex items-center gap-3 rounded-2xl border border-alerta/40 bg-[#1F1A06] px-4 py-3 text-sm text-alerta shadow-lg">
        <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full border-2 border-alerta border-t-transparent motion-safe:animate-spin" />
        Acordando o servidor, pode levar até 1 minuto…
      </p>
    </div>
  );
}
