// ============================================================
// CONTROLE AO VIVO — FUTSAL E HANDEBOL
// - Placar grande e cronômetro do período
// - Iniciar / Intervalo / 2º tempo / Encerrar (com confirmação;
//   empate pede o vencedor antes de encerrar)
// - Grade de botões grandes por equipe: Gol (com jogador opcional),
//   cartões, falta e finalizações
// - Últimos lances com "Desfazer"
// Enquanto uma ação roda, todos os botões ficam desligados.
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAcaoMestre, vibrar } from '../../hooks/useAcaoMestre';
import { useAgora } from '../../hooks/useAgora';
import Escudo from '../Escudo';
import BotaoMestre from './BotaoMestre';
import Dialogo from './Dialogo';
import AvisoRapido, { useAvisoRapido, textoDoErro } from './AvisoRapido';
import { classeCampo } from './Campos';
import { IconeAlvo, IconeApito, IconeBola, IconeCartao } from '../Icones';
import { nomeDaVaga } from '../../utils/formatos';

const ROTULOS = {
  gol: 'Gol',
  cartao_amarelo: 'Cartão amarelo',
  cartao_vermelho: 'Cartão vermelho',
  falta: 'Falta',
  finalizacao: 'Finalização',
  finalizacao_alvo: 'Finalização no alvo',
  inicio: 'Início da partida',
  intervalo: 'Intervalo',
  fim: 'Fim de jogo',
};

// Botões menores, abaixo do "Gol"
const OUTROS_LANCES = [
  { tipo: 'cartao_amarelo', rotulo: 'Amarelo', Icone: (p) => <IconeCartao cor="#FACC15" {...p} /> },
  { tipo: 'cartao_vermelho', rotulo: 'Vermelho', Icone: (p) => <IconeCartao cor="#EF4444" {...p} /> },
  { tipo: 'falta', rotulo: 'Falta', Icone: IconeApito },
  { tipo: 'finalizacao', rotulo: 'Finalização', Icone: IconeAlvo },
  { tipo: 'finalizacao_alvo', rotulo: 'No alvo', Icone: (p) => <IconeAlvo className="text-primaria-clara" {...p} /> },
];

const LANCES_DE_CONTROLE = ['inicio', 'intervalo', 'fim'];
const COR_DO_LADO = { a: 'primaria', b: 'perigo' }; // azul x vermelho, como nas estatísticas

/** "07:42" desde o início do período */
function cronometro(jogo, agora) {
  if (jogo.status !== 'ao_vivo' || !jogo.periodo_iniciado_em) return null;
  const segundos = Math.max(0, Math.floor((agora - new Date(jogo.periodo_iniciado_em)) / 1000));
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
}

function Placar({ jogo }) {
  const agora = useAgora(1000); // cronômetro anda de segundo em segundo
  const tempo = cronometro(jogo, agora);

  return (
    <section aria-label="Placar" className="rounded-3xl border border-borda bg-superficie p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        {['a', 'b'].map((lado, indice) => (
          <div key={lado} className={`flex min-w-0 flex-col items-center gap-1 ${indice === 1 ? 'order-3' : ''}`}>
            <Escudo equipe={jogo[`equipe_${lado}`]} tamanho={44} />
            <span className="w-full truncate font-display text-lg font-bold">{nomeDaVaga(jogo, lado)}</span>
          </div>
        ))}
        <p className="numeros-fixos order-2 font-display text-6xl leading-none font-bold" aria-live="polite">
          {jogo.placar_a}
          <span className="mx-2 text-texto-2">-</span>
          {jogo.placar_b}
        </p>
      </div>
      <p className="mt-3 text-center text-sm font-semibold uppercase">
        {jogo.status === 'agendado' && <span className="text-texto-2">Não começou</span>}
        {jogo.status === 'encerrado' && <span className="text-texto-2">Encerrado</span>}
        {jogo.status === 'ao_vivo' && (
          <span className="text-ao-vivo">
            {jogo.periodo}
            {tempo && <span className="numeros-fixos ml-2 font-display text-2xl text-texto">{tempo}</span>}
          </span>
        )}
      </p>
    </section>
  );
}

