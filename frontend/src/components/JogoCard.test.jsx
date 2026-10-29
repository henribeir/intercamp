// ============================================================
// JogoCard nos três status: em breve, ao vivo e encerrado.
// ============================================================
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JogoCard from './JogoCard';
import { criarJogo, VOLEI, T201, T300 } from '../testes/dados';

// O card é um link: precisa de um "roteador" em volta
function desenhar(jogo, agora = new Date('2026-05-20T19:42:40Z')) {
  return render(
    <MemoryRouter>
      <JogoCard jogo={jogo} agora={agora} />
    </MemoryRouter>,
  );
}

describe('JogoCard', () => {
  it('EM BREVE: mostra "vs", horário a definir e a fase no lugar do grupo', () => {
    desenhar(criarJogo());

    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();
    expect(screen.getByText('A definir')).toBeInTheDocument();
    expect(screen.getByText('Futsal Masculino · 1ª Fase · Jogo 3')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/jogos/13');
  });

  it('EM BREVE com vaga indefinida: mostra o rótulo da vaga', () => {
    desenhar(criarJogo({ equipe_b: null, rotulo_b: 'Vencedor do jogo 1' }));
    expect(screen.getByText('Vencedor do jogo 1')).toBeInTheDocument();
  });

  it('AO VIVO (gols): placar "1 - 0" e "1º TEMPO · 12\'"', () => {
    desenhar(
      criarJogo({
        status: 'ao_vivo',
        periodo: '1º tempo',
        periodo_iniciado_em: '2026-05-20T19:30:00Z', // 12 min e 40 s antes de "agora"
        placar_a: 1,
      }),
    );

    expect(screen.getByText('Ao vivo')).toBeInTheDocument();
    expect(screen.getByText("1º TEMPO · 12'")).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(/Ao vivo, 1 a 0/);
  });

  it('AO VIVO (vôlei): sets no placar e "Set 2 · 14 x 11"', () => {
    desenhar(
      criarJogo({
        competicao: VOLEI,
        status: 'ao_vivo',
        placar_a: 1,
        set_atual: { numero: 2, pontos_a: 14, pontos_b: 11 },
      }),
    );

    expect(screen.getByText('Set 2 · 14 x 11')).toBeInTheDocument();
    expect(screen.getByText('sets')).toBeInTheDocument();
  });

  it('ENCERRADO: "Fim de jogo", placar final e perdedor apagado', () => {
    desenhar(criarJogo({ status: 'encerrado', placar_a: 1, placar_b: 2, vencedor_id: T300.id }));

    expect(screen.getByText('Encerrado')).toBeInTheDocument();
    expect(screen.getByText('Fim de jogo')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(/Encerrado, 1 a 2/);
    // O lado da 201 INT (que perdeu) fica com opacidade reduzida
    const nomePerdedor = screen.getByText(T201.nome);
    expect(nomePerdedor.parentElement).toHaveClass('opacity-55');
    expect(screen.getByText(T300.nome).parentElement).not.toHaveClass('opacity-55');
  });
});
