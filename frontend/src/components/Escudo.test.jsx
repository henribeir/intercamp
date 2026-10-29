// ============================================================
// Escudo: imagem (link ou arquivo de public/escudos), desenhado
// com o número da turma, ou tracejado para "a definir".
// ============================================================
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Escudo from './Escudo';

describe('Escudo', () => {
  it('arquivo da pasta escudos/ vira endereço dentro do site', () => {
    const { container } = render(<Escudo equipe={{ id: 1, nome: '101', escudo_url: 'escudos/101.png' }} />);
    expect(container.querySelector('img')).toHaveAttribute('src', `${import.meta.env.BASE_URL}escudos/101.png`);
  });

  it('link completo é usado como está', () => {
    const { container } = render(<Escudo equipe={{ id: 1, nome: '101', escudo_url: 'https://exemplo.com/101.png' }} />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://exemplo.com/101.png');
  });

  it('sem imagem: desenha o número e o curso da turma', () => {
    render(<Escudo equipe={{ id: 9, nome: '301 INT', cor: '#1E6BFF', escudo_url: null }} />);
    expect(screen.getByText('301')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
  });

  it('vaga "a definir": escudo tracejado com "?"', () => {
    const { container } = render(<Escudo equipe={null} />);
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(container.querySelector('path')).toHaveAttribute('stroke-dasharray');
  });
});
