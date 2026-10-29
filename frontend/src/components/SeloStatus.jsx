// ============================================================
// SELO do status do jogo: AO VIVO (vermelho, piscando),
// EM BREVE (azul) ou ENCERRADO (cinza).
// ============================================================

const ESTILOS = {
  ao_vivo: { texto: 'Ao vivo', classe: 'bg-ao-vivo text-white' },
  agendado: { texto: 'Em breve', classe: 'bg-primaria text-white' },
  encerrado: { texto: 'Encerrado', classe: 'bg-superficie-2 text-texto-2 border border-borda' },
};

export default function SeloStatus({ status, className = '' }) {
  const estilo = ESTILOS[status] ?? ESTILOS.agendado;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${estilo.classe} ${className}`}
    >
      {status === 'ao_vivo' && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
      {estilo.texto}
    </span>
  );
}
