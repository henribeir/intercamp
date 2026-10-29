// ============================================================
// ÍCONES em SVG (sem biblioteca externa).
// Todos usam "currentColor": herdam a cor do texto onde estão.
// aria-hidden: são decorativos; o texto ao lado explica a ação.
// ============================================================

function Svg({ children, tamanho = 24, className = '', ...resto }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...resto}
    >
      {children}
    </svg>
  );
}

// ---------- Barra inferior ----------
export const IconeInicio = (props) => (
  <Svg {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </Svg>
);

export const IconeBola = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7.5 3.2 2.3-1.2 3.7h-4l-1.2-3.7z" />
    <path d="M12 3v4.5M15.2 9.8l4.4-1.6M14 13.5l2.6 3.8M10 13.5l-2.6 3.8M8.8 9.8 4.4 8.2" />
  </Svg>
);

export const IconeRanking = (props) => (
  <Svg {...props}>
    <path d="M4 20h16" />
    <rect x="5" y="11" width="3.5" height="7" rx="0.8" />
    <rect x="10.25" y="5" width="3.5" height="13" rx="0.8" />
    <rect x="15.5" y="8.5" width="3.5" height="9.5" rx="0.8" />
  </Svg>
);

export const IconeChaveamento = (props) => (
  <Svg {...props}>
    <path d="M3 5h5v4H3zM3 15h5v4H3z" />
    <path d="M8 7h3v10H8M11 12h4" />
    <path d="M15 10h6v4h-6z" />
  </Svg>
);

export const IconeMais = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

// ---------- Navegação ----------
export const IconeCalendario = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8 14h2M14 14h2M8 17.5h2" />
  </Svg>
);

export const IconeVoltar = (props) => (
  <Svg {...props}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
);

export const IconeSeta = (props) => (
  <Svg {...props}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const IconeAtualizar = (props) => (
  <Svg {...props}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Svg>
);

// ---------- Menu "Mais" e painel do mestre ----------
export const IconeLista = (props) => (
  <Svg {...props}>
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <path d="M8 8.5h8M8 12h8M8 15.5h5" />
  </Svg>
);

export const IconeInfo = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.2" />
  </Svg>
);

export const IconeImagem = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m20.5 16-5-5-8.5 8.5" />
  </Svg>
);

export const IconeJornal = (props) => (
  <Svg {...props}>
    <path d="M5 4.5h11.5v15H6.5A1.5 1.5 0 0 1 5 18z" />
    <path d="M16.5 8.5H19v9.5a1.5 1.5 0 0 1-1.5 1.5M8 8h5.5M8 11.5h5.5M8 15h3.5" />
  </Svg>
);

export const IconeEquipes = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
    <circle cx="17" cy="9.5" r="2.4" />
    <path d="M15.8 14.6c2.2-.3 4 .9 4.7 3.4" />
  </Svg>
);

// ---------- Partida ----------
export const IconeTrofeu = (props) => (
  <Svg {...props}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" />
    <path d="M12 13v3M9 20h6M10 16h4l1 4H9z" />
  </Svg>
);

export const IconeApito = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="14" r="5" />
    <path d="M12.5 10.5 21 7v4l-6.2 1.6" />
    <path d="M6 4l1 2M10 3v2.2" />
  </Svg>
);

export const IconeAlvo = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Svg>
);

/** Cartão (amarelo ou vermelho): retângulo preenchido */
export function IconeCartao({ cor = '#FACC15', ...props }) {
  return (
    <Svg {...props} stroke="none">
      <rect x="7" y="3.5" width="10" height="15" rx="1.8" fill={cor} transform="rotate(8 12 11)" />
    </Svg>
  );
}

// ---------- Esportes ----------
export const IconeHandebol = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9.5c4 .5 7-1.5 8.5-6.5M20.5 14.5c-4-.5-7 1.5-8.5 6.5" />
    <path d="M6 18.5c2-3 6-4 12-12.5" />
  </Svg>
);

export const IconeVolei = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-1 4 0 7.5 3 9.5s6.5 2 8 1" />
    <path d="M12 12c-3.5 1-6 3.5-7 7.5" />
    <path d="M12 12c-2-3.5-5.5-5-9-4.5" />
  </Svg>
);

export const IconeVoleiPraia = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="13" r="7" />
    <path d="M10 6c-.8 3 0 5.5 2.3 7.1S17 14.6 17 14.6" />
    <path d="M10 13c-2.7.8-4.6 2.7-5.4 5.8" />
    <circle cx="19" cy="5" r="2" />
    <path d="M19 1.5v.8M22.5 5h-.8M21.5 2.5l-.6.6" />
  </Svg>
);

/** Ícone certo para cada esporte da competição */
export function IconeEsporte({ esporte, ...props }) {
  if (esporte === 'handebol') return <IconeHandebol {...props} />;
  if (esporte === 'volei_quadra') return <IconeVolei {...props} />;
  if (esporte === 'volei_praia') return <IconeVoleiPraia {...props} />;
  return <IconeBola {...props} />;
}
