// ============================================================
// Campos de formulário do painel do mestre.
// Fonte de 16 px: evita que o iPhone dê zoom ao tocar no campo.
// ============================================================
import { useId } from 'react';

export const classeCampo =
  'w-full min-h-12 rounded-xl border border-borda bg-fundo px-3 text-base text-texto placeholder:text-texto-2/60 focus:border-primaria-clara focus:outline-none';

export function Campo({ rotulo, dica, multilinha = false, ...resto }) {
  const id = useId();
  const Elemento = multilinha ? 'textarea' : 'input';
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-texto-2">
        {rotulo}
      </label>
      <Elemento id={id} className={`${classeCampo} ${multilinha ? 'min-h-32 py-2' : ''}`} {...resto} />
      {dica && <p className="text-xs text-texto-2">{dica}</p>}
    </div>
  );
}

export function Selecao({ rotulo, dica, children, ...resto }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-texto-2">
        {rotulo}
      </label>
      <select id={id} className={classeCampo} {...resto}>
        {children}
      </select>
      {dica && <p className="text-xs text-texto-2">{dica}</p>}
    </div>
  );
}
