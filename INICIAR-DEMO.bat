@echo off
REM ============================================================
REM InterCamp - modo demonstração (Windows)
REM Dois cliques neste arquivo: instala, liga a API e o site
REM e abre o navegador. Para parar, feche esta janela.
REM ============================================================
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao encontrado. Instale o Node.js 22 em https://nodejs.org
  echo e depois de dois cliques neste arquivo de novo.
  echo.
  pause
  exit /b 1
)
node iniciar-demo.mjs
pause
