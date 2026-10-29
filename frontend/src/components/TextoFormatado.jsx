// ============================================================
// Mostra um texto escrito em um "markdown" bem simples
// (arquivos de src/content). Entende:
//   # Título          ## Subtítulo
//   - item de lista
//   **negrito**
//   linha em branco = novo parágrafo
// ============================================================

/** Troca **texto** por <strong>texto</strong> */
function comNegrito(texto) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, indice) =>
    parte.startsWith('**') && parte.endsWith('**') ? <strong key={indice}>{parte.slice(2, -2)}</strong> : parte,
  );
}

/** Agrupa as linhas em blocos: títulos, listas e parágrafos */
function separarBlocos(texto) {
  const blocos = [];
  for (const linha of texto.replace(/\r/g, '').split('\n')) {
    const limpa = linha.trim();
    const anterior = blocos.at(-1);

    if (!limpa) {
      blocos.push({ tipo: 'quebra' });
    } else if (limpa.startsWith('## ')) {
      blocos.push({ tipo: 'h3', texto: limpa.slice(3) });
    } else if (limpa.startsWith('# ')) {
      blocos.push({ tipo: 'h2', texto: limpa.slice(2) });
    } else if (limpa.startsWith('- ')) {
      if (anterior?.tipo === 'lista') anterior.itens.push(limpa.slice(2));
      else blocos.push({ tipo: 'lista', itens: [limpa.slice(2)] });
    } else if (anterior?.tipo === 'p') {
      anterior.texto += ` ${limpa}`;
    } else {
      blocos.push({ tipo: 'p', texto: limpa });
    }
  }
  return blocos.filter((bloco) => bloco.tipo !== 'quebra');
}

export default function TextoFormatado({ texto }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-texto/90">
      {separarBlocos(texto).map((bloco, indice) => {
        if (bloco.tipo === 'h2') {
          return (
            <h2 key={indice} className="mt-3 font-display text-2xl font-bold tracking-wide text-texto">
              {bloco.texto}
            </h2>
          );
        }
        if (bloco.tipo === 'h3') {
          return (
            <h3 key={indice} className="mt-2 font-semibold text-texto">
              {bloco.texto}
            </h3>
          );
        }
        if (bloco.tipo === 'lista') {
          return (
            <ul key={indice} className="flex list-disc flex-col gap-1.5 pl-5 marker:text-primaria-clara">
              {bloco.itens.map((item, n) => (
                <li key={n}>{comNegrito(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={indice}>{comNegrito(bloco.texto)}</p>;
      })}
    </div>
  );
}
