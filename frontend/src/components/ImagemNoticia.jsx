// ============================================================
// Imagem da notícia. Sem imagem (ou se o link quebrar), mostra
// um fundo azul com a logo do InterCamp no lugar.
// ============================================================
import { useState } from 'react';

const LOGO = `${import.meta.env.BASE_URL}brand/logo.png`;

export default function ImagemNoticia({ url, className = '' }) {
  const [falhou, setFalhou] = useState(false);

  if (url && !falhou) {
    return <img src={url} alt="" loading="lazy" onError={() => setFalhou(true)} className={`object-cover ${className}`} />;
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-[radial-gradient(120%_100%_at_100%_0%,#1E4FD8_0%,#0B1C45_50%,#070B14_100%)] ${className}`}
    >
      <img src={LOGO} alt="" className="h-3/5 w-auto opacity-70 mix-blend-screen" />
    </div>
  );
}
