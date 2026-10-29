#!/bin/bash
# ============================================================
# InterCamp - assistente para colocar no ar (Mac)
# Dois cliques: pergunta os dados do Neon, do GitHub e do
# mestre, cria o backend/.env, carrega os jogos no Neon e
# mostra o que colar no Render. (veja o GUIA-PUBLICAR.md)
# ============================================================
cd "$(dirname "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

pausar() { echo ""; read -r -p "Aperte Enter para fechar..."; }

if ! ls . >/dev/null 2>&1; then
  echo "O macOS não deixou o Terminal abrir esta pasta. Veja o README, seção 13."
  pausar; exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node.js 22 em https://nodejs.org"
  pausar; exit 1
fi

# Instala as dependências do back-end, se ainda não estiverem instaladas
# (cache dentro do projeto, como no INICIAR-DEMO)
if [ ! -f backend/node_modules/.package-lock.json ]; then
  echo ">>> Instalando as dependências do backend (só na 1ª vez)..."
  if ! (cd backend && npm_config_cache="$PWD/../.cache-npm" npm install); then
    echo "ERRO: falha ao instalar as dependências."
    pausar; exit 1
  fi
fi

cd backend && node scripts/configurar.js
pausar
