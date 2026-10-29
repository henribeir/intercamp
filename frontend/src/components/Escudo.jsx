// ============================================================
// ESCUDO da turma.
// - Se a turma tem escudo_url, mostra a imagem. Pode ser um link
//   completo (https://...) ou um arquivo da pasta public/escudos
//   ("escudos/301-int.png").
// - Senão, desenha um escudo na cor da turma com o número
//   ("301") e o curso ("INT").
// - Sem equipe (vaga "a definir"): escudo tracejado com "?".
// ============================================================
import { useId } from 'react';
import { separarNomeTurma } from '../utils/formatos';

/** "escudos/301-int.png" -> "/nome-do-repo/escudos/301-int.png"; links completos ficam iguais */
function enderecoDoEscudo(url) {
  return /^https?:\/\//i.test(url) ? url : `${import.meta.env.BASE_URL}${url.replace(/^\/+/, '')}`;
}

// Contorno do escudo (desenhado numa área de 40 x 48)
const CONTORNO = 'M20 2.5 36.5 8v13.5c0 11-7.2 19.4-16.5 23.5C10.7 40.9 3.5 32.5 3.5 21.5V8Z';

export default function Escudo({ equipe, tamanho = 44, className = '' }) {
  const idGradiente = useId();
  const altura = Math.round(tamanho * 1.2);

  // Vaga "a definir"
  if (!equipe) {
    return (
      <svg width={tamanho} height={altura} viewBox="0 0 40 48" aria-hidden="true" className={className}>
        <path d={CONTORNO} fill="#0E1626" stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="3.5 3" />
        <text x="20" y="29" textAnchor="middle" fill="#94A3B8" fontSize="15" fontWeight="700" fontFamily="Barlow Condensed, sans-serif">
          ?
        </text>
      </svg>
    );
  }

  // Escudo enviado pela turma
  if (equipe.escudo_url) {
    return (
      <img
        src={enderecoDoEscudo(equipe.escudo_url)}
        alt=""
        width={tamanho}
        height={altura}
        loading="lazy"
        className={`object-contain ${className}`}
        style={{ width: tamanho, height: altura }}
      />
    );
  }

  // Escudo desenhado com número e curso
  const cor = equipe.cor || '#2563EB';
  const { numero, curso } = separarNomeTurma(equipe.nome);

  return (
    <svg width={tamanho} height={altura} viewBox="0 0 40 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} />
          <stop offset="100%" stopColor={cor} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d={CONTORNO} fill="#0B1220" />
      <path d={CONTORNO} fill={`url(#${idGradiente})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      {/* Brilho no topo */}
      <path d="M6 9.5 20 4.8l14 4.7v3.2c-9-2.2-19-2.2-28 0Z" fill="rgba(255,255,255,0.18)" />
      <text
        x="20"
        y={curso ? 26 : 30}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={numero.length > 3 ? 11 : 14}
        fontWeight="700"
        fontFamily="Barlow Condensed, sans-serif"
        style={{ paintOrder: 'stroke' }}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1.2"
      >
        {numero}
      </text>
      {curso && (
        <text x="20" y="35.5" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="700" letterSpacing="0.6" fontFamily="Inter, sans-serif" opacity="0.92">
          {curso}
        </text>
      )}
    </svg>
  );
}
