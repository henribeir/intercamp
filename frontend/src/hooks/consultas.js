// ============================================================
// CONSULTAS (TanStack Query): um hook para cada dado da API.
//
// As "chaves" (queryKey) começam pelo ESCOPO do tempo real
// ('jogos', 'ranking', 'chaveamento', 'noticias'). Assim, quando
// o SSE avisa "jogos mudou", basta invalidar tudo que começa com
// ['jogos'] e o TanStack Query busca de novo sozinho.
// ============================================================
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const chaves = {
  torneio: ['torneio'],
  competicoes: ['competicoes'],
  equipes: ['equipes'],
  jogos: (filtros = {}) => ['jogos', 'lista', filtros],
  jogo: (id) => ['jogos', 'detalhe', String(id)],
  ranking: (slug) => ['ranking', slug || 'geral'],
  chaveamento: (slug) => ['chaveamento', slug],
  noticias: ['noticias', 'lista'],
  noticia: (id) => ['noticias', 'detalhe', String(id)],
};

export function useTorneio() {
  return useQuery({ queryKey: chaves.torneio, queryFn: api.torneio, staleTime: Infinity });
}

export function useCompeticoes() {
  return useQuery({ queryKey: chaves.competicoes, queryFn: api.competicoes });
}

export function useEquipes() {
  return useQuery({ queryKey: chaves.equipes, queryFn: api.equipes });
}

/** Lista de jogos; filtros opcionais { competicao, status, data } */
export function useJogos(filtros = {}) {
  return useQuery({ queryKey: chaves.jogos(filtros), queryFn: () => api.jogos(filtros) });
}

export function useJogo(id) {
  return useQuery({ queryKey: chaves.jogo(id), queryFn: () => api.jogo(id), enabled: Boolean(id) });
}

/** Ranking geral (slug vazio) ou de uma competição */
export function useRanking(slug) {
  return useQuery({ queryKey: chaves.ranking(slug), queryFn: () => api.ranking(slug || undefined) });
}

export function useChaveamento(slug) {
  return useQuery({ queryKey: chaves.chaveamento(slug), queryFn: () => api.chaveamento(slug), enabled: Boolean(slug) });
}

export function useNoticias() {
  return useQuery({ queryKey: chaves.noticias, queryFn: api.noticias });
}

export function useNoticia(id) {
  return useQuery({ queryKey: chaves.noticia(id), queryFn: () => api.noticia(id), enabled: Boolean(id) });
}
