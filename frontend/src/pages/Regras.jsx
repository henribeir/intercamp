// ============================================================
// REGRAS DO TORNEIO: o texto fica em src/content/regras.md.
// Para mudar, basta editar aquele arquivo (não precisa mexer aqui).
// ============================================================
import TituloPagina from '../components/TituloPagina';
import TextoFormatado from '../components/TextoFormatado';
import regras from '../content/regras.md?raw'; // "?raw" = importa o arquivo como texto

export default function Regras() {
  return (
    <>
      <TituloPagina titulo="Regras do torneio" voltar />
      <TextoFormatado texto={regras} />
    </>
  );
}
