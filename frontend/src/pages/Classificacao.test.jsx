// ============================================================
// Tabela do ranking com as três situações (campeã, em disputa,
// eliminada). Os hooks da API são trocados por dados fixos.
// ============================================================
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Classificacao from './Classificacao';
import { T201, T300 } from '../testes/dados';

const T102 = { id: 2, nome: '102', slug: '102', cor: '#F43F5E', escudo_url: null };

const linha = (equipe, posicao, situacao, numeros) => ({
  posicao,
  equipe,
  situacao,
  pontos: numeros[0],
  jogos: numeros[1],
  vitorias: numeros[2],
  derrotas: numeros[3],
  titulos: situacao === 'campea' ? 1 : 0,
  saldo: null,
});

// vi.mock troca o módulo inteiro só neste arquivo de teste
vi.mock('../hooks/consultas', () => ({
  useCompeticoes: () => ({ data: [], isPending: false, isError: false }),
  useRanking: () => ({
    isPending: false,
    isError: false,
    data: {
      competicao: null,
      pontuacao: { vitoria: 3, derrota: 0 },
      classificacao: [
        linha(T102, 1, 'campea', [6, 2, 2, 0]),
        linha(T300, 2, 'em_disputa', [3, 1, 1, 0]),
        linha(T201, 3, 'eliminada', [0, 2, 0, 2]),
      ],
    },
  }),
}));

describe('Classificação (Ranking das turmas)', () => {
  it('mostra a tabela com P J V D e sem SG no ranking geral', () => {
    render(
      <MemoryRouter>
        <Classificacao />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Ranking das turmas' })).toBeInTheDocument();
    const tabela = screen.getByRole('table', { name: 'Ranking das turmas' });
    const cabecalhos = within(tabela).getAllByRole('columnheader').map((th) => th.textContent);
    expect(cabecalhos).toEqual(['#', 'Turma', 'P', 'J', 'V', 'D']);
  });

  it('cada situação tem sua cor na faixa lateral e o texto para leitores de tela', () => {
    render(
      <MemoryRouter>
        <Classificacao />
      </MemoryRouter>,
    );

    const esperado = [
      ['102', 'Campeã', '#2563EB'],
      ['300 INT', 'Em disputa', '#FACC15'],
      ['201 INT', 'Eliminada', '#EF4444'],
    ];

    for (const [nome, situacao, cor] of esperado) {
      // Nome acessível da célula: "102 (Campeã)" (a situação vem do texto escondido sr-only)
      const celulaTurma = screen.getByRole('rowheader', { name: new RegExp(`^${nome}\\s*\\(${situacao}\\)`) });
      const linhaDaTabela = celulaTurma.closest('tr');
      const celulaPosicao = within(linhaDaTabela).getAllByRole('cell')[0];
      expect(celulaPosicao.style.boxShadow).toContain(cor);
    }
  });

  it('mostra a legenda das três situações e o banner "Rumo ao título"', () => {
    render(
      <MemoryRouter>
        <Classificacao />
      </MemoryRouter>,
    );

    const legenda = screen.getByRole('list', { name: 'Legenda' });
    expect(within(legenda).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Campeã', 'Em disputa', 'Eliminada']);
    expect(screen.getByRole('region', { name: 'Rumo ao título' })).toBeInTheDocument();
  });
});
