// ============================================================
// APP: mapa de rotas. Todas as telas ficam dentro do Layout
// (conteúdo + barra inferior). Usamos HashRouter (main.jsx)
// porque o GitHub Pages não conhece as rotas do React:
// as URLs ficam assim: .../#/jogos/12
// ============================================================
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RotaMestre from './components/mestre/RotaMestre';

import Inicio from './pages/Inicio';
import Jogos from './pages/Jogos';
import JogoDetalhe from './pages/JogoDetalhe';
import Classificacao from './pages/Classificacao';
import Chaveamento from './pages/Chaveamento';
import Mais from './pages/Mais';
import Equipes from './pages/Equipes';
import EquipeDetalhe from './pages/EquipeDetalhe';
import Calendario from './pages/Calendario';
import Noticias from './pages/Noticias';
import NoticiaDetalhe from './pages/NoticiaDetalhe';
import Regras from './pages/Regras';
import TabelaOficial from './pages/TabelaOficial';
import Sobre from './pages/Sobre';
import PaginaSimples from './pages/PaginaSimples';

import MestrePainel from './pages/mestre/MestrePainel';
import MestreJogo from './pages/mestre/MestreJogo';
import MestreConfrontos from './pages/mestre/MestreConfrontos';
import MestreNoticias from './pages/mestre/MestreNoticias';
import MestreTurmas from './pages/mestre/MestreTurmas';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Abas da barra inferior */}
        <Route index element={<Inicio />} />
        <Route path="jogos" element={<Jogos />} />
        <Route path="jogos/:id" element={<JogoDetalhe />} />
        <Route path="classificacao" element={<Classificacao />} />
        <Route path="chaveamento" element={<Chaveamento />} />
        <Route path="mais" element={<Mais />} />

        {/* Telas do menu "Mais" */}
        <Route path="equipes" element={<Equipes />} />
        <Route path="equipes/:id" element={<EquipeDetalhe />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="noticias" element={<Noticias />} />
        <Route path="noticias/:id" element={<NoticiaDetalhe />} />
        <Route path="regras" element={<Regras />} />
        <Route path="tabela" element={<TabelaOficial />} />
        <Route path="sobre" element={<Sobre />} />

        {/* Painel do mestre: sem login, RotaMestre mostra a tela de login */}
        <Route path="mestre" element={<RotaMestre />}>
          <Route index element={<MestrePainel />} />
          <Route path="jogos/:id" element={<MestreJogo />} />
          <Route path="confrontos" element={<MestreConfrontos />} />
          <Route path="noticias" element={<MestreNoticias />} />
          <Route path="turmas" element={<MestreTurmas />} />
        </Route>

        <Route path="*" element={<PaginaSimples titulo="Página não encontrada" voltar />} />
      </Route>
    </Routes>
  );
}
