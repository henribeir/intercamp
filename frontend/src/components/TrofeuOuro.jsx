// ============================================================
// Troféu dourado em SVG (banners do Ranking e do Chaveamento).
// ============================================================
import { useId } from 'react';

export default function TrofeuOuro({ className = 'h-20 w-auto' }) {
  const idOuro = useId();
  const ouro = `url(#${idOuro})`;

  return (
    <svg viewBox="0 0 64 72" className={`shrink-0 drop-shadow-[0_0_18px_rgba(250,204,21,0.45)] ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={idOuro} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="55%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M16 6h32v16c0 10-7 18-16 18S16 32 16 22Z" fill={ouro} />
      <path d="M16 11H7c0 9 5 14 11 15M48 11h9c0 9-5 14-11 15" fill="none" stroke={ouro} strokeWidth="4" />
      <path d="M28 40h8v10h-8z" fill={ouro} />
      <path d="M18 56h28l3 10H15z" fill={ouro} />
      <path d="M24 12c0 8 2 13 5 16" stroke="#FFF7D6" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
}
