// ============================================================
// Tela simples com título e um aviso (usada para "Página não
// encontrada"). Leva de volta ao Início.
// ============================================================
import { Link } from 'react-router-dom';
import TituloPagina from '../components/TituloPagina';
import { Vazio } from '../components/Estados';

export default function PaginaSimples({ titulo, voltar = false }) {
  return (
    <>
      <TituloPagina titulo={titulo} voltar={voltar} />
      <Vazio titulo="Nada por aqui" texto="O endereço pode estar errado." />
      <Link to="/" className="mt-4 flex min-h-11 items-center justify-center text-sm font-semibold text-primaria-clara">
        Voltar ao Início
      </Link>
    </>
  );
}
