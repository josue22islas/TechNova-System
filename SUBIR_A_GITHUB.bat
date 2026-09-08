@echo off
setlocal
title Actualizar TechNova System en GitHub
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0subir-a-github.ps1"
set "RESULTADO=%ERRORLEVEL%"
echo.
pause
exit /b %RESULTADO%
