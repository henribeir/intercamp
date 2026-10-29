@echo off
REM ============================================================
REM InterCamp - assistente para colocar no ar (Windows)
REM Dois cliques: cria o backend\.env, carrega os jogos no Neon
REM e mostra o que colar no Render. (veja o GUIA-PUBLICAR.md)
REM ============================================================
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale o Node.js 22 em https://nodejs.org
  pause
  exit /b 1
)
if not exist "backend\node_modules\.package-lock.json" (
  echo ^>^>^> Instalando as dependencias do backend ^(so na 1a vez^)...
  cd backend
  set "npm_config_cache=%~dp0.cache-npm"
  call npm install
  if errorlevel 1 (
    echo ERRO: falha ao instalar as dependencias.
    pause
    exit /b 1
  )
  cd ..
)
cd backend
node scripts\configurar.js
pause
