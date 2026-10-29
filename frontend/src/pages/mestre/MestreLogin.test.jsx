// ============================================================
// Login do mestre: mensagens claras quando dá erro.
// O fetch é trocado por um "dublê" que responde o que queremos.
// ============================================================
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MestreLogin from './MestreLogin';

/** Faz o fetch responder com este status e corpo JSON */
function respostaDaApi(status, corpo) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } }),
  );
}

async function preencherEEntrar(senha = 'senha-errada') {
  const usuario = userEvent.setup();
  render(
    <MemoryRouter>
      <MestreLogin />
    </MemoryRouter>,
  );
  await usuario.type(screen.getByLabelText('E-mail'), 'mestre@intercamp.com');
  await usuario.type(screen.getByLabelText('Senha'), senha);
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('Login do mestre', () => {
  it('o botão Entrar começa desligado até preencher e-mail e senha', () => {
    render(
      <MemoryRouter>
        <MestreLogin />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('senha errada (401): mostra "E-mail ou senha incorretos." e não guarda token', async () => {
    const fetchFalso = respostaDaApi(401, { erro: 'E-mail ou senha incorretos' });
    await preencherEEntrar();

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(localStorage.getItem('mestre_token')).toBeNull();

    // Conferindo o que foi enviado para a API
    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toBe('http://api.teste/api/auth/login');
    expect(JSON.parse(opcoes.body)).toEqual({ email: 'mestre@intercamp.com', senha: 'senha-errada' });
  });

  it('muitas tentativas (429): pede para esperar', async () => {
    respostaDaApi(429, { erro: 'Muitas tentativas de login.' });
    await preencherEEntrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Espere 15 minutos');
  });

  it('sem internet: avisa que não conseguiu falar com o servidor', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await preencherEEntrar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão com o servidor');
  });

  it('o botão volta a funcionar depois do erro (dá para tentar de novo)', async () => {
    respostaDaApi(401, { erro: 'E-mail ou senha incorretos' });
    await preencherEEntrar();
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });
});
