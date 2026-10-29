// ============================================================
// Botão do painel do mestre: grande, com "afundar" ao tocar
// (feedback imediato) e girando enquanto a requisição roda.
// Fica desligado enquanto carrega: evita toque duplo.
// ============================================================

const VARIANTES = {
  primaria: 'bg-primaria text-white',
  perigo: 'bg-ao-vivo text-white',
  sucesso: 'bg-sucesso text-[#052E14]',
  alerta: 'bg-alerta text-[#1A1405]',
  neutro: 'border border-borda bg-superficie-2 text-texto',
  contorno: 'border border-borda bg-transparent text-texto',
};

export function Giro({ className = 'h-4 w-4' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin ${className}`}
    />
  );
}

export default function BotaoMestre({
  children,
  variante = 'neutro',
  carregando = false,
  disabled = false,
  className = 'min-h-14 px-4',
  type = 'button',
  ...resto
}) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`flex items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-transform select-none active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {carregando && <Giro />}
      {children}
    </button>
  );
}
