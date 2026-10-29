// ============================================================
// TABELA OFICIAL: mostra a imagem /public/tabela-oficial.png
// com zoom: pinça com dois dedos, duplo toque ou botões + / −.
// A imagem fica dentro de um quadro rolável (arrastar = navegar).
// ============================================================
import { useRef, useState } from 'react';
import TituloPagina from '../components/TituloPagina';

const IMAGEM = `${import.meta.env.BASE_URL}tabela-oficial.png`;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

const limitar = (valor) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, valor));

export default function TabelaOficial() {
  const [zoom, setZoom] = useState(1);
  const [falhou, setFalhou] = useState(false);
  const dedos = useRef(new Map()); // dedos encostados na tela
  const pinca = useRef(null); // { distancia, zoom } quando a pinça começou

  const distanciaEntreDedos = () => {
    const [a, b] = [...dedos.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  function aoTocar(evento) {
    dedos.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (dedos.current.size === 2) pinca.current = { distancia: distanciaEntreDedos(), zoom };
  }

  function aoMover(evento) {
    if (!dedos.current.has(evento.pointerId)) return;
    dedos.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (dedos.current.size === 2 && pinca.current) {
      setZoom(limitar((pinca.current.zoom * distanciaEntreDedos()) / pinca.current.distancia));
    }
  }

  function aoSoltar(evento) {
    dedos.current.delete(evento.pointerId);
    if (dedos.current.size < 2) pinca.current = null;
  }

  const botao = 'flex h-11 min-w-11 items-center justify-center rounded-xl border border-borda bg-superficie px-3 text-lg font-bold';

  return (
    <>
      <TituloPagina titulo="Tabela oficial" voltar />

      <div className="mb-3 flex items-center gap-2" role="group" aria-label="Zoom">
        <button type="button" className={botao} onClick={() => setZoom((z) => limitar(z - 0.5))} aria-label="Diminuir zoom">
          −
        </button>
        <span className="numeros-fixos w-14 text-center text-sm text-texto-2" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" className={botao} onClick={() => setZoom((z) => limitar(z + 0.5))} aria-label="Aumentar zoom">
          +
        </button>
        <button type="button" className={`${botao} ml-auto text-sm`} onClick={() => setZoom(1)}>
          Ajustar
        </button>
      </div>

      {falhou ? (
        <p className="rounded-2xl border border-dashed border-borda p-6 text-center text-sm text-texto-2">
          Coloque a imagem da tabela em <code>frontend/public/tabela-oficial.png</code>.
        </p>
      ) : (
        <div
          className="h-[70dvh] overflow-auto overscroll-contain rounded-2xl border border-borda bg-white"
          // pan-x pan-y: o navegador rola; a pinça fica com o nosso código
          style={{ touchAction: 'pan-x pan-y' }}
          onPointerDown={aoTocar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2.5))}
        >
          <img
            src={IMAGEM}
            alt="Tabela oficial de jogos do Interclasse CEM Dom Marcelino de Milão"
            onError={() => setFalhou(true)}
            draggable="false"
            className="block max-w-none select-none"
            style={{ width: `${zoom * 100}%` }}
          />
        </div>
      )}

      <p className="mt-3 text-xs text-texto-2">Use dois dedos ou toque duas vezes para ampliar.</p>
      <a href={IMAGEM} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primaria-clara">
        Abrir a imagem em tela cheia
      </a>
    </>
  );
}
