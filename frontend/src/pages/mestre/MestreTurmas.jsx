// ============================================================
// TURMAS DO MESTRE (/mestre/turmas): editar nome, cor e escudo.
// A prévia do escudo muda enquanto se digita.
// ============================================================
import { useState } from 'react';
import { api } from '../../api/client';
import { useEquipes } from '../../hooks/consultas';
import { useAcaoMestre, vibrar } from '../../hooks/useAcaoMestre';
import TituloPagina from '../../components/TituloPagina';
import Escudo from '../../components/Escudo';
import BotaoMestre from '../../components/mestre/BotaoMestre';
import { Campo } from '../../components/mestre/Campos';
import AvisoRapido, { useAvisoRapido, textoDoErro } from '../../components/mestre/AvisoRapido';
import { Carregando, Erro } from '../../components/Estados';

function FormTurma({ equipe, aoTerminar, avisar }) {
  const acao = useAcaoMestre();
  const inicial = { nome: equipe.nome, cor: equipe.cor ?? '#2563EB', escudo_url: equipe.escudo_url ?? '' };
  const [valores, setValores] = useState(inicial);
  const mudar = (campo) => (evento) => setValores((atual) => ({ ...atual, [campo]: evento.target.value }));

  // Só o que mudou; link vazio = sem escudo (null)
  const alteracoes = {};
  if (valores.nome.trim() !== inicial.nome) alteracoes.nome = valores.nome.trim();
  if (valores.cor.toUpperCase() !== inicial.cor.toUpperCase()) alteracoes.cor = valores.cor.toUpperCase();
  if (valores.escudo_url.trim() !== inicial.escudo_url) alteracoes.escudo_url = valores.escudo_url.trim() || null;
  const nadaMudou = Object.keys(alteracoes).length === 0;

  function salvar(evento) {
    evento.preventDefault();
    vibrar();
    acao.mutate(() => api.editarEquipe(equipe.id, alteracoes), {
      onSuccess: () => {
        avisar(`Turma ${alteracoes.nome ?? equipe.nome} salva`);
        aoTerminar();
      },
      onError: (erro) => avisar(textoDoErro(erro), 'erro'),
    });
  }

  const previa = { ...equipe, nome: valores.nome || equipe.nome, cor: valores.cor, escudo_url: valores.escudo_url || null };

  return (
    <form onSubmit={salvar} className="flex flex-col gap-3 border-t border-borda p-4">
      <div className="flex justify-center">
        <Escudo equipe={previa} tamanho={64} />
      </div>
      <Campo rotulo="Nome" value={valores.nome} onChange={mudar('nome')} maxLength={40} required />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`cor-${equipe.id}`} className="text-sm font-medium text-texto-2">
          Cor
        </label>
        <div className="flex items-center gap-3">
          <input
            id={`cor-${equipe.id}`}
            type="color"
            value={valores.cor}
            onChange={mudar('cor')}
            className="h-12 w-16 cursor-pointer rounded-xl border border-borda bg-fundo p-1"
          />
          <span className="numeros-fixos text-sm text-texto-2">{valores.cor.toUpperCase()}</span>
        </div>
      </div>
      {/* type="text" (e não "url"): também aceita arquivo do site, "escudos/101.png" */}
      <Campo
        rotulo="Escudo"
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        value={valores.escudo_url}
        onChange={mudar('escudo_url')}
        placeholder="escudos/101.png ou https://..."
        dica="Opcional. Arquivo da pasta public/escudos (ex.: escudos/101.png) ou um link. Vazio = escudo desenhado com o número da turma."
      />
      <div className="grid grid-cols-2 gap-2">
        <BotaoMestre variante="contorno" onClick={aoTerminar}>
          Cancelar
        </BotaoMestre>
        <BotaoMestre type="submit" variante="primaria" carregando={acao.isPending} disabled={nadaMudou || !valores.nome.trim()}>
          Salvar
        </BotaoMestre>
      </div>
    </form>
  );
}

export default function MestreTurmas() {
  const { data: equipes, isPending, isError, error, refetch } = useEquipes();
  const [aberta, setAberta] = useState(null); // id da turma em edição
  const { aviso, avisar } = useAvisoRapido();

  return (
    <>
      <TituloPagina titulo="Turmas" voltar />
      {isPending && <Carregando tipo="linhas" quantidade={5} />}
      {isError && <Erro erro={error} tentarDeNovo={refetch} />}

      <ul className="flex flex-col gap-2">
        {equipes?.map((equipe) => (
          <li key={equipe.id} className="overflow-hidden rounded-2xl border border-borda bg-superficie">
            <button
              type="button"
              aria-expanded={aberta === equipe.id}
              onClick={() => setAberta(aberta === equipe.id ? null : equipe.id)}
              className="flex min-h-16 w-full items-center gap-3 px-4 text-left"
            >
              <Escudo equipe={equipe} tamanho={32} />
              <span className="flex-1 font-display text-lg font-bold">{equipe.nome}</span>
              <span className="text-sm font-semibold text-primaria-clara">{aberta === equipe.id ? 'Fechar' : 'Editar'}</span>
            </button>
            {aberta === equipe.id && <FormTurma equipe={equipe} aoTerminar={() => setAberta(null)} avisar={avisar} />}
          </li>
        ))}
      </ul>

      <AvisoRapido aviso={aviso} />
    </>
  );
}
