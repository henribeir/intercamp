// ============================================================
// CONTROLE AO VIVO — VÔLEI (quadra e praia)
// - Placar de sets e do set atual
// - Botões enormes "+1 ponto" por equipe e "Desfazer ponto"
// - O fim do set é automático (regra no servidor); aqui só avisamos
// - Quando alguém fecha os sets necessários, aparece "Encerrar"
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAcaoMestre, vibrar } from '../../hooks/useAcaoMestre';
import Escudo from '../Escudo';
import BotaoMestre from './BotaoMestre';
import Dialogo from './Dialogo';
import AvisoRapido, { useAvisoRapido, textoDoErro } from './AvisoRapido';
import { nomeDaVaga } from '../../utils/formatos';

export default function ControleVolei({ jogo }) {
  const acao = useAcaoMestre();
  const ocupado = acao.isPending;
  const { aviso, avisar } = useAvisoRapido();
  const [dialogo, setDialogo] = useState(null); // 'encerrar' | 'reabrir' | null

  const setsJogados = jogo.placar_a + jogo.placar_b;
  // Set mostrado: o aberto, ou o último (quando o jogo já tem vencedor)
  const setAtual = jogo.sets.find((set) => !set.encerrado) ?? jogo.sets.at(-1);
  const faltaEquipe = !jogo.equipe_a || !jogo.equipe_b;
  const nomeEquipe = (equipeId) => [jogo.equipe_a, jogo.equipe_b].find((e) => e?.id === equipeId)?.nome;

  function executar(funcao, mensagem, depois) {
    vibrar();
    acao.mutate(funcao, {
      onSuccess: (resultado) => {
        // Fechou um set? Avisa com destaque
        const setsAgora = resultado ? resultado.placar_a + resultado.placar_b : setsJogados;
        if (setsAgora > setsJogados) avisar(`Fim do ${setsAgora}º set!`);
        else if (mensagem) avisar(mensagem);
        depois?.();
      },
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  const ponto = (time, delta) => executar(() => api.registrarPonto(jogo.id, time, delta), delta < 0 ? 'Ponto desfeito' : null);
  const status = (acaoStatus, mensagem) =>
    executar(() => api.alterarStatus(jogo.id, acaoStatus), mensagem, () => setDialogo(null));

  const vencedorLado = jogo.placar_a > jogo.placar_b ? 'a' : 'b';

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Placar ---------- */}
      <section aria-label="Placar" className="rounded-3xl border border-borda bg-superficie p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          {['a', 'b'].map((lado, indice) => (
            <div key={lado} className={`flex min-w-0 flex-col items-center gap-1 ${indice === 1 ? 'order-3' : ''}`}>
              <Escudo equipe={jogo[`equipe_${lado}`]} tamanho={40} />
              <span className="w-full truncate font-display text-lg font-bold">{nomeDaVaga(jogo, lado)}</span>
              <span className="numeros-fixos font-display text-5xl leading-none font-bold">
                {setAtual ? setAtual[`pontos_${lado}`] : 0}
              </span>
            </div>
          ))}
          <div className="order-2 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-texto-2 uppercase">Sets</span>
            <span className="numeros-fixos font-display text-3xl font-bold" aria-live="polite">
              {jogo.placar_a} - {jogo.placar_b}
            </span>
            {setAtual && <span className="mt-1 text-xs font-semibold text-ao-vivo uppercase">Set {setAtual.numero}</span>}
          </div>
        </div>
        {jogo.sets.length > 1 && (
          <p className="numeros-fixos mt-3 text-center text-xs text-texto-2">
            {jogo.sets.filter((s) => s.encerrado).map((s) => `${s.pontos_a}-${s.pontos_b}`).join(' · ')}
          </p>
        )}
      </section>

      {/* ---------- Antes de começar ---------- */}
      {jogo.status === 'agendado' &&
        (faltaEquipe ? (
          <p className="rounded-2xl border border-alerta/40 bg-alerta/10 p-4 text-sm text-alerta">
            Há vaga "a definir". Escolha as turmas em{' '}
            <Link to="/mestre/confrontos" className="font-semibold underline">
              Definir confrontos
            </Link>{' '}
            antes de iniciar.
          </p>
        ) : (
          <BotaoMestre variante="sucesso" className="min-h-16 text-lg" carregando={ocupado} onClick={() => status('iniciar', 'Partida iniciada!')}>
            Iniciar partida
          </BotaoMestre>
        ))}

      {/* ---------- Jogo decidido: pode encerrar ---------- */}
      {jogo.status === 'ao_vivo' && jogo.pronto_para_encerrar && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl border border-sucesso/50 bg-sucesso/10 p-4">
          <p className="text-sm">
            <strong className="text-sucesso">{nomeDaVaga(jogo, vencedorLado)}</strong> venceu {jogo.placar_a} x {jogo.placar_b} em sets.
            O jogo já pode ser encerrado.
          </p>
          <BotaoMestre variante="perigo" className="min-h-16 text-lg" disabled={ocupado} onClick={() => setDialogo('encerrar')}>
            Encerrar jogo
          </BotaoMestre>
        </div>
      )}

      {/* ---------- Pontos ---------- */}
      {jogo.status === 'ao_vivo' && (
        <section aria-label="Marcar pontos" className="grid grid-cols-2 gap-3">
          {['A', 'B'].map((time) => {
            const lado = time.toLowerCase();
            return (
              <div key={time} className="flex flex-col gap-2">
                <BotaoMestre
                  variante={time === 'A' ? 'primaria' : 'perigo'}
                  className="min-h-36 flex-col px-2"
                  disabled={ocupado || jogo.pronto_para_encerrar}
                  onClick={() => ponto(time, 1)}
                  aria-label={`Mais um ponto para ${nomeDaVaga(jogo, lado)}`}
                >
                  <span className="font-display text-5xl leading-none font-bold">+1</span>
                  <span className="max-w-full truncate text-sm">{nomeDaVaga(jogo, lado)}</span>
                </BotaoMestre>
                <BotaoMestre
                  variante="contorno"
                  className="min-h-12 px-2 text-sm"
                  disabled={ocupado}
                  onClick={() => ponto(time, -1)}
                  aria-label={`Desfazer ponto de ${nomeDaVaga(jogo, lado)}`}
                >
                  Desfazer ponto
                </BotaoMestre>
              </div>
            );
          })}
        </section>
      )}

      {/* ---------- Encerrado ---------- */}
      {jogo.status === 'encerrado' && (
        <>
          <p className="text-center text-sm text-texto-2">
            Vitória de <strong className="text-texto">{nomeEquipe(jogo.vencedor_id)}</strong>. O vencedor já foi para o próximo jogo.
          </p>
          <BotaoMestre variante="contorno" className="min-h-12" disabled={ocupado} onClick={() => setDialogo('reabrir')}>
            Reabrir jogo (corrigir)
          </BotaoMestre>
        </>
      )}

      <Dialogo aberto={dialogo === 'encerrar'} aoFechar={() => setDialogo(null)} titulo="Encerrar o jogo?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-2">
            Vitória de <strong className="text-texto">{nomeDaVaga(jogo, vencedorLado)}</strong> por {jogo.placar_a} x {jogo.placar_b} em sets.
          </p>
          <BotaoMestre variante="perigo" className="min-h-16 text-lg" carregando={ocupado} onClick={() => status('encerrar', 'Jogo encerrado')}>
            Encerrar jogo
          </BotaoMestre>
          <BotaoMestre variante="contorno" className="min-h-12" onClick={() => setDialogo(null)}>
            Cancelar
          </BotaoMestre>
        </div>
      </Dialogo>

      <Dialogo aberto={dialogo === 'reabrir'} aoFechar={() => setDialogo(null)} titulo="Reabrir o jogo?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-2">
            O jogo volta para "ao vivo" (use "Desfazer ponto" para corrigir) e o vencedor sai da vaga do próximo jogo.
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
