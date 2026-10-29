// ============================================================
// DEFINIR CONFRONTOS (/mestre/confrontos)
// Para cada jogo agendado: escolher as turmas (ex.: depois do
// sorteio do Futsal Masculino) e preencher data, horário e local.
// Só os campos alterados são enviados para a API.
// ============================================================
import { useState } from 'react';
import { api } from '../../api/client';
import { useEquipes, useJogos } from '../../hooks/consultas';
import { useAcaoMestre, vibrar } from '../../hooks/useAcaoMestre';
import TituloPagina from '../../components/TituloPagina';
import Abas from '../../components/Abas';
import BotaoMestre from '../../components/mestre/BotaoMestre';
import { Campo, Selecao } from '../../components/mestre/Campos';
import AvisoRapido, { useAvisoRapido, textoDoErro } from '../../components/mestre/AvisoRapido';
import { Carregando, Erro, Vazio } from '../../components/Estados';

const FILTROS = [
  { valor: 'indefinidos', rotulo: 'Vaga a definir' },
  { valor: 'agendados', rotulo: 'Todos os agendados' },
];

/** Converte o valor do <select> ("" = a definir) em id ou null */
const paraId = (valor) => (valor === '' ? null : Number(valor));

function FormConfronto({ jogo, equipes, avisar }) {
  const acao = useAcaoMestre();
  const inicial = {
    equipe_a_id: jogo.equipe_a?.id ?? '',
    equipe_b_id: jogo.equipe_b?.id ?? '',
    data: jogo.data ?? '',
    horario: jogo.horario ?? '',
    local: jogo.local ?? '',
  };
  const [valores, setValores] = useState(inicial);
  const mudar = (campo) => (evento) => setValores((atual) => ({ ...atual, [campo]: evento.target.value }));

  // Monta só o que mudou ("" vira null = "a definir")
  const alteracoes = {};
  for (const campo of Object.keys(inicial)) {
    if (String(valores[campo]) === String(inicial[campo])) continue;
    if (campo.endsWith('_id')) alteracoes[campo] = paraId(valores[campo]);
    else alteracoes[campo] = valores[campo].trim() === '' ? null : valores[campo].trim();
  }
  const equipesIguais = valores.equipe_a_id !== '' && String(valores.equipe_a_id) === String(valores.equipe_b_id);
  const nadaMudou = Object.keys(alteracoes).length === 0;

  function salvar(evento) {
    evento.preventDefault();
    vibrar();
    acao.mutate(() => api.definirConfronto(jogo.id, alteracoes), {
      onSuccess: () => avisar(`Jogo ${jogo.numero} salvo`),
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  const opcoes = (
    <>
      <option value="">A definir</option>
      {equipes.map((equipe) => (
        <option key={equipe.id} value={equipe.id}>
          {equipe.nome}
        </option>
      ))}
    </>
  );

  return (
    <form
      onSubmit={salvar}
      style={{ '--cor': jogo.competicao.cor }}
      className="flex flex-col gap-3 rounded-2xl border border-borda bg-superficie p-4"
    >
      <h3 className="texto-cor text-sm font-semibold">
        {jogo.competicao.nome} · {jogo.fase_rotulo} · Jogo {jogo.numero}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Selecao rotulo="Equipe A" value={valores.equipe_a_id} onChange={mudar('equipe_a_id')} dica={jogo.rotulo_a ? `Vaga: ${jogo.rotulo_a}` : null}>
          {opcoes}
        </Selecao>
        <Selecao rotulo="Equipe B" value={valores.equipe_b_id} onChange={mudar('equipe_b_id')} dica={jogo.rotulo_b ? `Vaga: ${jogo.rotulo_b}` : null}>
          {opcoes}
        </Selecao>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data" type="date" value={valores.data} onChange={mudar('data')} />
        <Campo rotulo="Horário" type="time" value={valores.horario} onChange={mudar('horario')} />
      </div>
      <Campo rotulo="Local" value={valores.local} onChange={mudar('local')} maxLength={80} placeholder="Ex.: Quadra da Escola" />

      {equipesIguais && (
        <p role="alert" className="text-sm font-medium text-ao-vivo">
          Equipe A e equipe B devem ser diferentes.
        </p>
      )}

      <BotaoMestre type="submit" variante="primaria" carregando={acao.isPending} disabled={nadaMudou || equipesIguais}>
        {nadaMudou ? 'Sem alterações' : 'Salvar'}
      </BotaoMestre>
    </form>
  );
}

export default function MestreConfrontos() {
  const jogos = useJogos();
  const equipes = useEquipes();
  const [filtro, setFiltro] = useState('indefinidos');
  const { aviso, avisar } = useAvisoRapido();

  const lista = (jogos.data ?? []).filter(
    (jogo) => jogo.status === 'agendado' && (filtro === 'agendados' || !jogo.equipe_a || !jogo.equipe_b),
  );

  return (
    <>
      <TituloPagina titulo="Definir confrontos" voltar />
      <Abas abas={FILTROS} valor={filtro} aoMudar={setFiltro} rotulo="Quais jogos mostrar" />

      <div className="mt-4 flex flex-col gap-4">
        {(jogos.isPending || equipes.isPending) && <Carregando quantidade={2} />}
        {jogos.isError && <Erro erro={jogos.error} tentarDeNovo={jogos.refetch} />}
        {jogos.data && equipes.data && lista.length === 0 && (
          <Vazio titulo="Nenhum jogo com vaga a definir" texto="Todos os confrontos agendados já têm as duas turmas." />
        )}
        {equipes.data &&
          lista.map((jogo) => (
            // A "key" com atualizado_em recria o formulário quando o jogo muda no servidor
            <FormConfronto key={`${jogo.id}-${jogo.atualizado_em}`} jogo={jogo} equipes={equipes.data} avisar={avisar} />
          ))}
      </div>

      <AvisoRapido aviso={aviso} />
    </>
  );
}