export default function ControleGols({ jogo }) {
  const acao = useAcaoMestre();
  const ocupado = acao.isPending;
  const { aviso, avisar } = useAvisoRapido();

  const [golDe, setGolDe] = useState(null); // 'a' | 'b' enquanto escolhe o jogador
  const [jogador, setJogador] = useState('');
  const [dialogo, setDialogo] = useState(null); // 'encerrar' | 'reabrir' | null

  /** Executa uma ação na API com feedback (vibração + aviso) */
  function executar(funcao, mensagem, depois) {
    vibrar();
    acao.mutate(funcao, {
      onSuccess: () => {
        avisar(mensagem);
        depois?.();
      },
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  const status = (acaoStatus, mensagem, vencedorId) =>
    executar(() => api.alterarStatus(jogo.id, acaoStatus, vencedorId), mensagem, () => setDialogo(null));

  const lance = (lado, tipo, extra = {}) =>
    executar(
      () => api.registrarEvento(jogo.id, { tipo, equipe_id: jogo[`equipe_${lado}`].id, ...extra }),
      `${ROTULOS[tipo]} · ${nomeDaVaga(jogo, lado)}`,
    );

  function confirmarGol(nome) {
    const lado = golDe;
    setGolDe(null);
    setJogador('');
    lance(lado, 'gol', nome ? { jogador: nome } : {});
  }

  // Nomes já usados pela equipe (escolha rápida no gol)
  const jogadoresDe = (lado) => {
    const id = jogo[`equipe_${lado}`]?.id;
    return [...new Set(jogo.eventos.filter((e) => e.equipe_id === id && e.jogador).map((e) => e.jogador))].slice(0, 6);
  };

  const empate = jogo.placar_a === jogo.placar_b;
  const lider = jogo.placar_a > jogo.placar_b ? 'a' : 'b';
  const faltaEquipe = !jogo.equipe_a || !jogo.equipe_b;
  const nomeEquipe = (equipeId) => [jogo.equipe_a, jogo.equipe_b].find((e) => e?.id === equipeId)?.nome;

  return (
    <div className="flex flex-col gap-4">
      <Placar jogo={jogo} />

      {/* ---------- Andamento ---------- */}
      <section aria-label="Andamento da partida" className="grid grid-cols-2 gap-2">
        {jogo.status === 'agendado' &&
          (faltaEquipe ? (
            <p className="col-span-2 rounded-2xl border border-alerta/40 bg-alerta/10 p-4 text-sm text-alerta">
              Há vaga "a definir". Escolha as turmas em{' '}
              <Link to="/mestre/confrontos" className="font-semibold underline">
                Definir confrontos
              </Link>{' '}
              antes de iniciar.
            </p>
          ) : (
            <BotaoMestre variante="sucesso" className="col-span-2 min-h-16 text-lg" carregando={ocupado} onClick={() => status('iniciar', 'Partida iniciada!')}>
              Iniciar partida
            </BotaoMestre>
          ))}

        {jogo.status === 'ao_vivo' && jogo.periodo === '1º tempo' && (
          <BotaoMestre variante="alerta" disabled={ocupado} onClick={() => status('intervalo', 'Intervalo')}>
            Intervalo
          </BotaoMestre>
        )}
        {jogo.status === 'ao_vivo' && jogo.periodo === 'intervalo' && (
          <BotaoMestre variante="sucesso" disabled={ocupado} onClick={() => status('segundo_tempo', '2º tempo começou!')}>
            Iniciar 2º tempo
          </BotaoMestre>
        )}
        {jogo.status === 'ao_vivo' && (
          <BotaoMestre
            variante="perigo"
            className={`min-h-14 px-4 ${jogo.periodo === '2º tempo' ? 'col-span-2' : ''}`}
            disabled={ocupado}
            onClick={() => setDialogo('encerrar')}
          >
            Encerrar jogo
          </BotaoMestre>
        )}

        {jogo.status === 'encerrado' && (
          <>
            <p className="col-span-2 text-center text-sm text-texto-2">
              Vitória de <strong className="text-texto">{nomeEquipe(jogo.vencedor_id)}</strong>. O vencedor já foi para o próximo jogo.
            </p>
            <BotaoMestre variante="contorno" className="col-span-2 min-h-12 px-4" disabled={ocupado} onClick={() => setDialogo('reabrir')}>
              Reabrir jogo (corrigir)
            </BotaoMestre>
          </>
        )}
      </section>

      {/* ---------- Lances por equipe ---------- */}
      {jogo.status === 'ao_vivo' && (
        <section aria-label="Registrar lances" className="grid grid-cols-2 gap-3">
          {['a', 'b'].map((lado) => (
            <div key={lado} className="flex flex-col gap-2">
              <p className={`truncate text-center font-display text-lg font-bold ${lado === 'a' ? 'text-primaria-clara' : 'text-ao-vivo'}`}>
                {nomeDaVaga(jogo, lado)}
              </p>
              <BotaoMestre
                variante={COR_DO_LADO[lado]}
                className="min-h-20 px-2 text-xl"
                disabled={ocupado}
                onClick={() => {
                  vibrar();
                  setGolDe(lado);
                }}
              >
                <IconeBola tamanho={26} />
                Gol
              </BotaoMestre>
              {OUTROS_LANCES.map(({ tipo, rotulo, Icone }) => (
                <BotaoMestre key={tipo} className="min-h-14 justify-start px-3 text-sm" disabled={ocupado} onClick={() => lance(lado, tipo)}>
                  <Icone tamanho={20} />
                  {rotulo}
                </BotaoMestre>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* ---------- Últimos lances ---------- */}
      {jogo.eventos.length > 0 && (
        <section aria-labelledby="titulo-lances" className="rounded-2xl border border-borda bg-superficie p-3">
          <h2 id="titulo-lances" className="mb-1 px-1 font-semibold">
            Últimos lances
          </h2>
          <ul className="divide-y divide-borda/60">
            {jogo.eventos.slice(0, 10).map((evento) => (
              <li key={evento.id} className="flex min-h-14 items-center gap-3 px-1">
                <span className="numeros-fixos w-8 text-sm font-semibold text-texto-2">{evento.minuto != null ? `${evento.minuto}'` : ''}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{ROTULOS[evento.tipo] ?? evento.tipo}</span>
                  <span className="block truncate text-xs text-texto-2">
                    {[evento.jogador, nomeEquipe(evento.equipe_id)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {!LANCES_DE_CONTROLE.includes(evento.tipo) && jogo.status !== 'encerrado' && (
                  <BotaoMestre
                    variante="contorno"
                    className="min-h-11 px-3 text-sm"
                    disabled={ocupado}
                    onClick={() => executar(() => api.desfazerEvento(jogo.id, evento.id), `Desfeito: ${ROTULOS[evento.tipo]}`)}
                  >
                    Desfazer
                  </BotaoMestre>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Gol: escolha rápida do jogador (opcional) ---------- */}
      <Dialogo aberto={golDe !== null} aoFechar={() => setGolDe(null)} titulo={`Gol de ${golDe ? nomeDaVaga(jogo, golDe) : ''}`}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(evento) => {
            evento.preventDefault();
            confirmarGol(jogador.trim());
          }}
        >
          {golDe && jogadoresDe(golDe).length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Jogadores que já marcaram lances">
              {jogadoresDe(golDe).map((nome) => (
                <button key={nome} type="button" onClick={() => confirmarGol(nome)} className="min-h-11 rounded-full border border-borda bg-superficie-2 px-4 text-sm font-semibold">
                  {nome}
                </button>
              ))}
            </div>
          )}
          <label className="text-sm text-texto-2" htmlFor="nome-jogador">
            Jogador (opcional)
          </label>
          <input
            id="nome-jogador"
            className={classeCampo}
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
            maxLength={60}
            autoComplete="off"
            placeholder="Ex.: Pedro Silva"
          />
          <BotaoMestre type="submit" variante={golDe ? COR_DO_LADO[golDe] : 'primaria'} className="min-h-16 text-lg">
            Confirmar gol
          </BotaoMestre>
          <BotaoMestre variante="contorno" className="min-h-12" onClick={() => setGolDe(null)}>
            Cancelar
          </BotaoMestre>
        </form>
      </Dialogo>

      {/* ---------- Encerrar (empate pede o vencedor) ---------- */}
      <Dialogo
        aberto={dialogo === 'encerrar'}
        aoFechar={() => setDialogo(null)}
        titulo={empate ? 'Jogo empatado: quem venceu?' : 'Encerrar o jogo?'}
      >
        <div className="flex flex-col gap-3">
          {empate ? (
            <>
              <p className="text-sm text-texto-2">
                Placar {jogo.placar_a} x {jogo.placar_b}. Escolha quem venceu nos pênaltis ou no desempate.
              </p>
              {['a', 'b'].map((lado) => (
                <BotaoMestre
                  key={lado}
                  variante={COR_DO_LADO[lado]}
                  className="min-h-16 text-lg"
                  carregando={ocupado}
                  onClick={() => status('encerrar', 'Jogo encerrado', jogo[`equipe_${lado}`].id)}
                >
                  Vitória de {nomeDaVaga(jogo, lado)}
                </BotaoMestre>
              ))}
            </>
          ) : (
            <>
              <p className="text-sm text-texto-2">
                Placar final {jogo.placar_a} x {jogo.placar_b}: vitória de{' '}
                <strong className="text-texto">{nomeDaVaga(jogo, lider)}</strong>, que avança no chaveamento.
              </p>
              <BotaoMestre variante="perigo" className="min-h-16 text-lg" carregando={ocupado} onClick={() => status('encerrar', 'Jogo encerrado')}>
                Encerrar jogo
              </BotaoMestre>
            </>
          )}
          <BotaoMestre variante="contorno" className="min-h-12" onClick={() => setDialogo(null)}>
            Cancelar
          </BotaoMestre>
        </div>
      </Dialogo>

      {/* ---------- Reabrir ---------- */}
      <Dialogo aberto={dialogo === 'reabrir'} aoFechar={() => setDialogo(null)} titulo="Reabrir o jogo?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-2">
            O jogo volta para "ao vivo" e o vencedor sai da vaga do próximo jogo. Só funciona se o próximo jogo ainda não começou.
          </p>
          <BotaoMestre variante="alerta" className="min-h-14" carregando={ocupado} onClick={() => status('reabrir', 'Jogo reaberto')}>
            Reabrir
          </BotaoMestre>
          <BotaoMestre variante="contorno" className="min-h-12" onClick={() => setDialogo(null)}>
            Cancelar
          </BotaoMestre>
        </div>
      </Dialogo>

      <AvisoRapido aviso={aviso} />
    </div>
  );
}
