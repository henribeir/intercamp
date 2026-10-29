#!/bin/bash
# ============================================================
# InterCamp - modo demonstração (Mac)
# Dois cliques neste arquivo: instala, liga a API e o site
# e abre o navegador. Deixe a janela do Terminal ABERTA
# enquanto usa o site. Para parar, feche a janela.
#
# Na 1ª vez o Mac pode bloquear. Aí: botão direito no arquivo
# -> Abrir -> Abrir (veja o README, seção 3).
# ============================================================

# Vai para a pasta onde este arquivo está
cd "$(dirname "$0")" || exit 1

# O Terminal aberto por duplo clique às vezes não acha o Node:
# incluímos as pastas onde o instalador e o Homebrew o colocam
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# O macOS protege as pastas Transferências (Downloads), Mesa e Documentos:
# sem permissão, o Terminal nem consegue ler a pasta ("operation not permitted")
if ! ls . >/dev/null 2>&1; then
  echo ""
  echo "O macOS não deixou o Terminal abrir esta pasta:"
  echo "  $(dirname "$0")"
  echo ""
  echo "Resolva de UM destes jeitos:"
  echo "  1. Mova a pasta do InterCamp para a sua pasta pessoal (a da casinha,"
  echo "     no Finder: menu Ir > Início) e dê dois cliques neste arquivo de novo."
  echo "  2. Ou libere o acesso: Ajustes do Sistema > Privacidade e Segurança >"
  echo "     Arquivos e Pastas > Terminal > ligue a pasta (ex.: Transferências)."
  echo "     Depois feche o Terminal (Cmd+Q) e tente de novo."
  echo ""
  read -r -p "Aperte Enter para fechar..."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "Node.js não encontrado. Instale o Node.js 22 em https://nodejs.org"
  echo "e depois dê dois cliques neste arquivo de novo."
  echo ""
  read -r -p "Aperte Enter para fechar..."
  exit 1
fi

node iniciar-demo.mjs

# Se chegou aqui, algo parou: mantém a janela aberta para ler o erro
echo ""
read -r -p "Aperte Enter para fechar..."
