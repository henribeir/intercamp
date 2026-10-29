// ============================================================
// SOBRE O INTERCAMP: o texto fica em src/content/sobre.md.
// Logo da escola: coloque o arquivo em public/brand/logo-cem.png
// (enquanto não existir, aparece um espaço reservado).
// ============================================================
import { useState } from 'react';
import TituloPagina from '../components/TituloPagina';
import TextoFormatado from '../components/TextoFormatado';
import sobre from '../content/sobre.md?raw';

const LOGO_APP = `${import.meta.env.BASE_URL}brand/logo.png`;
const LOGO_ESCOLA = `${import.meta.env.BASE_URL}brand/logo-cem.png`;

function LogoEscola() {
  const [semImagem, setSemImagem] = useState(false);

  if (semImagem) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl border-2 border-dashed border-borda px-4 text-center text-xs text-texto-2">
        Espaço para o logo do CEM Dom Marcelino de Milão
        <br />
        (public/brand/logo-cem.png)
      </div>
    );
  }
  return (
    <div className="flex h-28 items-center justify-center rounded-2xl bg-white p-3">
      <img
        src={LOGO_ESCOLA}
        alt="Logo do CEM Dom Marcelino de Milão"
        onError={() => setSemImagem(true)}
        className="max-h-full w-auto object-contain"
      />
    </div>
  );
}

export default function Sobre() {
  return (
    <>
      <TituloPagina titulo="Sobre o InterCamp" voltar />

      <div className="flex flex-col items-center text-center">
        <img src={LOGO_APP} alt="InterCamp" className="h-32 w-auto mix-blend-screen" />
        <p className="mt-3 font-display text-[26px] leading-tight font-bold uppercase">
          Mais que jogos, <span className="text-alerta">formamos grandes histórias!</span>
        </p>
        <p className="mt-1 text-sm text-texto-2">Interclasse CEM Dom Marcelino de Milão · By 301 INT</p>
      </div>

      <div className="mt-6">
        <TextoFormatado texto={sobre} />
      </div>

      <div className="mt-6">
        <LogoEscola />
      </div>
    </>
  );
}
