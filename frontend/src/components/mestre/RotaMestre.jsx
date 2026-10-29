// ============================================================
// Protege as telas do mestre: sem login válido, mostra o login.
// Se a API responder 401 (token vencido), o token é apagado e
// esta tela volta sozinha para o login (veja api/client.js).
// ============================================================
import { Outlet } from 'react-router-dom';
import { useMestre } from '../../hooks/useMestre';
import MestreLogin from '../../pages/mestre/MestreLogin';

export default function RotaMestre() {
  const { logado } = useMestre();
  return logado ? <Outlet /> : <MestreLogin />;
}
