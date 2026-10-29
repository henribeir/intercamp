// ============================================================
// Gera um "slug": texto seguro para URLs.
// Ex.: "301 INT" -> "301-int"   |   "Vôlei de Praia" -> "volei-de-praia"
// ============================================================
export function gerarSlug(texto) {
  return texto
    .normalize('NFD') // separa letras dos acentos: "ô" -> "o" + "^"
    .replace(/[̀-ͯ]/g, '') // remove os acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // qualquer outro caractere vira hífen
    .replace(/^-+|-+$/g, ''); // tira hífens das pontas
}
