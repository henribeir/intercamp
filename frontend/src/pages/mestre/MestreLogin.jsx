// ============================================================
// LOGIN DO MESTRE (e-mail e senha).
// Mensagens claras para cada problema: senha errada, muitas
// tentativas, sem internet ou sessão expirada.
// ============================================================
import { useState } from 'react';
import { api } from '../../api/client';
import { useMestre } from '../../hooks/useMestre';
import TituloPagina from '../../components/TituloPagina';
import BotaoMestre from '../../components/mestre/BotaoMestre';
import { Campo } from '../../components/mestre/Campos';

const LOGO = `${import.meta.env.BASE_URL}brand/logo.png`;

function mensagemDoErro(erro) {
  if (erro.status === 401) return 'E-mail ou senha incorretos.';
  if (erro.status === 429) return 'Muitas tentativas. Espere 15 minutos e tente de novo.';
  if (erro.status === 400) return 'Confira o e-mail digitado.';
  return erro.message;
}

export default function MestreLogin() {
  const { sessaoExpirou } = useMestre();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function entrar(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await api.entrar(email.trim(), senha);
      // Deu certo: o token foi salvo e a RotaMestre mostra o painel sozinha
    } catch (falha) {
      setErro(mensagemDoErro(falha));
      setEnviando(false);
    }
  }

  return (
    <>
      <TituloPagina titulo="Área do mestre" voltar />

      <div className="mb-6 flex flex-col items-center text-center">
        <img src={LOGO} alt="" className="h-20 w-auto mix-blend-screen" />
        <p className="mt-2 text-sm text-texto-2">Entre para atualizar placares, confrontos e notícias.</p>
      </div>

      {sessaoExpirou && !erro && (
        <p role="status" className="mb-4 rounded-xl border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta">
          Sua sessão expirou. Entre de novo para continuar.
        </p>
      )}

      <form onSubmit={entrar} className="flex flex-col gap-4 rounded-3xl border border-borda bg-superficie p-5" noValidate>
        <Campo
          rotulo="E-mail"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <Campo
            rotulo="Senha"
            type={verSenha ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm text-texto-2">
            <input type="checkbox" checked={verSenha} onChange={(e) => setVerSenha(e.target.checked)} className="h-5 w-5 accent-primaria" />
            Mostrar senha
          </label>
        </div>

        {erro && (
          <p role="alert" className="rounded-xl bg-ao-vivo/15 px-4 py-3 text-sm font-medium text-ao-vivo">
            {erro}
          </p>
        )}

        <BotaoMestre type="submit" variante="primaria" carregando={enviando} disabled={!email || !senha}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </BotaoMestre>
      </form>
    </>
  );
}
