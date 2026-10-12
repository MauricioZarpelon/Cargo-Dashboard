@echo off
setlocal
cd /d "%~dp0"
title Publicar Painel de Cargas
echo ============================================
echo   Publicar o Painel de Cargas (Firebase Hosting)
echo ============================================
echo.
where node >nul 2>nul || (echo ERRO: o Node.js nao foi encontrado. & goto :fim)
where firebase >nul 2>nul || (echo ERRO: o Firebase CLI nao foi encontrado. Rode: npm install -g firebase-tools & goto :fim)
if not exist fonteirebase-config.json (echo ERRO: crie fonteirebase-config.json a partir de fonteirebase-config.example.json & goto :fim)
if not exist .firebaserc (echo ERRO: crie .firebaserc a partir de .firebaserc.example & goto :fim)
echo [1/2] Montando o painel ...
node fonteuild.js publicindex.html fonteirebase-config.json
if errorlevel 1 (echo ERRO ao montar. Nada foi publicado. & goto :fim)
echo.
echo [2/2] Publicando no Firebase ...
call firebase deploy --only hosting
if errorlevel 1 (echo ERRO ao publicar. & goto :fim)
echo.
echo PRONTO. Abra o site e aperte Ctrl+F5 para ver a versao nova.
:fim
echo.
pause
