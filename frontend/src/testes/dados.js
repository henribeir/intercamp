// ============================================================
// Dados de exemplo no mesmo formato que a API devolve.
// ============================================================

export const FUTSAL = {
  id: 4,
  slug: 'futsal-masculino',
  nome: 'Futsal Masculino',
  cor: '#15803D',
  esporte: 'futsal',
  formato_placar: 'gols',
  sets_para_vencer: null,
};

export const VOLEI = {
  id: 5,
  slug: 'volei-praia-masculino',
  nome: 'Vôlei de Praia Masculino',
  cor: '#EA7317',
  esporte: 'volei_praia',
  formato_placar: 'sets',
  sets_para_vencer: 2,
};

export const T201 = { id: 6, nome: '201 INT', slug: '201-int', cor: '#14B8A6', escudo_url: null };
export const T300 = { id: 8, nome: '300 INT', slug: '300-int', cor: '#EF4444', escudo_url: null };

/** Jogo de futsal; passe só o que muda em cada teste */
export function criarJogo(mudancas = {}) {
  return {
    id: 13,
    numero: 3,
    fase_ordem: 1,
    fase_rotulo: '1ª Fase',
    eh_final: false,
    competicao: FUTSAL,
    equipe_a: T201,
    equipe_b: T300,
    rotulo_a: null,
    rotulo_b: null,
    local: 'Quadra da Escola',
    data: null,
    horario: null,
    status: 'agendado',
    periodo: null,
    periodo_iniciado_em: null,
    placar_a: 0,
    placar_b: 0,
    set_atual: null,
    vencedor_id: null,
    ...mudancas,
  };
}
